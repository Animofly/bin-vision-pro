import { Upload, FileText, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TextFileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemove: () => void;
}

export const TextFileUpload = ({ onFileSelect, selectedFile, onRemove }: TextFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.txt')) {
        toast.error("Please upload a text file (.txt)");
        return;
      }
      onFileSelect(file);
      toast.success("Items file uploaded");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Upload Items List
              </p>
              <p className="text-xs text-muted-foreground">
                Text file with format: name quantity
              </p>
            </div>
          </div>
        </button>
      ) : (
        <div className="p-4 bg-accent/50 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
