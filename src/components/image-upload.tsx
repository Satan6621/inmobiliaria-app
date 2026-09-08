"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  existingImages?: string[];
  maxFiles?: number;
}

export function ImageUpload({ onUpload, existingImages = [], maxFiles = 10 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - previews.length);
    if (newFiles.length === 0) return;

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Upload to Supabase Storage
    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error("Error uploading:", error);
      }
    }

    setUploading(false);
    if (uploadedUrls.length > 0) {
      onUpload([...previews.filter((p) => !p.startsWith("blob:")), ...uploadedUrls]);
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-all group"
      >
        <Upload className="w-8 h-8 text-text-muted group-hover:text-primary mx-auto mb-2 transition-colors" />
        <p className="text-sm text-text-secondary">
          {uploading ? "Subiendo imágenes..." : "Arrastra imágenes o haz clic para seleccionar"}
        </p>
        <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP (max {maxFiles} imágenes)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img src={preview} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          Subiendo imágenes...
        </div>
      )}
    </div>
  );
}
