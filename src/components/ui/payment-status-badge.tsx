import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/crop";
import { useTranslation } from "react-i18next";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  amount: number;
  paidAmount: number;
  className?: string;
}

export const PaymentStatusBadge = ({ 
  status, 
  amount, 
  paidAmount, 
  className = "" 
}: PaymentStatusBadgeProps) => {
  const { t } = useTranslation();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
          icon: '✅',
          text: t('payment.paid')
        };
      case 'partial':
        return {
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
          icon: '⚠️',
          text: t('payment.partial')
        };
      case 'unpaid':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
          icon: '❌',
          text: t('payment.unpaid')
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700',
          icon: '❓',
          text: t('payment.unknown')
        };
    }
  };

  const config = getStatusConfig();
  const percentage = amount > 0 ? Math.round((paidAmount / amount) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={config.variant}
        className={`${config.className} text-xs font-medium px-2 py-1`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </Badge>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        ₹{paidAmount.toLocaleString()} / ₹{amount.toLocaleString()}
      </span>
      {status === 'partial' && (
        <div className="flex items-center gap-1">
          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}; 