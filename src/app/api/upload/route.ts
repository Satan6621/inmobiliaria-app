import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase as supabaseForUpload } from "@/lib/supabase";

// Convertimos a WebP en Node antes de subir (óptimo para móviles con
// conectividad variable). Sharp procesa a máxima velocidad nativa.
// ADEMÁS aplicamos una marca de agua destructiva en el servidor para
// proteger las captaciones contra el clonado de fotos por otros asesores.

const MAX_DIMENSION = 1920;
const QUALITY = 80;
const BRAND = "INMOBILIARIA CHUO-ZU";
const BRAND_URL = "inmobiliariachuozu.vercel.app";

/** SVG de marca de agua repetida en diagonal (tile) - difícil de recortar. */
function tileSvg(size: number): string {
  return `<svg width="${size * 2}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="none"/>
    <text x="${size * 0.5}" y="${size * 0.55}" font-family="Arial,Helvetica,sans-serif"
      font-size="${Math.round(size * 0.12)}" font-weight="800" fill="#ffffff"
      fill-opacity="0.06" transform="rotate(-22 ${size} ${size / 2})" text-anchor="middle">${BRAND}</text>
    <text x="${size * 1.5}" y="${size * 0.55}" font-family="Arial,Helvetica,sans-serif"
      font-size="${Math.round(size * 0.12)}" font-weight="800" fill="#ffffff"
      fill-opacity="0.06" transform="rotate(-22 ${size} ${size / 2})" text-anchor="middle">${BRAND}</text>
  </svg>`;
}

/** SVG central con el logo para que la foto nunca pueda republicarse limpia. */
function centerSvg(width: number, height: number): string {
  const fuente = Math.max(20, Math.min(width, height) * 0.05);
  const urlFont = Math.max(12, fuente * 0.45);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="50%" y="50%" width="0" height="0" fill="none"/>
    <rect x="${width * 0.5 - (width * 0.42)}" y="${height * 0.5 - (fuente * 2.0)}"
      width="${width * 0.84}" height="${fuente * 4.0}" rx="${fuente * 0.4}"
      fill="#000000" fill-opacity="0.35"/>
    <text x="${width / 2}" y="${height / 2}" font-family="Arial,Helvetica,sans-serif"
      font-size="${fuente}" font-weight="800" fill="#ffffff" fill-opacity="0.85"
      text-anchor="middle">${BRAND}</text>
    <text x="${width / 2}" y="${height / 2 + (fuente * 1.35)}" font-family="Arial,Helvetica,sans-serif"
      font-size="${urlFont}" font-weight="500" fill="#ffffff" fill-opacity="0.7"
      text-anchor="middle">${BRAND_URL}</text>
  </svg>`;
}

async function aplicarMarcaDeAgua(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const w = meta.width || 1200;
  const h = meta.height || 800;
  const tile = Math.max(220, Math.round(Math.min(w, h) * 0.36));

  return sharp(input)
    .composite([
      { input: Buffer.from(tileSvg(tile)), tile: true },
      { input: Buffer.from(centerSvg(w, h)), gravity: "centre" },
    ])
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Redimensionar primero, luego redondear con marca de agua en el servidor
    let webpBuffer: Buffer;
    try {
      const redimensionada = await sharp(bytes)
        .rotate() // respeta orientación EXIF
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
      webpBuffer = await aplicarMarcaDeAgua(redimensionada);
    } catch {
      // Si no es una imagen procesable, rechazar
      return NextResponse.json({ error: "Formato de imagen no válido" }, { status: 400 });
    }

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
    const filePath = `inmuebles/${fileName}`;

    const bucket = "inmuebles-fotos";

    const { data, error } = await supabaseForUpload.storage
      .from(bucket)
      .upload(filePath, new Uint8Array(webpBuffer), {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp",
      });

    if (error) {
      // Compatibilidad con el bucket antiguo
      if ((error as any)?.message?.includes("bucket")) {
        const { data: legacyData, error: legacyError } = await supabaseForUpload.storage
          .from("inmuebles")
          .upload(filePath, new Uint8Array(webpBuffer), {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/webp",
          });
        if (legacyError) {
          return NextResponse.json({ error: legacyError.message }, { status: 500 });
        }
        const { data: urlData } = supabaseForUpload.storage.from("inmuebles").getPublicUrl(legacyData.path);
        return NextResponse.json({
          url: urlData.publicUrl,
          bucket: "inmuebles",
          marca_agua: true,
          bytesOriginal: bytes.length,
          bytesWebp: webpBuffer.length,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseForUpload.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      bucket,
      marca_agua: true,
      bytesOriginal: bytes.length,
      bytesWebp: webpBuffer.length,
    });
  } catch {
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}