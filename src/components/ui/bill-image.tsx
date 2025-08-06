import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, X, ExternalLink } from "lucide-react";

interface BillImageProps {
  imageUrl: string | null;
  alt?: string;
  className?: string;
}

export const BillImage = ({ imageUrl, alt = "Bill image", className = "" }: BillImageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) {
    return null;
  }

  return (
    <>
      <div className={`relative group cursor-pointer ${className}`} onClick={() => setIsOpen(true)}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
          <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            <div className="absolute bottom-2 left-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Full Size
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 