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
import { ExpenseCategory, PaymentStatus, PaymentMethod } from "@/types/crop";
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
  
  // Payment fields
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('upi');
  const [paymentNotes, setPaymentNotes] = useState("");
  
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
    'Patti Katte',
    'Tractor Guntuku',
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
        category: category as ExpenseCategory,
        amount: parseFloat(amount),
        date,
        description: description.trim() || undefined,
        bill_image_url: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        // Payment fields
        paymentStatus,
        paidAmount: parseFloat(paidAmount) || 0,
        paymentDate: paymentDate || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentNotes: paymentNotes.trim() || undefined,
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
      // Reset payment fields
      setPaymentStatus('unpaid');
      setPaidAmount("");
      setPaymentDate("");
      setPaymentMethod('upi');
      setPaymentNotes("");
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="flex-1 h-9 sm:h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <span>{getExpenseCategoryIcon(cat as ExpenseCategory)}</span>
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-2"
                onClick={async () => {
                  if (description.trim()) {
                    const suggestion = await suggestExpenseCategory(description);
                    if (suggestion) {
                      setCategory(suggestion);
                      toast.success(`AI suggested: ${suggestion}`);
                    }
                  }
                }}
                disabled={!description.trim() || ocrLoading}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter the amount"
              min="0"
              step="0.01"
              className="h-9 sm:h-10"
              required
            />
          </div>

          {/* Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="h-9 sm:h-10"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Payment Status Field */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-status" className="text-sm font-medium">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                <SelectItem value="partial">⚠️ Partial</SelectItem>
                <SelectItem value="paid">✅ Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Paid Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="paid-amount" className="text-sm font-medium">Paid Amount (₹)</Label>
            <Input
              id="paid-amount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={paymentStatus === 'paid' ? "Auto-filled with full amount" : "Enter the paid amount"}
              min="0"
              max={amount ? parseFloat(amount) : undefined}
              step="0.01"
              className="h-9 sm:h-10"
              disabled={paymentStatus === 'paid'}
            />
            {paymentStatus === 'paid' && amount && (
              <p className="text-xs text-gray-500">Auto-filled with full amount</p>
            )}
          </div>

          {/* Payment Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-date" className="text-sm font-medium">Payment Date</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="h-9 sm:h-10"
            />
          </div>

          {/* Payment Method Field */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-method" className="text-sm font-medium">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
                <SelectItem value="cheque">📄 Cheque</SelectItem>
                <SelectItem value="credit">💳 Credit</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Notes Field */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-notes" className="text-sm font-medium">Payment Notes</Label>
            <Textarea
              id="payment-notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Add payment notes..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Bill Images */}
          <div className="space-y-1.5">
            {/* <Label className="text-sm font-medium">Bill Images (Optional)</Label> */}
            <MultiImageUpload
              onFileSelect={handleFileSelect}
              onChange={setImageUrls}
              disabled={loading || isUploadingImage}
              maxImages={5}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
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
