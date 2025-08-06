import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useCropStore } from "@/store/supabaseCropStore";
import { useAuth } from "@/hooks/useAuth";
import { ExpenseCategory } from "@/types/crop";
import { getCropSpecificExpenseCategories, getExpenseCategoryIcon } from "@/utils/cropExpenseCategories";
import { uploadMultipleBillImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { suggestExpenseCategory } from "@/utils/ai";
import { Sparkles } from "lucide-react";
import Tesseract from 'tesseract.js';

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropId?: string | null;
}

const AddExpenseModal = ({ open, onOpenChange, cropId: propCropId }: AddExpenseModalProps) => {
  const [cropId, setCropId] = useState(propCropId || "");
  const [category, setCategory] = useState<string>('Seeds');
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  
  const { crops, addExpense, refreshCropData } = useCropStore();
  const { user } = useAuth();

  const selectedCrop = crops.find(c => c.id === cropId);
  const availableCategories = selectedCrop 
    ? getCropSpecificExpenseCategories(selectedCrop.type)
    : [];
  const allCategories = [
    'Seeds',
    'Sowing Labor',
    'Weeding Labor',
    'Harvesting Labor',
    'Cotton Picking Labor',
    'Fertilizer',
    'Fertilizer Application Labor',
    'Pesticide',
    'Pesticide Spraying Labor',
    'Irrigation',
    'Equipment Rent',
    'Transportation',
    'Dunnakam',
    'Plough',
    'Acchulu',
    'Guntuka',
    'Other',
  ];

  // Update cropId when propCropId changes
  useEffect(() => {
    if (propCropId) {
      setCropId(propCropId);
    }
  }, [propCropId]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // More specific validation with better error messages
    if (!category.trim()) {
      toast.error("Please select or enter a category");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);
    setIsUploadingImage(true);

    try {
      let uploadedImageUrls: string[] = [];

      // Upload images if selected
      if (selectedFiles.length > 0 && user) {
        try {
          uploadedImageUrls = await uploadMultipleBillImages(selectedFiles, user.id, 'expense');
          setImageUrls(uploadedImageUrls);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast.error("Failed to upload some images. Continuing without images.");
        }
      }

      await addExpense({
        cropId: cropId || null,
        category: category as any,
        amount: parseFloat(amount),
        date,
        description: description.trim() || undefined,
        bill_image_url: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      });

      // Refresh the data to ensure real-time updates
      await refreshCropData();

      const crop = crops.find(c => c.id === cropId);
      toast.success(`Expense added to ${crop?.name || 'general expenses'}!`);
      
      // Reset form
      setCropId(propCropId || "");
      setCategory('Seeds');
      setAmount("");
      setDate("");
      setDescription("");
      setCustomCategory("");
      setSelectedFiles([]);
      setImageUrls([]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="text-xl sm:text-2xl">📉</span>
            Add Crop Expense
          </DialogTitle>
          <DialogDescription>
            Enter the details of your crop expense below. All required fields must be filled to add an expense.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Show crop selection only if no crop is pre-selected */}
          {!propCropId && (
          <div className="space-y-1.5">
              <Label htmlFor="crop" className="text-sm font-medium">Select Crop (Optional)</Label>
            <Select value={cropId} onValueChange={setCropId}>
              <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Choose a crop (optional)" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                      <div className="flex items-center gap-2">
                        <span>🌾</span>
                        <span className="font-medium">{crop.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {crop.type}
                        </Badge>
                      </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}

          {/* Show selected crop when pre-selected */}
          {propCropId && selectedCrop && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Selected Crop</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-lg">🌾</span>
                <div className="flex-1">
                  <div className="font-medium">{selectedCrop.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCrop.type}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedCrop.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Category Field - always visible, combobox style */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={(value: string) => { setCategory(value); setCustomCategory(""); }}>
                <SelectTrigger className="h-9 sm:h-10 w-40">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getExpenseCategoryIcon(cat as ExpenseCategory)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="customCategory"
                value={customCategory}
                onChange={e => { setCustomCategory(e.target.value); setCategory(e.target.value); }}
                placeholder="Or type custom"
                className="h-9 sm:h-10 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!description.trim()) {
                    toast.error("Please enter a description first");
                    return;
                  }
                  try {
                    const suggestion = await suggestExpenseCategory(description);
                    setCategory(suggestion);
                    toast.success(`AI suggested: ${suggestion}`);
                  } catch (error) {
                    toast.error("Failed to get AI suggestion");
                  }
                }}
                className="shrink-0"
                disabled={!description.trim()}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                AI Suggest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Multi-Image Upload */}
          <MultiImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            onFileSelect={handleFileSelect}
            disabled={loading || isUploadingImage}
            maxImages={5}
          />

          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={async () => {
              if (imageUrls.length === 0) return;
              setOcrLoading(true);
              const result = await Tesseract.recognize(imageUrls[0], 'eng');
              setOcrLoading(false);
              const text = result.data.text;
              // Try to extract amount (simple regex for numbers with decimals)
              const amountMatch = text.match(/\d+[.,]?\d*/g);
              if (amountMatch) setAmount(String(parseFloat(amountMatch[0].replace(',', ''))));
              setDescription(text.trim());
            }}
            disabled={ocrLoading}
          >
            {ocrLoading ? 'Extracting...' : 'Extract from Bill Image'}
          </Button>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-9 sm:h-10"
              disabled={loading || isUploadingImage}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700 h-9 sm:h-10" 
              disabled={loading || isUploadingImage}
            >
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
