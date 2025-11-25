import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemove: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onRemove }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        onImageSelect(files[0]);
      }
    },
    [onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer group",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">
                Drop your bin image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse from your device
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden shadow-card">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected bin"
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium truncate">
              {selectedImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
