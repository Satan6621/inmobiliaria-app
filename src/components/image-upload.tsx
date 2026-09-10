"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, ArrowDown } from "lucide-react";
import { comprimirImagen, formatearTamano, calcularAhorro } from "@/lib/image-compression";
import { authFetchMultipart } from "@/lib/api";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  existingImages?: string[];
  maxFiles?: number;
}

interface CompressedFile {
  id: string;
  preview: string;
  file: File;
  originalSize: number;
  compressedSize: number;
  status: "comprimida" | "subiendo" | "subida" | "error";
}

export function ImageUpload({ onUpload, existingImages = [], maxFiles = 10 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [savedBytes, setSavedBytes] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - previews.length);
    if (newFiles.length === 0) return;

    // Compress images on client (WebP) before uploading
    setCompressing(true);
    const nuevosCompressed: CompressedFile[] = [];

    for (const file of newFiles) {
      try {
        const comprimida = await comprimirImagen(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.8 });
        const preview = URL.createObjectURL(comprimida);
        const ahorro = calcularAhorro(file, comprimida);
        setSavedBytes((prev) => prev + (file.size - comprimida.size));

        nuevosCompressed.push({
          id: Math.random().toString(36).slice(2),
          preview,
          file: comprimida,
          originalSize: file.size,
          compressedSize: comprimida.size,
          status: "comprimida",
        });
      } catch (error) {
        console.error("Error comprimiendo:", error);
        // Fallback: use original file
        nuevosCompressed.push({
          id: Math.random().toString(36).slice(2),
          preview: URL.createObjectURL(file),
          file,
          originalSize: file.size,
          compressedSize: file.size,
          status: "comprimida",
        });
      }
    }

    setCompressedFiles((prev) => [...prev, ...nuevosCompressed]);
    setCompressing(false);

    // Create previews
    const newPreviews = nuevosCompressed.map((c) => c.preview);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Upload compressed images
    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const comp of nuevosCompressed) {
      setCompressedFiles((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, status: "subiendo" } : c))
      );

      try {
        const formData = new FormData();
        formData.append("file", comp.file);

        const res = await authFetchMultipart("/api/upload", formData);

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
          setCompressedFiles((prev) =>
            prev.map((c) => (c.id === comp.id ? { ...c, status: "subida" } : c))
          );
        } else {
          setCompressedFiles((prev) =>
            prev.map((c) => (c.id === comp.id ? { ...c, status: "error" } : c))
          );
        }
      } catch (error) {
        console.error("Error uploading:", error);
        setCompressedFiles((prev) =>
          prev.map((c) => (c.id === comp.id ? { ...c, status: "error" } : c))
        );
      }
    }

    setUploading(false);
    if (uploadedUrls.length > 0) {
      onUpload([...previews.filter((p) => !p.startsWith("blob:")), ...uploadedUrls]);
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCompressedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAhorro = Math.round((savedBytes / 1024 / 1024) * 10) / 10;

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
        <p className="text-xs text-text-muted mt-1">
          JPG, PNG (se comprimen a WebP automáticamente)
        </p>
        <p className="text-xs text-success flex items-center justify-center gap-1 mt-1">
          <ArrowDown className="w-3 h-3" />
          Compresión WebP + marca de agua automática en el servidor
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {compressing && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          Comprimiendo imágenes a WebP (optimizado para conexiones lentas)...
        </div>
      )}

      {totalAhorro > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
          <CheckCircle2 className="w-4 h-4" />
          Se ahorraron ~{totalAhorro} MB en esta sesión gracias a la compresión WebP
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((preview, i) => {
            const comp = compressedFiles[i];
            return (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img src={preview} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                {comp && comp.status === "subida" && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                {comp && comp.status === "subiendo" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                {comp && comp.status === "error" && (
                  <div className="absolute inset-0 bg-danger/70 flex items-center justify-center text-white text-[10px] font-semibold">
                    Error
                  </div>
                )}
                {comp && comp.compressedSize < comp.originalSize && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-success/90 text-white text-[9px] font-semibold">
                    -{Math.round((1 - comp.compressedSize / comp.originalSize) * 100)}%
                  </div>
                )}
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          Subiendo imágenes comprimidas...
        </div>
      )}
    </div>
  );
}