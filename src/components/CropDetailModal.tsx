import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trash2, Calendar, MapPin, Edit } from "lucide-react";
import { Crop, Expense, Income } from "@/types/crop";
import { useCropStore } from "@/store/supabaseCropStore";
import { getExpenseCategoryIcon } from "@/utils/cropExpenseCategories";
import { MultiBillImages } from "@/components/ui/multi-bill-images";
import { toast } from "sonner";
import EditCropModal from "./EditCropModal";
import EditExpenseModal from "./EditExpenseModal";
import EditIncomeModal from "./EditIncomeModal";
import { useTranslation } from "react-i18next";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

interface CropDetailModalProps {
  crop: Crop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CropDetailModal = ({ crop, open, onOpenChange }: CropDetailModalProps) => {
  const { deleteExpense, deleteIncome, deleteCrop } = useCropStore();
  const [showEditCrop, setShowEditCrop] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showEditIncome, setShowEditIncome] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  
  const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalIncome - totalExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(crop.id, expenseId);
      toast.success("Expense deleted");
    }
  };

  const handleDeleteIncome = (incomeId: string) => {
    if (confirm("Are you sure you want to delete this income?")) {
      deleteIncome(crop.id, incomeId);
      toast.success("Income deleted");
    }
  };

  const handleDeleteCrop = () => {
    if (confirm(`Are you sure you want to delete ${crop.name}? This will remove all associated expenses and income records.`)) {
      deleteCrop(crop.id);
      toast.success(`${crop.name} deleted successfully`);
      onOpenChange(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditExpense(true);
  };

  const handleEditIncome = (income: Income) => {
    setSelectedIncome(income);
    setShowEditIncome(true);
  };

  const { t } = useTranslation();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🌾</span>
                <div>
                  <h2 className="text-xl sm:text-2xl">{crop.name}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                    <Badge variant="secondary" className="w-fit">{crop.type}</Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      {crop.landArea} {crop.landUnit}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Sown: {formatDate(crop.sowingDate)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditCrop(true)}
                  className="text-xs sm:text-sm"
                >
                  {t('actions.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCrop}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t('actions.delete')}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">Total Income</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-1">
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">Net Profit/Loss</p>
                <div className={`flex items-center justify-center gap-1 text-lg sm:text-2xl font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profit >= 0 ? (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  ₹{Math.abs(profit).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 mb-4 justify-end">
            <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('openAddExpense', { detail: { cropId: crop.id } }))}>
              + Add Expense
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('openAddIncome', { detail: { cropId: crop.id } }))}>
              + Add Income
            </Button>
          </div>

          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses ({crop.expenses.length})</TabsTrigger>
              <TabsTrigger value="income" className="text-xs sm:text-sm">Income ({crop.income.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="space-y-3 sm:space-y-4 mt-4">
              {crop.expenses.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-2">📉</div>
                  <p className="text-sm sm:text-base text-gray-600">No expenses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {crop.expenses.map((expense) => (
                    <Card key={expense.id} className="w-full max-w-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
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
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-1 items-center ml-2">
                          <Button variant="ghost" size="sm" className="w-10 h-10" aria-label={t('actions.edit')} onClick={() => handleEditExpense(expense)}>
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-10 h-10 text-red-600 hover:bg-red-50" aria-label={t('actions.delete')} onClick={() => handleDeleteExpense(expense.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="income" className="space-y-3 sm:space-y-4 mt-4">
              {crop.income.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-2">📈</div>
                  <p className="text-sm sm:text-base text-gray-600">No income recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {crop.income.map((income) => (
                    <Card key={income.id} className="w-full max-w-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
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
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-1 items-center ml-2">
                          <Button variant="ghost" size="sm" className="w-10 h-10" aria-label={t('actions.edit')} onClick={() => handleEditIncome(income)}>
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-10 h-10 text-red-600 hover:bg-red-50" aria-label={t('actions.delete')} onClick={() => handleDeleteIncome(income.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Modals */}
      {showEditCrop && (
        <EditCropModal
          crop={crop}
          open={showEditCrop}
          onOpenChange={setShowEditCrop}
        />
      )}
      {selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          open={showEditExpense}
          onOpenChange={(open) => {
            setShowEditExpense(open);
            if (!open) setSelectedExpense(null);
          }}
        />
      )}
      {selectedIncome && (
        <EditIncomeModal
          income={selectedIncome}
          open={showEditIncome}
          onOpenChange={(open) => {
            setShowEditIncome(open);
            if (!open) setSelectedIncome(null);
          }}
        />
      )}
    </>
  );
};

export default CropDetailModal;
