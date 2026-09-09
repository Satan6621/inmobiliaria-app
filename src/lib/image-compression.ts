/**
 * Compresión de imágenes en el cliente (WebP)
 * Para usuarios con conectividad variable en Venezuela
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: "webp",
};

/**
 * Comprime una imagen en el cliente antes de subirla al servidor
 */
export async function comprimirImagen(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Redimensionar si excede los máximos
      if (width > opts.maxWidth!) {
        height = (height * opts.maxWidth!) / width;
        width = opts.maxWidth!;
      }
      if (height > opts.maxHeight!) {
        width = (width * opts.maxHeight!) / height;
        height = opts.maxHeight!;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a Blob con el formato deseado
      const mimeType = `image/${opts.format}`;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al comprimir imagen"));
            return;
          }

          // Crear nuevo archivo con nombre comprimido
          const nombreComprimido = file.name.replace(/\.[^.]+$/, `.webp`);
          const archivoComprimido = new File([blob], nombreComprimido, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(archivoComprimido);
        },
        mimeType,
        opts.quality
      );
    };

    img.onerror = () => reject(new Error("Error al cargar imagen"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calcula el porcentaje de compresión logrado
 */
export function calcularAhorro(original: File, comprimido: File): number {
  const ahorro = ((original.size - comprimido.size) / original.size) * 100;
  return Math.round(ahorro);
}

/**
 * Valida que el archivo sea una imagen
 */
export function esImagenValida(file: File): boolean {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return tiposPermitidos.includes(file.type);
}

/**
 * Formatea tamaño de archivo legible
 */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Procesa múltiples imágenes con compresión
 */
export async function comprimirMultiples(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (index: number, total: number) => void
): Promise<File[]> {
  const resultados: File[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    const comprimida = await comprimirImagen(files[i], options);
    resultados.push(comprimida);
  }

  return resultados;
}
