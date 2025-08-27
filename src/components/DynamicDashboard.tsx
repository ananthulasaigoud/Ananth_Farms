import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,Home
} from 'lucide-react';
import CropCard from '@/components/CropCard';
import { useCropStore } from '@/store/supabaseCropStore';
import { Crop as CropType } from '@/types/crop';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface DynamicDashboardProps {
  className?: string;
  onCropSelect?: (crop: CropType) => void;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ className, onCropSelect }) => {
  const navigate = useNavigate();
  const { crops, landExpenses } = useCropStore();
  const { t } = useTranslation();

  const totalIncome = crops.reduce((sum, crop) => sum + crop.income.reduce((t, i) => t + i.amount, 0), 0);
  const totalExpenses = crops.reduce((sum, crop) => sum + crop.expenses.reduce((t, e) => t + e.amount, 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const isProfit = netProfit >= 0;
  const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const overallProfit = netProfit - totalLandExpenses;
  const isOverallProfit = overallProfit >= 0;



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Profit/Loss Summary - moved to top */}
      <div className="mb-6">
        <Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 shadow-lg rounded-xl border-0 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md ${isOverallProfit ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {isOverallProfit ? (
                  <TrendingUp className="w-7 h-7 text-green-600" />
                ) : (
                  <TrendingDown className="w-7 h-7 text-red-600" />
                )}
              </div>
              <div className="ml-2 flex flex-col items-start">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('Overall Investments')}</h2>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.land_expenses')}</p> */}
              </div>
            </div>
            <span className={`text-3xl sm:text-4xl font-extrabold ${isOverallProfit ? 'text-green-600' : 'text-red-600'} drop-shadow-sm`}>
              ₹{Math.abs(overallProfit).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-6 justify-center items-center text-sm">
            {/* Total Income */}
            <div className="flex items-center gap-2 bg-green-100/30 dark:bg-green-800/30 px-3 py-1 rounded-xl shadow-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">{t('dashboard.total_income')}:</span>
              <span className="font-bold text-green-600">₹{totalIncome.toLocaleString()}</span>
            </div>

            {/* Total Expenses */}
            <div className="flex items-center gap-2 bg-red-100/30 dark:bg-red-800/30 px-3 py-1 rounded-xl shadow-sm">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-gray-700 dark:text-gray-300">{t('dashboard.total_expenses')}:</span>
              <span className="font-bold text-red-600">₹{totalExpenses.toLocaleString()}</span>
            </div>

            {/* Land Expenses */}
            <div className="flex items-center gap-2 bg-blue-100/30 dark:bg-blue-800/30 px-3 py-1 rounded-xl shadow-sm">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">{t('dashboard.land_expenses')}:</span>
              <span className="font-bold text-blue-600">₹{totalLandExpenses.toLocaleString()}</span>
            </div>
          </div>

        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full">
        <Button
          size="lg"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-xl shadow-lg px-6 py-3 text-base tracking-wide transition-all duration-200 active:scale-95 hover:shadow-xl border-0"
          onClick={() => navigate('/add-crop')}
        >
          <span className="text-xl">🌱</span>
          <span className="font-semibold">{t('actions.add_new_crop')}</span>
        </Button>
        <Button
          size="lg"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg px-6 py-3 text-base tracking-wide transition-all duration-200 active:scale-95 hover:shadow-xl border-0"
          onClick={() => navigate('/land-expenses')}
        >
          <span className="text-xl">🏞️</span>
          <span className="font-semibold">{t('Add or View Land Expenses')}</span>
        </Button>

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.length === 0 ? (
          <Card className="p-8 text-center col-span-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-dashed border-green-300 dark:border-green-600">
            <div className="space-y-6">
              {/* Animated Emoji */}
              <div className="text-6xl animate-bounce">
                🌾
              </div>
              
              {/* Main Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {t('welcome')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {t('dashboard.no_crops_description')}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">📊</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('crop.profit')}</div>
                  <div className="text-xs text-gray-500">{t('dashboard.total_income')} & {t('dashboard.total_expenses')}</div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">🌱</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('crop.name')}</div>
                  <div className="text-xs text-gray-500">{t('actions.add_new_crop')}</div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">📈</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ai.recommendations')}</div>
                  <div className="text-xs text-gray-500">AI-powered recommendations</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/add-crop')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <span className="text-lg mr-2">🌱</span>
                  {t('dashboard.add_first_crop')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/land-expenses')}
                  className="border-green-300 text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-full"
                >
                  <span className="text-lg mr-2">🏞️</span>
                  {t('actions.add_land_expense')}
                </Button>
              </div>

              {/* Fun Facts */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Did you know?</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Tracking your farm expenses can help you increase profits by up to 25% through better financial management!
                </p>
              </div>

              {/* Quick Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>Record all expenses</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>Track crop yields</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>Monitor market prices</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>Plan for next season</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onClick={() => onCropSelect?.(crop)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function DynamicDashboardWithChart(props: DynamicDashboardProps) {
  const { crops, landExpenses } = useCropStore();
  return (
    <>
      <DynamicDashboard {...props} />
      <div className="w-full mt-8">
        <Card className="h-full flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">Farm Financial Overview</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">Income vs Expenses by Crop</p>
          <ResponsiveContainer width="100%" minWidth={0} height={220} className="dashboard-chart-responsive">
            <BarChart
              data={crops.map(crop => ({
                name: crop.name,
                Income: crop.income.reduce((sum, i) => sum + i.amount, 0),
                Expenses: crop.expenses.reduce((sum, e) => sum + e.amount, 0),
              }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barGap={8}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} angle={-15} textAnchor="end" interval={0} height={50} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, marginBottom: 8 }} />
              <Bar dataKey="Income" fill="url(#incomeGradient)" radius={[8, 8, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Expenses" fill="url(#expensesGradient)" radius={[8, 8, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
} 