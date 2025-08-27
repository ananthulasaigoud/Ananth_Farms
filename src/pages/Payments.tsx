import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentSummary } from "@/components/PaymentSummary";
import { PaymentModal } from "@/components/PaymentModal";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { useCropStore } from "@/store/supabaseCropStore";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Expense, Income, LandExpense, PaymentInfo } from "@/types/crop";
import { toast } from "sonner";

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Payments = () => {
  const navigate = useNavigate();
  
  const { t } = useTranslation();
  const { crops, landExpenses, updatePaymentStatus, getPaymentSummary } = useCropStore();
  const { user } = useAuth();
  
  const [selectedItem, setSelectedItem] = useState<Expense | Income | LandExpense | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'expense' | 'income' | 'land_expense' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'land_expense'>('all');

  // Get all items for payment management
  const allExpenses = crops.flatMap(crop => crop.expenses);
  const allIncome = crops.flatMap(crop => crop.income);
  const allItems = [...allExpenses, ...allIncome, ...landExpenses];

  // Filter items based on status and type
  const filteredItems = allItems.filter(item => {
    const statusMatch = filterStatus === 'all' || item.paymentStatus === filterStatus;
    const typeMatch = filterType === 'all' || 
      (filterType === 'expense' && 'category' in item) ||
      (filterType === 'income' && 'source' in item) ||
      (filterType === 'land_expense' && 'category' in item && !('cropId' in item));
    return statusMatch && typeMatch;
  });

  const handlePaymentUpdate = async (paymentInfo: PaymentInfo) => {
    if (!selectedItem || !selectedItemType) return;
    
    try {
      await updatePaymentStatus(selectedItemType, selectedItem.id, paymentInfo);
      toast.success(t('payment.updated_successfully'));
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(t('messages.error'));
    }
  };

  const getItemType = (item: Expense | Income | LandExpense): 'expense' | 'income' | 'land_expense' => {
    if ('cropId' in item) {
      return 'expense';
    } else if ('source' in item) {
      return 'income';
    } else {
      return 'land_expense';
    }
  };

  const getItemTitle = (item: Expense | Income | LandExpense): string => {
    if ('category' in item) {
      return item.category;
    } else if ('source' in item) {
      return item.source;
    }
    return 'Unknown';
  };

  const getItemCrop = (item: Expense | Income): string => {
    const crop = crops.find(c => c.id === item.cropId);
    return crop?.name || 'Unknown Crop';
  };

  const paymentSummary = getPaymentSummary();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 " />
              {/* Back */}
            </Button>
        </div>
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('payment.title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track and manage the payment status of all your expenses and income
        </p>
      </div>

       
      </div>

      {/* Payment Summary */}
      <PaymentSummary 
        expenses={allExpenses}
        income={allIncome}
        landExpenses={landExpenses}
        onPaymentUpdate={updatePaymentStatus}
        onOpenUpdate={(itm, tp) => {
          setSelectedItem(itm as any);
          setSelectedItemType(tp);
          setShowPaymentModal(true);
        }}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Status</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                  <SelectItem value="partial">⚠️ Partial</SelectItem>
                  <SelectItem value="paid">✅ Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">📉 Expenses</SelectItem>
                  <SelectItem value="income">📈 Income</SelectItem>
                  <SelectItem value="land_expense">🏞️ Land Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Items List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No payment items found with the current filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {getItemTitle(item)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getItemType(item)}
                      </Badge>
                      {'cropId' in item && (
                        <Badge variant="secondary" className="text-xs">
                          {getItemCrop(item as Expense | Income)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()} • ₹{item.amount.toLocaleString()}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="flex w-full sm:w-auto items-center sm:justify-end gap-2 sm:gap-3 mt-1 sm:mt-0">
                    <PaymentStatusBadge 
                      status={(item as any).paymentStatus}
                      amount={(item as any).amount}
                      paidAmount={(item as any).paidAmount}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedItemType(getItemType(item));
                        setShowPaymentModal(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      {t('payment.update')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedItem && selectedItemType && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          item={selectedItem}
          onPaymentUpdate={handlePaymentUpdate}
          type={selectedItemType}
        />
      )}
    </div>
  );
};

export default Payments; 