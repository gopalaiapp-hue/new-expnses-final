import { useRef } from "react";
import { Button } from "../ui/button";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ReceiptUploaderProps {
  receipts: string[];
  onChange: (receipts: string[]) => void;
  maxFiles?: number;
}

export function ReceiptUploader({ receipts, onChange, maxFiles = 4 }: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (receipts.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} receipts allowed`);
      return;
    }

    const newReceipts: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        newReceipts.push(base64);
      } catch (error) {
        console.error("Failed to process image:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (newReceipts.length > 0) {
      onChange([...receipts, ...newReceipts]);
      toast.success(`${newReceipts.length} receipt${newReceipts.length > 1 ? "s" : ""} added`);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveReceipt = (index: number) => {
    onChange(receipts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Receipt Grid */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {receipts.map((receipt, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={receipt}
                alt={`Receipt ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveReceipt(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Buttons */}
      {receipts.length < maxFiles && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Helper Text */}
      {receipts.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
          <span className="text-sm">No receipts attached</span>
        </div>
      )}

      {receipts.length > 0 && receipts.length < maxFiles && (
        <p className="text-xs text-muted-foreground text-center">
          {receipts.length} of {maxFiles} receipts • Click to add more
        </p>
      )}
    </div>
  );
}
