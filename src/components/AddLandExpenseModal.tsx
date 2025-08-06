import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCropStore } from "@/store/supabaseCropStore";
import { LandExpenseCategory } from "@/types/crop";
import { getLandExpenseCategoryIcon } from "@/utils/cropExpenseCategories";
import { toast } from "sonner";

interface AddLandExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const landExpenseCategories: LandExpenseCategory[] = [
  'Pipeline Installation',
  'Land Leveling',
  'Drip System',
  'Sprinkler System',
  'Bore Well',
  'Fencing',
  'Shed Construction',
  'Road Development',
  'Electricity Connection',
  'Water Tank',
  'Other'
];

const AddLandExpenseModal = ({ open, onOpenChange }: AddLandExpenseModalProps) => {
  const [category, setCategory] = useState<LandExpenseCategory>('Pipeline Installation');
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { addLandExpense } = useCropStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !date) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await addLandExpense({
        category,
        amount: parseFloat(amount),
        date,
        description: description || undefined,
      });

      toast.success("Land expense added successfully!");
      
      // Reset form
      setAmount("");
      setDate("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add land expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl bg-blue-100 dark:bg-blue-900 shadow-inner mb-2 animate-bounce-slow">
            🏗️
          </div>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
            Add Land Management Expense
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm font-medium flex items-center gap-1">🏷️ Category *</Label>
            <Select value={category} onValueChange={(value: LandExpenseCategory) => setCategory(value)}>
              <SelectTrigger className="h-9 sm:h-10 focus:ring-2 focus:ring-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {landExpenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getLandExpenseCategoryIcon(cat)} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-1">💸 Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 sm:h-10 focus:ring-2 focus:ring-blue-400"
              />
              {amount === '' && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-1">📅 Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 sm:h-10 focus:ring-2 focus:ring-blue-400"
              />
              {date === '' && <span className="text-xs text-red-500">Required</span>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">📝 Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes about this expense..."
              className="min-h-[60px] resize-none focus:ring-2 focus:ring-blue-400"
              rows={2}
            />
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 transition-transform duration-150 active:scale-95"
              disabled={loading}
            >
              {loading ? <span className="animate-spin mr-2">🏗️</span> : "Add Land Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLandExpenseModal;
