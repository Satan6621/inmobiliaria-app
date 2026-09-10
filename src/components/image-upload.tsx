"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2, ArrowDown } from "lucide-react";
import { comprimirImagen, calcularAhorro } from "@/lib/image-compression";
import { authFetchMultipart } from "@/lib/api";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  existingImages?: string[];
  maxFiles?: number;
}

interface UploadItem {
  id: string;
  url: string;
  status: "nueva" | "subiendo" | "subida" | "error";
  error?: string;
  originalSize: number;
  compressedSize: number;
  original: File | null;
  compressed: File | null;
}

/** Límite de payload para funciones serverless (Vercel ~4,5 MB). */
const MAX_FALLBACK_BYTES = 3.5 * 1024 * 1024;

export function ImageUpload({ onUpload, existingImages = [], maxFiles = 10 }: ImageUploadProps) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    existingImages.map((url) => ({
      id: Math.random().toString(36).slice(2),
      url,
      status: "subida",
      originalSize: 0,
      compressedSize: 0,
      original: null,
      compressed: null,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [savedBytes, setSavedBytes] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patchItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleFiles = async (files: FileList) => {
    const disponibles = maxFiles - items.length;
    const newFiles = Array.from(files).slice(0, disponibles);
    if (newFiles.length === 0) return;

    setCompressing(true);
    const nuevos: UploadItem[] = [];

    for (const file of newFiles) {
      const id = Math.random().toString(36).slice(2);
      try {
        const comprimida = await comprimirImagen(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.8 });
        const ahorro = calcularAhorro(file, comprimida);
        setSavedBytes((prev) => prev + (file.size - comprimida.size));
        nuevos.push({
          id,
          url: URL.createObjectURL(comprimida),
          status: "nueva",
          originalSize: file.size,
          compressedSize: comprimida.size,
          original: file,
          compressed: comprimida,
        });
      } catch {
        // Fallback al original si no puede comprimirse (formato raro/rotado)
        if (file.size > MAX_FALLBACK_BYTES) {
          nuevos.push({
            id,
            url: URL.createObjectURL(file),
            status: "error",
            error: "Imagen demasiado grande para subir",
            originalSize: file.size,
            compressedSize: file.size,
            original: file,
            compressed: null,
          });
        } else {
          nuevos.push({
            id,
            url: URL.createObjectURL(file),
            status: "nueva",
            originalSize: file.size,
            compressedSize: file.size,
            original: file,
            compressed: file,
          });
        }
      }
    }

    setItems((prev) => [...prev, ...nuevos]);
    setCompressing(false);

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const item of nuevos) {
      if (!item.compressed) continue;
      patchItem(item.id, { status: "subiendo" });

      try {
        const formData = new FormData();
        formData.append("file", item.compressed);

        const res = await authFetchMultipart("/api/upload", formData);

        let data: { url?: string; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (res.ok && data.url) {
          // Reemplazar el preview blob por la URL real de producción
          patchItem(item.id, { status: "subida", url: data.url });
          uploadedUrls.push(data.url);
        } else {
          patchItem(item.id, {
            status: "error",
            error: data.error || `Error de servidor (${res.status})`,
          });
        }
      } catch (error) {
        console.error("Error uploading:", error);
        patchItem(item.id, {
          status: "error",
          error: "No se pudo subir la imagen. Revisa tu conexión.",
        });
      }
    }

    setUploading(false);
    // Solo las URLs nuevas de esta tanda (evita duplicados al acumular)
    if (uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }
  };

  const removePreview = (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
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
        <p className="text-xs text-text-muted mt-1">JPG, PNG (se comprimen a WebP automáticamente)</p>
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

      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img src={item.url} alt="" className="w-full h-full object-cover" />
              {item.status === "subida" && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
              {item.status === "subiendo" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 bg-danger/70 flex items-center justify-center text-white text-[10px] font-semibold px-2 text-center">
                  {item.error || "Error"}
                </div>
              )}
              {item.compressedSize > 0 && item.compressedSize < item.originalSize && item.originalSize > 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-success/90 text-white text-[9px] font-semibold">
                  -{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                </div>
              )}
              <button
                onClick={() => removePreview(item.id)}
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
          Subiendo imágenes comprimidas...
        </div>
      )}
    </div>
  );
}