import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { Expense, Income, LandExpense, PaymentStatus } from "@/types/crop";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface PaymentSummaryProps {
  expenses: Expense[];
  income: Income[];
  landExpenses: LandExpense[];
  onPaymentUpdate?: (type: 'expense' | 'income' | 'land_expense', id: string, paymentInfo: any) => Promise<void>;
}

export const PaymentSummary = ({ 
  expenses, 
  income, 
  landExpenses, 
  onPaymentUpdate 
}: PaymentSummaryProps) => {
  const { t } = useTranslation();

  // Calculate payment statistics
  const allExpenses = [...expenses, ...landExpenses];
  
  const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaid = allExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  const totalUnpaid = totalAmount - totalPaid;

  const unpaidExpenses = allExpenses.filter(exp => exp.paymentStatus === 'unpaid');
  const partialExpenses = allExpenses.filter(exp => exp.paymentStatus === 'partial');
  const paidExpenses = allExpenses.filter(exp => exp.paymentStatus === 'paid');

  const overdueExpenses = unpaidExpenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return expenseDate < thirtyDaysAgo;
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'partial': return 'text-orange-600';
      case 'unpaid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return <TrendingUp className="w-4 h-4" />;
      case 'partial': return <DollarSign className="w-4 h-4" />;
      case 'unpaid': return <TrendingDown className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payment.total_amount')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {allExpenses.length} {t('payment.transactions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payment.total_paid')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / totalAmount) * 100).toFixed(1)}% {t('payment.paid')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payment.total_unpaid')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalUnpaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {unpaidExpenses.length} {t('payment.pending')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payment.status_breakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  ❌ {t('payment.unpaid')}
                </Badge>
                <span className="text-sm">{unpaidExpenses.length} {t('payment.items')}</span>
              </div>
              <span className="text-sm font-medium">
                ₹{unpaidExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  ⚠️ {t('payment.partial')}
                </Badge>
                <span className="text-sm">{partialExpenses.length} {t('payment.items')}</span>
              </div>
              <span className="text-sm font-medium">
                ₹{partialExpenses.reduce((sum, exp) => sum + (exp.amount - exp.paidAmount), 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  ✅ {t('payment.paid')}
                </Badge>
                <span className="text-sm">{paidExpenses.length} {t('payment.items')}</span>
              </div>
              <span className="text-sm font-medium">
                ₹{paidExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments Alert */}
      {overdueExpenses.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              {t('payment.overdue_payments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">
                {t('payment.overdue_description', { count: overdueExpenses.length })}
              </p>
              <div className="space-y-1">
                {overdueExpenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">
                      {expense.category || expense.description || t('payment.unknown_expense')}
                    </span>
                    <span className="font-medium">₹{expense.amount.toLocaleString()}</span>
                  </div>
                ))}
                {overdueExpenses.length > 3 && (
                  <p className="text-xs text-red-500">
                    +{overdueExpenses.length - 3} {t('payment.more_overdue')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Unpaid Expenses */}
      {unpaidExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('payment.recent_unpaid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {expense.category || expense.description || t('payment.unknown_expense')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(expense.date).toLocaleDateString()}
                      </Badge>
                    </div>
                    <PaymentStatusBadge 
                      status={expense.paymentStatus}
                      amount={expense.amount}
                      paidAmount={expense.paidAmount}
                      className="mt-1"
                    />
                  </div>
                  {onPaymentUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // This would open the payment modal
                        console.log('Update payment for:', expense.id);
                      }}
                    >
                      {t('payment.update')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 