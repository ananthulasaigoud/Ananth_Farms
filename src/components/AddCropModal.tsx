import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCropStore } from "@/store/supabaseCropStore";
import { CropType } from "@/types/crop";
import { toast } from "sonner";

interface AddCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cropTypes: CropType[] = [
  'Cotton', 'Rice', 'Wheat', 'Corn', 'Tomato', 'Onion', 'Potato', 
  'Chili', 'Brinjal', 'Okra', 'Sugarcane', 'Groundnut', 'Sunflower', 
  'Millets', 'Other'
];

const AddCropModal = ({ open, onOpenChange }: AddCropModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<CropType>('Cotton');
  const [landArea, setLandArea] = useState("");
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares'>('acres');
  const [sowingDate, setSowingDate] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { addCrop } = useCropStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !landArea || !sowingDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await addCrop({
        name,
        type,
        landArea: parseFloat(landArea),
        landUnit,
        sowingDate,
      });

      toast.success(`${name} crop added successfully!`);
      
      // Reset form
      setName("");
      setType('Cotton');
      setLandArea("");
      setSowingDate("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add crop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-gray-900 dark:to-green-900 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl bg-green-100 dark:bg-green-900 shadow-inner mb-2 animate-bounce-slow">
            🌱
          </div>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-green-900 dark:text-green-200">
            Add New Crop
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cropName" className="text-sm font-medium flex items-center gap-1">🏷️ Crop Name *</Label>
            <Input
              id="cropName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Cotton Field, Tomato Garden"
              className="h-9 sm:h-10 focus:ring-2 focus:ring-green-400"
              autoFocus
            />
            {name === '' && <span className="text-xs text-red-500">Required</span>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cropType" className="text-sm font-medium flex items-center gap-1">🌱 Crop Type *</Label>
            <Select value={type} onValueChange={(value: CropType) => setType(value)}>
              <SelectTrigger className="h-9 sm:h-10 focus:ring-2 focus:ring-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((cropType) => (
                  <SelectItem key={cropType} value={cropType}>
                    {cropType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="landArea" className="text-sm font-medium flex items-center gap-1">📏 Land Area *</Label>
              <Input
                id="landArea"
                type="number"
                step="0.1"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="0.0"
                className="h-9 sm:h-10 focus:ring-2 focus:ring-green-400"
              />
              {landArea === '' && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="landUnit" className="text-sm font-medium flex items-center gap-1">Unit</Label>
              <Select value={landUnit} onValueChange={(value: 'acres' | 'hectares') => setLandUnit(value)}>
                <SelectTrigger className="h-9 sm:h-10 focus:ring-2 focus:ring-green-400">
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
            <Label htmlFor="sowingDate" className="text-sm font-medium flex items-center gap-1">📅 Sowing Date *</Label>
            <Input
              id="sowingDate"
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="h-9 sm:h-10 focus:ring-2 focus:ring-green-400"
            />
            {sowingDate === '' && <span className="text-xs text-red-500">Required</span>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 h-9 sm:h-10 transition-transform duration-150 active:scale-95"
              disabled={loading}
            >
              {loading ? <span className="animate-spin mr-2">🌱</span> : "Add Crop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCropModal;
