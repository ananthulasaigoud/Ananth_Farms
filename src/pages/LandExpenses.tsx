import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Receipt,
  Calendar,
  TrendingDown,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddLandExpenseModal from "@/components/AddLandExpenseModal";
import EditLandExpenseModal from "@/components/EditLandExpenseModal";
import { MultiBillImages } from "@/components/ui/multi-bill-images";
import { useCropStore } from "@/store/supabaseCropStore";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { LandExpense } from "@/types/crop";
import { toast } from "sonner";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

const LandExpenses = () => {
  const navigate = useNavigate();
  const { landExpenses, loadLandExpenses, deleteLandExpense } = useCropStore();
  const { t } = useTranslation();
  const { colorScheme } = useTheme();

  const [showAddLandExpense, setShowAddLandExpense] = useState(false);
  const [showEditLandExpense, setShowEditLandExpense] =
    useState(false);
  const [selectedLandExpense, setSelectedLandExpense] =
    useState<LandExpense | null>(null);

  useEffect(() => {
    loadLandExpenses();
  }, [loadLandExpenses]);

  const totalLandExpenses = landExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN");

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString()}`;

  const handleDeleteLandExpense = async (expenseId: string) => {
    try {
      await deleteLandExpense(expenseId);
      toast.success("Land expense deleted successfully");
    } catch {
      toast.error("Failed to delete land expense");
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-blue-950/70 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            {/* Back button */}
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="rounded-xl px-3 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t("Back to Dashboard")}</span>
              <span className="sm:hidden">{t("Back")}</span>
            </Button>

            {/* Page title */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏗️</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                  Land Expenses
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your land-related costs
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Left Column - Summary & Add Button */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="text-2xl">📊</span>
                  {t("Summary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-xl border">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Expenses</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalLandExpenses)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Receipt className="w-4 h-4" /> Records
                    </span>
                    <span className="font-medium">{landExpenses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" /> Last Updated
                    </span>
                    <span className="font-medium">
                      {landExpenses.length > 0
                        ? formatDate(landExpenses[0].createdAt)
                        : "No records"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Land Expense Button */}
            <Button
              onClick={() => setShowAddLandExpense(true)}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-medium shadow-md hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("Add Land Expense")}
            </Button>
          </div>

          {/* Right Column - Expense Records */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {t("Land Expense Records")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {landExpenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("No land expenses yet")}
                    </h3>
                    <p className="text-sm mb-4">
                      Start tracking your land-related expenses to get a clear
                      view of your farm costs.
                    </p>
                    <Button
                      onClick={() => setShowAddLandExpense(true)}
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md hover:opacity-90 transition"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("Add First Land Expense")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {landExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-medium text-base truncate">
                              {expense.category}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="text-xs rounded-md"
                            >
                              {formatDate(expense.date)}
                            </Badge>
                          </div>

                          {expense.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {expense.description}
                            </p>
                          )}

                          <PaymentStatusBadge
                            status={expense.paymentStatus}
                            amount={expense.amount}
                            paidAmount={expense.paidAmount}
                            className="text-xs"
                          />

                          {expense.bill_image_url?.length > 0 && (
                            <div className="mt-3">
                              <MultiBillImages
                                imageUrls={expense.bill_image_url}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(expense.amount)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLandExpense(expense);
                                setShowEditLandExpense(true);
                              }}
                              className="h-9 w-9 p-0 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("actions.delete_land_expense")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t(
                                      "messages.delete_land_expense_confirmation"
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t("actions.cancel")}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteLandExpense(expense.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t("actions.delete")}
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
      <AddLandExpenseModal
        open={showAddLandExpense}
        onOpenChange={setShowAddLandExpense}
      />
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
