import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  CalendarClock,
  Sprout,
  ReceiptIndianRupee,
  BarChart3,
  Info,
} from 'lucide-react';

interface RecommendationsGridProps {
  tips: string[];
  className?: string;
  onNavigate?: (route: string) => void;
}

function getTipMeta(tip: string) {
  const t = tip.toLowerCase();
  if (t.includes('profit') || t.includes('roi')) {
    return { icon: TrendingUp, theme: 'green', badge: 'Profit' };
  }
  if (t.includes('expense') || t.includes('cost')) {
    return { icon: ReceiptIndianRupee, theme: 'red', badge: 'Expenses' };
  }
  if (t.includes('payment') || t.includes('overdue') || t.includes('unpaid')) {
    return { icon: Wallet, theme: 'orange', badge: 'Payments' };
  }
  if (t.includes('season') || t.includes('week') || t.includes('month')) {
    return { icon: CalendarClock, theme: 'blue', badge: 'Schedule' };
  }
  if (t.includes('crop') || t.includes('plant')) {
    return { icon: Sprout, theme: 'emerald', badge: 'Crop' };
  }
  if (t.includes('trend') || t.includes('summary') || t.includes('chart')) {
    return { icon: BarChart3, theme: 'purple', badge: 'Insights' };
  }
  if (t.includes('risk') || t.includes('alert') || t.includes('review')) {
    return { icon: AlertTriangle, theme: 'amber', badge: 'Alert' };
  }
  return { icon: Info, theme: 'slate', badge: 'Tip' };
}

const themeToClasses: Record<string, { ring: string; text: string; badge: string; button: string }> = {
  green: {
    ring: 'ring-green-200 dark:ring-green-900',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    button: 'bg-green-600 hover:bg-green-700 text-white',
  },
  red: {
    ring: 'ring-red-200 dark:ring-red-900',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  orange: {
    ring: 'ring-orange-200 dark:ring-orange-900',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    button: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  blue: {
    ring: 'ring-blue-200 dark:ring-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  emerald: {
    ring: 'ring-emerald-200 dark:ring-emerald-900',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  purple: {
    ring: 'ring-purple-200 dark:ring-purple-900',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  amber: {
    ring: 'ring-amber-200 dark:ring-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  slate: {
    ring: 'ring-slate-200 dark:ring-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
    button: 'bg-slate-600 hover:bg-slate-700 text-white',
  },
};

const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ tips, className = '', onNavigate }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${className}`}>
      {tips.map((tip, idx) => {
        const meta = getTipMeta(tip);
        const Icon = meta.icon;
        const theme = themeToClasses[meta.theme];
        const action = meta.badge === 'Payments' ? { label: 'View Payments', route: '/payments' } :
                       meta.badge === 'Profit' ? { label: 'Open Dashboard', route: '/' } :
                       meta.badge === 'Expenses' ? { label: 'Add Expense', route: '/add-crop' } : null;

        return (
          <Card key={idx} className={`border-0 ring-1 ${theme.ring} shadow-sm hover:shadow-md transition-shadow`}> 
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`rounded-lg p-2 bg-white/60 dark:bg-black/20 ${theme.text}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge className={`${theme.badge} border-0`}>{meta.badge}</Badge>
                </div>
                <p className={`text-sm ${theme.text} leading-snug break-words`}>{tip}</p>
                {action && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      className={`${theme.button} h-7 text-xs`}
                      onClick={() => onNavigate?.(action.route)}
                    >
                      {action.label}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RecommendationsGrid;


