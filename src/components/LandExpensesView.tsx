import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { useCropStore } from "@/store/supabaseCropStore";
import { getLandExpenseCategoryIcon } from "@/utils/cropExpenseCategories";
import { toast } from "sonner";
import EditLandExpenseModal from './EditLandExpenseModal';
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LandExpensesView = () => {
  const { landExpenses, deleteLandExpense } = useCropStore();
  const [editExpense, setEditExpense] = useState(null);
  const { t } = useTranslation();
  
  const totalAmount = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteLandExpense(expenseId);
      toast.success("Land expense deleted");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  if (landExpenses.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="text-4xl sm:text-6xl mb-4">🏗️</div>
        <h3 className="text-base sm:text-lg font-semibold mb-2">No land expenses recorded</h3>
        <p className="text-sm sm:text-base text-gray-600">Add expenses for land development and infrastructure</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="bg-blue-50 border-l-4 border-l-blue-500">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-blue-800">Total Land Investment</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-blue-600">{landExpenses.length} expenses recorded</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 sm:space-y-3">
        {landExpenses.map((expense) => (
          <Card key={expense.id} className="w-full max-w-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{expense.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getLandExpenseCategoryIcon(expense.category)}</span>
                  <span className="font-medium text-base truncate">{expense.category}</span>
                </div>
                {expense.description && (
                  <p className="text-xs text-gray-500 truncate mt-1">{expense.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-1 items-center ml-2">
                <Button variant="ghost" size="sm" className="w-10 h-10" aria-label={t('actions.edit')} onClick={() => setEditExpense(expense)}>
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
      {editExpense && (
        <EditLandExpenseModal
          expense={editExpense}
          open={!!editExpense}
          onOpenChange={(open) => {
            if (!open) setEditExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default LandExpensesView;
