import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, MapPin } from "lucide-react";
import { Crop } from "@/types/crop";
import { useTranslation } from "react-i18next";

interface CropCardProps {
  crop: Crop;
  onClick: () => void;
}

const CropCard = ({ crop, onClick }: CropCardProps) => {
  const { t } = useTranslation();
  const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalIncome - totalExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-l-4 border-l-green-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <div>
              <span className="text-lg">{crop.name}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {crop.type}
              </Badge>
            </div>
          </div>
          <Badge variant={profit >= 0 ? "default" : "destructive"} className="text-xs">
            {profit >= 0 ? t('profit') : t('loss')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{crop.landArea} {t(crop.landUnit)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{t('sown')}: {formatDate(crop.sowingDate)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('income')}</p>
            <p className="text-green-600 font-semibold">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('expenses')}</p>
            <p className="text-red-600 font-semibold">₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-1 pt-2 border-t ${
          profit >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {profit >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-bold">₹{Math.abs(profit).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropCard;
