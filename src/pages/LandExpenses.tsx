import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Receipt, Calendar, MapPin, DollarSign, Edit, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddLandExpenseModal from "@/components/AddLandExpenseModal";
import EditLandExpenseModal from "@/components/EditLandExpenseModal";
import { MultiBillImages } from "@/components/ui/multi-bill-images";
import { useCropStore } from "@/store/supabaseCropStore";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Crop, Expense, Income, LandExpense } from "@/types/crop";
import { toast } from "sonner";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

const LandExpenses = () => {
  const navigate = useNavigate();
  const { landExpenses, loadLandExpenses, deleteLandExpense } = useCropStore();
  const { t } = useTranslation();
  const { colorScheme } = useTheme();
  
  const [showAddLandExpense, setShowAddLandExpense] = useState(false);
  const [showEditLandExpense, setShowEditLandExpense] = useState(false);
  const [selectedLandExpense, setSelectedLandExpense] = useState<LandExpense | null>(null);

  useEffect(() => {
    loadLandExpenses();
  }, [loadLandExpenses]);

  const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const handleDeleteLandExpense = async (expenseId: string) => {
    try {
      await deleteLandExpense(expenseId);
      toast.success("Land expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete land expense");
    }
  };

  const getColorSchemeClasses = () => {
    const colorSchemes = {
      green: "bg-green-50 dark:bg-green-950",
      blue: "bg-blue-50 dark:bg-blue-950", 
      purple: "bg-purple-50 dark:bg-purple-950",
      orange: "bg-orange-50 dark:bg-orange-950",
      red: "bg-red-50 dark:bg-red-950"
    };
    return colorSchemes[colorScheme];
  };

  const landExpenseCategories = [
    'Land Rent',
    'Land Preparation',
    'Irrigation Setup',
    'Fencing',
    'Road Construction',
    'Storage Facility',
    'Equipment Purchase',
    'Maintenance',
    'Other'
  ];

  return (
    <div className={`min-h-screen ${getColorSchemeClasses()}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-blue-950/80 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Land Expenses</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🏗️</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                    Land Expenses
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Manage your land-related expenses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddLandExpense(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Land Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="shrink-0"
                >
                  <span className="text-lg mr-2">👤</span>
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile breadcrumb */}
          <div className="sm:hidden pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Land Expenses</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Summary & Stats */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="text-xl sm:text-2xl">📊</span>
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium">Total Land Expenses</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {formatCurrency(totalLandExpenses)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Total Records:</span>
                    <span className="font-medium">{landExpenses.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="font-medium">
                      {landExpenses.length > 0 
                        ? formatDate(landExpenses[0].createdAt) 
                        : 'No records'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {landExpenseCategories.map((category) => {
                    const categoryExpenses = landExpenses.filter(exp => exp.category === category);
                    const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    
                    if (categoryTotal === 0) return null;
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                        <span className="text-xs sm:text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-blue-600 font-bold">
                            {formatCurrency(categoryTotal)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryExpenses.length}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Land Expenses List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Land Expense Records</CardTitle>
              </CardHeader>
              <CardContent>
                {landExpenses.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <Receipt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No land expenses yet</h3>
                    <p className="text-sm sm:text-base mb-4">Start tracking your land-related expenses to get a complete picture of your farm costs.</p>
                    <Button
                      onClick={() => setShowAddLandExpense(true)}
                      className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Land Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {landExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                            <h3 className="font-medium text-sm sm:text-base truncate">{expense.category}</h3>
                            <Badge variant="secondary" className="text-xs w-fit">
                              {formatDate(expense.date)}
                            </Badge>
                          </div>
                          {expense.description && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                              {expense.description}
                            </p>
                          )}
                          {/* Payment Status Badge */}
                          <div className="mt-2 mb-2">
                            <PaymentStatusBadge 
                              status={expense.paymentStatus}
                              amount={expense.amount}
                              paidAmount={expense.paidAmount}
                              className="text-xs"
                            />
                          </div>
                          {expense.bill_image_url && expense.bill_image_url.length > 0 && (
                            <div className="mt-2">
                              <MultiBillImages imageUrls={expense.bill_image_url} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3">
                          <span className="text-base sm:text-lg font-bold text-blue-600">
                            {formatCurrency(expense.amount)}
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLandExpense(expense);
                                setShowEditLandExpense(true);
                              }}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('actions.delete_land_expense')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('messages.delete_land_expense_confirmation')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLandExpense(expense.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('actions.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddLandExpenseModal open={showAddLandExpense} onOpenChange={setShowAddLandExpense} />
      {selectedLandExpense && (
        <EditLandExpenseModal
          expense={selectedLandExpense}
          open={showEditLandExpense}
          onOpenChange={setShowEditLandExpense}
        />
      )}
    </div>
  );
};

export default LandExpenses; 