import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown, PieChart, Settings, LogOut, Bell, Sparkles, AlertTriangle, Download, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CropCard from "@/components/CropCard";
import AddExpenseModal from "@/components/AddExpenseModal";
import AddIncomeModal from "@/components/AddIncomeModal";
import AddLandExpenseModal from "@/components/AddLandExpenseModal";

import LandExpensesView from "@/components/LandExpensesView";
import AuthModal from "@/components/AuthModal";
import EditLandExpenseModal from "@/components/EditLandExpenseModal";
import DynamicDashboardWithChart from "@/components/DynamicDashboard";
import AdvancedCropFilter from "@/components/AdvancedCropFilter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
// import AIChatDialog from "@/components/AIChatDialog";
import FloatingAIChatbot from "@/components/FloatingAIChatbot";
import RecommendationsGrid from "@/components/RecommendationsGrid";

import { useCropStore } from "@/store/supabaseCropStore";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useTheme } from "@/contexts/ThemeContext";
import { Crop, LandExpense } from "@/types/crop";
// AI recommendations removed - now using n8n workflow for chatbot

import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { crops, landExpenses, loadCrops, loadLandExpenses } = useCropStore();
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useTranslation();
  const { colorScheme, isDark } = useTheme();
  const { isConnected } = useRealTimeData();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddLandExpense, setShowAddLandExpense] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showEditLandExpense, setShowEditLandExpense] = useState(false);
  const [selectedLandExpense, setSelectedLandExpense] = useState<LandExpense | null>(null);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>(crops);
  const [showTipsDialog, setShowTipsDialog] = useState(false);
  // const [showAIChat, setShowAIChat] = useState(false);

  const cropIdForAction = useRef<string | null>(null);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (user) {
      loadCrops();
      loadLandExpenses();
    }
  }, [user, loadCrops, loadLandExpenses]);

  useEffect(() => {
    setFilteredCrops(crops);
  }, [crops]);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleOpenAddExpense = (e: any) => {
      cropIdForAction.current = e.detail.cropId;
      setShowAddExpense(true);
    };
    const handleOpenAddIncome = (e: any) => {
      cropIdForAction.current = e.detail.cropId;
      setShowAddIncome(true);
    };
    const handleOpenAddLandExpense = () => {
      setShowAddLandExpense(true);
    };
    window.addEventListener('openAddExpense', handleOpenAddExpense);
    window.addEventListener('openAddIncome', handleOpenAddIncome);
    window.addEventListener('openAddLandExpense', handleOpenAddLandExpense);
    return () => {
      window.removeEventListener('openAddExpense', handleOpenAddExpense);
      window.removeEventListener('openAddIncome', handleOpenAddIncome);
      window.removeEventListener('openAddLandExpense', handleOpenAddLandExpense);
    };
  }, []);

  const totalCropProfit = crops.reduce((sum, crop) => {
    const income = crop.income.reduce((total, inc) => total + inc.amount, 0);
    const expenses = crop.expenses.reduce((total, exp) => total + exp.amount, 0);
    return sum + (income - expenses);
  }, 0);

  const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalCropProfit - totalLandExpenses;

  const handleCropClick = (crop: Crop) => {
    navigate(`/crop/${crop.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(t('auth.sign_out') + " " + t('messages.success').toLowerCase());
  };



  const getColorSchemeClasses = () => {
    const baseClasses = "min-h-screen p-2 sm:p-4";
    const colorSchemes = {
      green: "bg-green-50 dark:bg-green-950",
      blue: "bg-blue-50 dark:bg-blue-950", 
      purple: "bg-purple-50 dark:bg-purple-950",
      orange: "bg-orange-50 dark:bg-orange-950",
      red: "bg-red-50 dark:bg-red-950"
    };
    return `${baseClasses} ${colorSchemes[colorScheme]}`;
  };

  // Simple recommendations based on data
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const tips: string[] = [];
    
    // Check for missing data
    const cropsWithoutExpenses = crops.filter(crop => crop.expenses.length === 0);
    if (cropsWithoutExpenses.length > 0) {
      tips.push(`You have ${cropsWithoutExpenses.length} crops without recorded expenses. Add expenses to get accurate profit calculations.`);
    }
    
    // Check for high expenses
    const totalExpenses = crops.flatMap(crop => crop.expenses).reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpensePerCrop = totalExpenses / Math.max(crops.length, 1);
    if (avgExpensePerCrop > 50000) {
      tips.push("Your average expense per crop is high. Consider reviewing your input costs and looking for bulk purchase opportunities.");
    }
    
    // Seasonal advice
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 5) {
      tips.push("It's the main growing season. Monitor your crops regularly and record all expenses for accurate profit tracking.");
    }
    
    if (tips.length === 0) {
      tips.push("Great job tracking your farm data! Keep recording expenses and income for better insights.");
    }
    
    setRecommendations(tips);
  }, [crops]);

  if (authLoading) {
    return (
      <div className={getColorSchemeClasses() + " flex items-center justify-center px-4"}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <p className="text-green-600 dark:text-green-400">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={getColorSchemeClasses() + " flex items-center justify-center min-h-screen p-4"}>
        <AuthModal open={true} onOpenChange={() => {}} />
      </div>
    );
  }

  return (
    <div className={getColorSchemeClasses() + " flex flex-col min-h-screen"}>
      {/* Minimal Header */}
      <header className="w-full flex items-center justify-between py-4 px-2 sm:px-6 mb-4 bg-white/80 dark:bg-green-950/80 shadow-sm rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <span className="text-xl font-bold text-green-800 dark:text-green-200 tracking-wide">{t('ananth_farms')}</span>
        </div>
        <div className="flex gap-2">
          {/* Language Switcher */}
          {/* <LanguageSwitcher /> */}

          

          {/* AI Tips Bell */}
          <Dialog open={showTipsDialog} onOpenChange={setShowTipsDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 relative"
              >
                <Bell className="w-4 h-4" />
                {recommendations.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {recommendations.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  {t('ai.smart_tips')}
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <Alert key={index} className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        {recommendation}
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t('ai.no_tips')}</p>
                    <p className="text-sm">{t('ai.keep_using')}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Install App Button in header */}
          {deferredPrompt && !isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstallClick}
              className="shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950/20"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t('actions.install_app')}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="shrink-0"
          >
            <span className="text-lg mr-2">👤</span>
            <span className="sr-only sm:not-sr-only">{t('actions.profile')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/payments')}
            className="shrink-0"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('actions.payments')}</span>
          </Button>
        </div>
      </header>


      {/* Dashboard Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-8">
        <DynamicDashboardWithChart onCropSelect={handleCropClick} />
        {recommendations.length > 0 && (
          <RecommendationsGrid tips={recommendations} className="mb-6" onNavigate={(route) => navigate(route)} />
        )}
        
        
      </main>
      {/* Modals */}
      <AddExpenseModal open={showAddExpense} onOpenChange={setShowAddExpense} cropId={cropIdForAction.current} />
      <AddIncomeModal open={showAddIncome} onOpenChange={setShowAddIncome} cropId={cropIdForAction.current} />
      <AddLandExpenseModal open={showAddLandExpense} onOpenChange={setShowAddLandExpense} />

      {/* AI Assistant Dialog removed in favor of FloatingAIChatbot */}

      {selectedLandExpense && (
        <EditLandExpenseModal
          expense={selectedLandExpense}
          open={showEditLandExpense}
          onOpenChange={(open) => {
            setShowEditLandExpense(open);
            if (!open) setSelectedLandExpense(null);
          }}
        />
      )}

      {/* Floating AI Chatbot (renders globally) */}
      <FloatingAIChatbot />
    </div>
  );
};

export default Index;
