import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCropStore } from "@/store/supabaseCropStore";
import { Crop, CropType } from "@/types/crop";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditCropModalProps {
  crop: Crop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cropTypes: CropType[] = [
  'Cotton', 'Rice', 'Wheat', 'Corn', 'Tomato', 'Onion', 'Potato', 
  'Chili', 'Brinjal', 'Okra', 'Sugarcane', 'Groundnut', 'Sunflower', 'Millets', 'Other'
];

const EditCropModal = ({ crop, open, onOpenChange }: EditCropModalProps) => {
  const { editCrop } = useCropStore();
  const [formData, setFormData] = useState({
    name: crop.name,
    type: crop.type,
    landArea: crop.landArea.toString(),
    landUnit: crop.landUnit,
    sowingDate: crop.sowingDate,
  });
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await editCrop(crop.id, {
        name: formData.name,
        type: formData.type,
        landArea: parseFloat(formData.landArea),
        landUnit: formData.landUnit as 'acres' | 'hectares',
        sowingDate: formData.sowingDate,
      });
      toast.success("Crop updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update crop");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base sm:text-lg">{t('actions.edit_crop')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Crop Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-sm font-medium">Crop Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as CropType })}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="landArea" className="text-sm font-medium">Land Area</Label>
              <Input
                id="landArea"
                type="number"
                step="0.01"
                value={formData.landArea}
                onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                required
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="landUnit" className="text-sm font-medium">Unit</Label>
              <Select value={formData.landUnit} onValueChange={(value) => setFormData({ ...formData, landUnit: value as 'acres' | 'hectares' })}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="hectares">Hectares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sowingDate" className="text-sm font-medium">Sowing Date</Label>
            <Input
              id="sowingDate"
              type="date"
              value={formData.sowingDate}
              onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
              required
              className="h-9 sm:h-10"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              {t('actions.cancel')}
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              {t('actions.update_crop')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCropModal;
