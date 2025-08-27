import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot } from 'lucide-react';
import AIChatbot from '@/components/AIChatbot';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[80vh] p-0 overflow-hidden border-0 rounded-xl flex flex-col">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white px-4 sm:px-5 py-3 sm:py-4">
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg font-semibold">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              Smart Farm AI Assistant
              <Badge
                variant="secondary"
                className="ml-1 sm:ml-2 text-[9px] sm:text-xs bg-white/20 text-white border-white/30"
              >
                Beta
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-white/90 text-xs sm:text-sm mt-1">
              Ask questions about crops, expenses, profits & get smart tips.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          {/* Tips row */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2 sm:px-6 sm:py-3">
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 text-xs sm:text-sm"
            >
              <Sparkles className="w-3 h-3 mr-1" /> Reduce expenses?
            </Badge>
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm"
            >
              Profit summary
            </Badge>
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-purple-50 text-purple-700 border-purple-200 text-xs sm:text-sm"
            >
              Next week tips
            </Badge>
          </div>

          <Separator />

          {/* Chat area fills available space */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <AIChatbot className="h-full w-full rounded-lg bg-white/60 dark:bg-gray-900/60 shadow-inner p-2 sm:p-3" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
