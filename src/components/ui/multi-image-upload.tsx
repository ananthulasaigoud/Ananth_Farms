import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Plus } from "lucide-react";

interface MultiImageUploadProps {
  value?: string[] | null;
  onChange: (urls: string[] | null) => void;
  onFileSelect?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  maxImages?: number;
}

export const MultiImageUpload = ({ 
  value = [], 
  onChange, 
  onFileSelect, 
  disabled = false,
  className = "",
  maxImages = 5
}: MultiImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>(value || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate total number of images
    if (previews.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Call parent handler
    onFileSelect?.(validFiles);
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews.length > 0 ? newPreviews : null);
  };

  const handleClick = () => {
    if (!disabled && previews.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const canAddMore = previews.length < maxImages;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">
        Bill Images (Optional) - {previews.length}/{maxImages}
      </Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt={`Bill preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => handleRemove(index)}
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {canAddMore && (
          <div
            className={`
              border-2 border-dashed border-gray-300 dark:border-gray-600 
              rounded-md p-2 text-center cursor-pointer transition-colors
              hover:border-gray-400 dark:hover:border-gray-500
              flex flex-col items-center justify-center h-24
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
            <Plus className="h-6 w-6 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add Image
            </p>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          Uploading images...
        </div>
      )}
      
      {previews.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click on images to remove them. You can upload up to {maxImages} images.
        </p>
      )}
    </div>
  );
}; 