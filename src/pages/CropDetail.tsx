import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, TrendingUp, TrendingDown, Calendar, MapPin, DollarSign, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddExpenseModal from "@/components/AddExpenseModal";
import AddIncomeModal from "@/components/AddIncomeModal";
import EditCropModal from "@/components/EditCropModal";
import EditExpenseModal from "@/components/EditExpenseModal";
import EditIncomeModal from "@/components/EditIncomeModal";
import { MultiBillImages } from "@/components/ui/multi-bill-images";
import { useCropStore } from "@/store/supabaseCropStore";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Crop, Expense, Income } from "@/types/crop";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { getExpenseCategoryIcon } from '@/utils/cropExpenseCategories';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

const CropDetail = () => {
  const { cropId } = useParams<{ cropId: string }>();
  const navigate = useNavigate();
  const { crops, loadCrops, deleteExpense, deleteIncome, deleteCrop, reorderExpense, reorderIncome } = useCropStore();
  const { t } = useTranslation();
  const { colorScheme } = useTheme();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showEditCrop, setShowEditCrop] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showEditIncome, setShowEditIncome] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const crop = crops.find(c => c.id === cropId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor)
  );

  // Drag-and-drop handlers for expenses
  const [expenseItems, setExpenseItems] = useState(crop?.expenses.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || []);
  useEffect(() => {
    setExpenseItems(crop?.expenses.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || []);
  }, [crop?.expenses]);

  const handleExpenseDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = expenseItems.findIndex(item => item.id === active.id);
      const newIndex = expenseItems.findIndex(item => item.id === over.id);
      const newItems = arrayMove(expenseItems, oldIndex, newIndex);
      setExpenseItems(newItems);
      // Update order in DB for all items
      await Promise.all(newItems.map((item, idx) =>
        reorderExpense(crop?.id, item.id, idx)
      ));
      await loadCrops();
    }
  };

  // Drag-and-drop handlers for incomes
  const [incomeItems, setIncomeItems] = useState(crop?.income.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || []);
  useEffect(() => {
    setIncomeItems(crop?.income.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || []);
  }, [crop?.income]);

  const handleIncomeDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = incomeItems.findIndex(item => item.id === active.id);
      const newIndex = incomeItems.findIndex(item => item.id === over.id);
      const newItems = arrayMove(incomeItems, oldIndex, newIndex);
      setIncomeItems(newItems);
      // Update order in DB for all items
      await Promise.all(newItems.map((item, idx) =>
        reorderIncome(crop?.id, item.id, idx)
      ));
      await loadCrops();
    }
  };

  // Sortable item wrapper
  function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 100 : undefined,
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  }

  useEffect(() => {
    if (!crop && crops.length > 0) {
      // Crop not found, redirect to home
      navigate('/');
      toast.error("Crop not found");
    }
  }, [crop, crops, navigate]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(cropId!, expenseId);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      await deleteIncome(cropId!, incomeId);
      toast.success("Income deleted successfully");
    } catch (error) {
      toast.error("Failed to delete income");
    }
  };

  const handleDeleteCrop = async () => {
    try {
      await deleteCrop(cropId!);
      toast.success("Crop deleted successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete crop");
    }
  };

  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <p className="text-green-600 dark:text-green-400">Loading crop details...</p>
        </div>
      </div>
    );
  }

  const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalIncome - totalExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
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

  return (
    <div className={`min-h-screen ${getColorSchemeClasses()}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-green-950/80 shadow-sm border-b">
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
                <span className="text-green-600 dark:text-green-400 font-medium">{crop.name}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🌾</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                    {crop.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {crop.type} • {crop.landArea} {t(crop.landUnit)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditCrop(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('actions.edit_crop')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('actions.delete_crop')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Crop</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('messages.delete_crop_confirmation')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteCrop}
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
          {/* Mobile breadcrumb */}
          <div className="sm:hidden pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{crop.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Crop Info & Stats */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Crop Overview Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="text-xl sm:text-2xl">🌾</span>
                  Crop Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                    <p className="text-sm sm:text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                    <p className="text-sm sm:text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
                {/* Crop-wise Financial Chart */}
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[{
                      name: crop.name,
                      Income: totalIncome,
                      Expenses: totalExpenses,
                    }]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Income" fill="#16a34a" />
                      <Bar dataKey="Expenses" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`text-center p-3 sm:p-4 rounded-lg ${
                  profit >= 0 
                    ? 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {profit >= 0 ? (
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {profit >= 0 ? t('profit') : t('loss')}
                    </span>
                  </div>
                  <p className={`text-lg sm:text-2xl font-bold ${
                    profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(profit))}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Sowing Date:</span>
                    <span className="font-medium">{formatDate(crop.sowingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Land Area:</span>
                    <span className="font-medium">{crop.landArea} {t(crop.landUnit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowAddIncome(true)}
                  className="w-full bg-green-600 hover:bg-green-700 h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('actions.add_income')}
                </Button>
                <Button
                  onClick={() => setShowAddExpense(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('actions.add_expense')}
                </Button>
                <Button
                  onClick={() => navigate('/add-crop')}
                  variant="outline"
                  className="w-full h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('actions.add_another_crop')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs for Income & Expenses */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
                <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('tabs.expenses')}</span>
                  <span className="sm:hidden">{t('tabs.expenses')}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {crop.expenses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('tabs.income')}</span>
                  <span className="sm:hidden">{t('tabs.income')}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {crop.income.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="mt-4 sm:mt-6">
                <Card>
                  <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-2">
                    <h2 className="text-lg sm:text-xl font-semibold">{t('cards.expense_records')}</h2>
                  </div>
                  <CardContent className="pt-0">
                    {expenseItems.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Receipt className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base">{t('messages.no_expense_records')}</p>
                        <Button
                          onClick={() => setShowAddExpense(true)}
                          className="mt-3 sm:mt-4 bg-red-600 hover:bg-red-700 text-white h-9 sm:h-10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('actions.add_first_expense')}
                        </Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {expenseItems.map((expense) => (
                          <li key={expense.id} className="w-full max-w-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex items-center gap-3 p-3 sm:p-4">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                              <span className="text-xl sm:text-2xl font-bold text-red-600">₹{expense.amount.toLocaleString()}</span>
                              <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getExpenseCategoryIcon(expense.category)}</span>
                                <span className="font-medium text-base truncate">{expense.category}</span>
                              </div>
                              {expense.description && (
                                <p className="text-xs text-gray-500 truncate mt-1">{expense.description}</p>
                              )}
                              {/* Payment Status Badge */}
                              <div className="mt-2">
                                <PaymentStatusBadge 
                                  status={expense.paymentStatus}
                                  amount={expense.amount}
                                  paidAmount={expense.paidAmount}
                                  className="text-xs"
                                />
                              </div>
                              {expense.bill_image_url && expense.bill_image_url.length > 0 && (
                                <MultiBillImages imageUrls={expense.bill_image_url} />
                              )}
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-1 items-center ml-2">
                              <Button variant="ghost" size="icon" className="w-10 h-10" aria-label={t('actions.edit')} onClick={() => { setSelectedExpense(expense); setShowEditExpense(true); }}>
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-10 h-10 text-red-600 hover:bg-red-50" aria-label={t('actions.delete')} onClick={() => {
                                if (window.confirm(t('messages.delete_expense_confirmation'))) {
                                  handleDeleteExpense(expense.id);
                                }
                              }}>
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="income" className="mt-4 sm:mt-6">
                <Card>
                  <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-2">
                    <h2 className="text-lg sm:text-xl font-semibold">{t('cards.income_records')}</h2>
                  </div>
                  <CardContent className="pt-0">
                    {incomeItems.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base">{t('messages.no_income_records')}</p>
                        <Button
                          onClick={() => setShowAddIncome(true)}
                          className="mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 h-9 sm:h-10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('actions.add_first_income')}
                        </Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {incomeItems.map((income) => (
                          <li key={income.id} className="w-full max-w-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex items-center gap-3 p-3 sm:p-4">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                              <span className="text-xl sm:text-2xl font-bold text-green-600">₹{income.amount.toLocaleString()}</span>
                              <span className="text-xs text-gray-400">{formatDate(income.date)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                <span className="font-medium text-base truncate">{income.source}</span>
                              </div>
                              {income.description && (
                                <p className="text-xs text-gray-500 truncate mt-1">{income.description}</p>
                              )}
                              {income.bill_image_url && income.bill_image_url.length > 0 && (
                                <MultiBillImages imageUrls={income.bill_image_url} />
                              )}
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-1 items-center ml-2">
                              <Button variant="ghost" size="icon" className="w-10 h-10" aria-label={t('actions.edit')} onClick={() => { setSelectedIncome(income); setShowEditIncome(true); }}>
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-10 h-10 text-red-600 hover:bg-red-50" aria-label={t('actions.delete')} onClick={() => {
                                if (window.confirm(t('messages.delete_income_confirmation'))) {
                                  handleDeleteIncome(income.id);
                                }
                              }}>
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal open={showAddExpense} onOpenChange={setShowAddExpense} cropId={cropId} />
      <AddIncomeModal open={showAddIncome} onOpenChange={setShowAddIncome} cropId={cropId} />
      <EditCropModal crop={crop} open={showEditCrop} onOpenChange={setShowEditCrop} />
      {selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          open={showEditExpense}
          onOpenChange={setShowEditExpense}
        />
      )}
      {selectedIncome && (
        <EditIncomeModal
          income={selectedIncome}
          open={showEditIncome}
          onOpenChange={setShowEditIncome}
        />
      )}
    </div>
  );
};

export default function CropDetailWithChart(props: any) {
  const { crops } = useCropStore();
  const { cropId } = useParams();
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return null;

  // Group income and expenses by month (YYYY-MM)
  const incomeByMonth: Record<string, number> = {};
  crop.income.forEach(inc => {
    const month = new Date(inc.date).toLocaleString('default', { year: 'numeric', month: 'short' });
    incomeByMonth[month] = (incomeByMonth[month] || 0) + inc.amount;
  });
  const expensesByMonth: Record<string, number> = {};
  crop.expenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleString('default', { year: 'numeric', month: 'short' });
    expensesByMonth[month] = (expensesByMonth[month] || 0) + exp.amount;
  });
  // Get all months present in either income or expenses
  const allMonths = Array.from(new Set([...Object.keys(incomeByMonth), ...Object.keys(expensesByMonth)])).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const chartData = allMonths.length > 0
    ? allMonths.map(month => ({
        month,
        Income: incomeByMonth[month] || 0,
        Expenses: expensesByMonth[month] || 0,
      }))
    : [{ month: crop.name, Income: crop.income.reduce((sum, inc) => sum + inc.amount, 0), Expenses: crop.expenses.reduce((sum, exp) => sum + exp.amount, 0) }];

  return (
    <>
      <CropDetail {...props} />
      <div className="w-full mt-8">
        <div className="h-full flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">{crop.name} Financial Trend</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">Income vs Expenses by Month</p>
          <ResponsiveContainer width="100%" minWidth={0} height={220} className="dashboard-chart-responsive">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barGap={8}
            >
              <defs>
                <linearGradient id="incomeGradientCrop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="expensesGradientCrop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} angle={-15} textAnchor="end" interval={0} height={50} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, marginBottom: 8 }} />
              <Bar dataKey="Income" fill="url(#incomeGradientCrop)" radius={[8, 8, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Expenses" fill="url(#expensesGradientCrop)" radius={[8, 8, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
} 