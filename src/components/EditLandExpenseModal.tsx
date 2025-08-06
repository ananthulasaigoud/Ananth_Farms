import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCropStore } from "@/store/supabaseCropStore";
import { useAuth } from "@/hooks/useAuth";
import { LandExpense, LandExpenseCategory, PaymentStatus, PaymentMethod } from "@/types/crop";
import { uploadMultipleBillImages, deleteMultipleBillImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { 
  Receipt, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Image, 
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2
} from "lucide-react";

interface EditLandExpenseModalProps {
  expense: LandExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allCategories: LandExpenseCategory[] = [
  'Pipeline Installation', 'Land Leveling', 'Drip System', 'Sprinkler System',
  'Bore Well', 'Fencing', 'Shed Construction', 'Road Development',
  'Electricity Connection', 'Water Tank', 'Other'
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cheque', label: 'Cheque', icon: '📄' },
  { value: 'credit', label: 'Credit', icon: '💳' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const EditLandExpenseModal = ({ expense, open, onOpenChange }: EditLandExpenseModalProps) => {
  const { editLandExpense, refreshCropData } = useCropStore();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: expense.category,
    amount: expense.amount.toString(),
    date: expense.date,
    description: expense.description || '',
    // Payment fields
    paymentStatus: expense.paymentStatus,
    paidAmount: expense.paidAmount.toString(),
    paymentDate: expense.paymentDate || '',
    paymentMethod: expense.paymentMethod || '',
    paymentNotes: expense.paymentNotes || '',
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
      // Payment fields
      paymentStatus: expense.paymentStatus,
      paidAmount: expense.paidAmount.toString(),
      paymentDate: expense.paymentDate || '',
      paymentMethod: expense.paymentMethod || '',
      paymentNotes: expense.paymentNotes || '',
    });
    setExistingImages(expense.bill_image_url || []);
    setNewImages([]);
    setSelectedFiles([]);
  }, [expense]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setFormData(prev => ({
      ...prev,
      paymentStatus: status,
      // Auto-fill paid amount based on status
      paidAmount: status === 'paid' ? prev.amount : 
                  status === 'unpaid' ? '0' : prev.paidAmount
    }));
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
          uploadedImageUrls = await uploadMultipleBillImages(selectedFiles, user.id, 'land_expense');
        } catch (error) {
          console.error('Image upload failed:', error);
          toast.error("Failed to upload some images. Continuing without new images.");
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];

      await editLandExpense(expense.id, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        bill_image_url: allImages.length > 0 ? allImages : null,
        // Payment fields
        paymentStatus: formData.paymentStatus,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        paymentDate: formData.paymentDate || undefined,
        paymentMethod: formData.paymentMethod as PaymentMethod || undefined,
        paymentNotes: formData.paymentNotes || undefined,
      });

      // Refresh the data to ensure real-time updates
      await refreshCropData();

      toast.success("Land expense updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update land expense");
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
    toast.success("Image removed. Click 'Update Land Expense' to save changes.");
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
    // Also remove the corresponding file
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'unpaid': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const remainingAmount = parseFloat(formData.amount) - parseFloat(formData.paidAmount) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] mx-auto p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Edit Land Expense
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update land expense details and payment information
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Current Status Card */}
              <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(expense.paymentStatus)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {expense.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <PaymentStatusBadge 
                      status={expense.paymentStatus}
                      amount={expense.amount}
                      paidAmount={expense.paidAmount}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        Category
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as LandExpenseCategory })}>
                        <SelectTrigger className="h-10">
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

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        Amount (₹)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">
                        Remaining Amount
                      </Label>
                      <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ₹{remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add detailed notes about this land expense..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-status" className="text-sm font-medium">Payment Status</Label>
                      <Select value={formData.paymentStatus} onValueChange={(value) => handlePaymentStatusChange(value as PaymentStatus)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              Unpaid
                            </div>
                          </SelectItem>
                          <SelectItem value="partial">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              Partial
                            </div>
                          </SelectItem>
                          <SelectItem value="paid">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Paid
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paid-amount" className="text-sm font-medium">Paid Amount (₹)</Label>
                      <Input
                        id="paid-amount"
                        type="number"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        max={parseFloat(formData.amount) || undefined}
                        step="0.01"
                        className="h-10"
                        disabled={formData.paymentStatus === 'paid'}
                      />
                      {formData.paymentStatus === 'paid' && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Auto-filled with full amount
                        </p>
                      )}
                      {formData.paymentStatus === 'partial' && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Remaining: ₹{remainingAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-date" className="text-sm font-medium">Payment Date</Label>
                      <Input
                        id="payment-date"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-method" className="text-sm font-medium">Payment Method</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                {method.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-notes" className="text-sm font-medium">Payment Notes</Label>
                    <Textarea
                      id="payment-notes"
                      value={formData.paymentNotes}
                      onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                      placeholder="Add payment notes, transaction details, or any additional information..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Bill Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Current Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingImages.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Bill ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-red-500 hover:bg-red-600 z-10 shadow-lg"
                              onClick={() => handleRemoveExistingImage(index)}
                              disabled={loading || isUploadingImage}
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Images */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Add New Images</Label>
                    <MultiImageUpload
                      value={newImages}
                      onChange={setNewImages}
                      onFileSelect={handleFileSelect}
                      disabled={loading || isUploadingImage}
                      maxImages={5 - existingImages.length}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 dark:bg-gray-900 px-6 py-4">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="w-full sm:w-auto h-10"
                disabled={loading || isUploadingImage}
              >
                <X className="w-4 h-4 mr-2" />
                {t('actions.cancel')}
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                className="w-full sm:w-auto h-10 bg-green-600 hover:bg-green-700"
                disabled={loading || isUploadingImage}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('actions.updating')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('actions.update_land_expense')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLandExpenseModal;
