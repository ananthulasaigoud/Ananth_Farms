import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useCropStore } from "@/store/supabaseCropStore";
import { useAuth } from "@/hooks/useAuth";
import { Expense, ExpenseCategory } from "@/types/crop";
import { uploadMultipleBillImages, deleteMultipleBillImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditExpenseModalProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allCategories: ExpenseCategory[] = [
  'Seeds', 'Sowing Labor', 'Weeding Labor', 'Harvesting Labor', 'Cotton Picking Labor',
  'Fertilizer', 'Fertilizer Application Labor', 'Pesticide', 'Pesticide Spraying Labor',
  'Irrigation', 'Equipment Rent', 'Transportation', 'Dunnakam', 'Plough', 'Acchulu', 'Guntuka',
  'Other'
];

const EditExpenseModal = ({ expense, open, onOpenChange }: EditExpenseModalProps) => {
  const { editExpense, refreshCropData } = useCropStore();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: expense.category,
    amount: expense.amount.toString(),
    date: expense.date,
    description: expense.description || '',
  });
  const [existingImages, setExistingImages] = useState<string[]>(expense.bill_image_url || []);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when expense changes
  useEffect(() => {
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description || '',
    });
    setExistingImages(expense.bill_image_url || []);
    setNewImages([]);
    setSelectedFiles([]);
  }, [expense]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsUploadingImage(true);

    try {
      let uploadedImageUrls: string[] = [];

      // Upload new images if selected
      if (selectedFiles.length > 0 && user) {
        try {
          uploadedImageUrls = await uploadMultipleBillImages(selectedFiles, user.id, 'expense');
        } catch (error) {
          console.error('Image upload failed:', error);
          toast.error("Failed to upload some images. Continuing without new images.");
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];

      await editExpense(expense.id, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        bill_image_url: allImages.length > 0 ? allImages : null,
      });

      // Refresh the data to ensure real-time updates
      await refreshCropData();

      toast.success("Expense updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update expense");
    } finally {
      setLoading(false);
      setIsUploadingImage(false);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    console.log('Removing existing image at index:', index);
    console.log('Current existingImages:', existingImages);
    const updatedImages = existingImages.filter((_, i) => i !== index);
    console.log('Updated existingImages:', updatedImages);
    setExistingImages(updatedImages);
    toast.success("Image removed. Click 'Update Expense' to save changes.");
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
    // Also remove the corresponding file
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base sm:text-lg">Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes about this expense..."
              className="min-h-[60px] sm:min-h-[80px] resize-none"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Bill Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 p-0 bg-red-500 hover:bg-red-600 z-10 shadow-lg"
                      onClick={() => handleRemoveExistingImage(index)}
                      disabled={loading || isUploadingImage}
                      title="Remove image"
                    >
                      <span className="text-sm font-bold">×</span>
                    </Button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <MultiImageUpload
            value={newImages}
            onChange={setNewImages}
            onFileSelect={handleFileSelect}
            disabled={loading || isUploadingImage}
            maxImages={5 - existingImages.length}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto h-9 sm:h-10"
              disabled={loading || isUploadingImage}
            >
              {t('actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-9 sm:h-10"
              disabled={loading || isUploadingImage}
            >
              {loading ? t('actions.updating') : t('actions.update_expense')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;
