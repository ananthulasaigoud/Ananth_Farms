import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { PaymentStatus, PaymentMethod, PaymentInfo, Expense, Income, LandExpense } from "@/types/crop";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Expense | Income | LandExpense;
  onPaymentUpdate: (paymentInfo: PaymentInfo) => Promise<void>;
  type: 'expense' | 'income' | 'land_expense';
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit', label: 'Credit' },
  { value: 'other', label: 'Other' },
];

export const PaymentModal = ({ 
  open, 
  onOpenChange, 
  item, 
  onPaymentUpdate, 
  type 
}: PaymentModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(item.paymentStatus);
  const [paidAmount, setPaidAmount] = useState(item.paidAmount.toString());
  const [paymentDate, setPaymentDate] = useState(item.paymentDate || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(item.paymentMethod || '');
  const [paymentNotes, setPaymentNotes] = useState(item.paymentNotes || '');

  useEffect(() => {
    if (open) {
      setPaymentStatus(item.paymentStatus);
      setPaidAmount(item.paidAmount.toString());
      setPaymentDate(item.paymentDate || '');
      setPaymentMethod(item.paymentMethod || '');
      setPaymentNotes(item.paymentNotes || '');
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentStatus) {
      toast.error(t('payment.select_status'));
      return;
    }

    if (paymentStatus === 'partial' && (!paidAmount || parseFloat(paidAmount) <= 0)) {
      toast.error(t('payment.enter_paid_amount'));
      return;
    }

    if (paymentStatus === 'paid' && parseFloat(paidAmount) !== item.amount) {
      setPaidAmount(item.amount.toString());
    }

    setLoading(true);
    try {
      const paymentInfo: PaymentInfo = {
        status: paymentStatus,
        paidAmount: paymentStatus === 'paid' ? item.amount : parseFloat(paidAmount) || 0,
        paymentDate: paymentDate || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentNotes: paymentNotes || undefined,
      };

      await onPaymentUpdate(paymentInfo);
      toast.success(t('payment.updated_successfully'));
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'paid') {
      setPaidAmount(item.amount.toString());
    } else if (status === 'unpaid') {
      setPaidAmount('0');
    }
  };

  const getItemTitle = () => {
    if (type === 'expense') {
      return `${t('expense.title')}: ${(item as Expense).category}`;
    } else if (type === 'income') {
      return `${t('income.title')}: ${(item as Income).source}`;
    } else {
      return `${t('land_expense.title')}: ${(item as LandExpense).category}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payment.update_payment')}</DialogTitle>
          <DialogDescription>
            {getItemTitle()} - ₹{item.amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Payment Status */}
          <div className="space-y-2">
            <Label>{t('payment.current_status')}</Label>
            <PaymentStatusBadge 
              status={item.paymentStatus}
              amount={item.amount}
              paidAmount={item.paidAmount}
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment-status">{t('payment.status')} *</Label>
            <Select value={paymentStatus} onValueChange={(value) => handleStatusChange(value as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue placeholder={t('payment.select_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">{t('payment.unpaid')}</SelectItem>
                <SelectItem value="partial">{t('payment.partial')}</SelectItem>
                <SelectItem value="paid">{t('payment.paid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <Label htmlFor="paid-amount">{t('payment.paid_amount')}</Label>
            <Input
              id="paid-amount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              disabled={paymentStatus === 'paid'}
              min="0"
              max={item.amount}
              step="0.01"
              placeholder="0.00"
            />
            {paymentStatus === 'partial' && (
              <p className="text-xs text-gray-500">
                {t('payment.remaining')}: ₹{(item.amount - parseFloat(paidAmount) || 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment-date">{t('payment.payment_date')}</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">{t('payment.payment_method')}</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue placeholder={t('payment.select_method')} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Notes */}
          <div className="space-y-2">
            <Label htmlFor="payment-notes">{t('payment.payment_notes')}</Label>
            <Textarea
              id="payment-notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder={t('payment.notes_placeholder')}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? t('actions.updating') : t('payment.update_payment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 