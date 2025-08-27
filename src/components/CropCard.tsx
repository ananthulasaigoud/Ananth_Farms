import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Calendar, MapPin, Trash2 } from "lucide-react";
import { Crop } from "@/types/crop";
import { useCropStore } from "@/store/supabaseCropStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CropCardProps {
  crop: Crop;
  onClick: () => void;
}

const CropCard = ({ crop, onClick }: CropCardProps) => {
  const { t } = useTranslation();
  const { deleteCrop } = useCropStore();
  
  const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalIncome - totalExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleDeleteCrop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCrop(crop.id);
      toast.success(`${t('crop.name')} "${crop.name}" ${t('messages.success').toLowerCase()}`);
    } catch (error) {
      toast.error(t('messages.error'));
    }
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
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* <Button
                  size="sm"
                  variant="outline"
                  className="p-2 h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  title={`Delete ${crop.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button> */}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Crop</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{crop.name}"? This will also delete all associated income and expense records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCrop}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Crop
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Badge variant={profit >= 0 ? "default" : "destructive"} className="text-xs">
              {profit >= 0 ? t('Making Profits') : t('Still in Loss')}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{crop.landArea} {t(crop.landUnit)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span><b>{t('sown')}</b>: {formatDate(crop.sowingDate)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('Income')}</p>
            <p className="text-green-600 font-semibold">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('Expenses')}</p>
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
