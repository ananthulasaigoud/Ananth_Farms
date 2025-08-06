import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, ExternalLink } from "lucide-react";

interface MultiBillImagesProps {
  imageUrls: string[] | null;
  alt?: string;
  className?: string;
  maxDisplay?: number;
}

export const MultiBillImages = ({ 
  imageUrls, 
  alt = "Bill images", 
  className = "",
  maxDisplay = 3
}: MultiBillImagesProps) => {
  const [showGrid, setShowGrid] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [returnToGrid, setReturnToGrid] = useState(false);

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const handleImageClick = (url: string) => {
    setFullscreenUrl(url);
    setReturnToGrid(true);
    setShowGrid(false);
  };

  const handleCloseFullscreen = () => {
    setFullscreenUrl(null);
    if (returnToGrid) {
      setShowGrid(true);
      setReturnToGrid(false);
    }
  };

  return (
    <>
      {/* View Bills button */}
      <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowGrid(true)}>
        View Bills
      </Button>

      {/* Grid of images */}
      {showGrid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setShowGrid(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-base">Bill Images</span>
              <Button variant="ghost" size="icon" onClick={() => setShowGrid(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative cursor-pointer group" onClick={() => handleImageClick(url)}>
                  <img
                    src={url}
                    alt={`${alt} ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-md border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                    <Image className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen overlay for image preview */}
      {fullscreenUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={handleCloseFullscreen}>
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={e => { e.stopPropagation(); handleCloseFullscreen(); }}
            >
              <X className="h-5 w-5" />
            </Button>
            <img
              src={fullscreenUrl}
              alt={alt}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-md"
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={e => { e.stopPropagation(); window.open(fullscreenUrl, '_blank'); }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open Full Size
            </Button>
          </div>
        </div>
      )}
    </>
  );
}; 