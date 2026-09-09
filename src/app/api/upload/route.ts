import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase as supabaseForUpload } from "@/lib/supabase";

// Convertimos a WebP en Node antes de subir (óptimo para móviles con
// conectividad variable). Sharp procesa a máxima velocidad nativa.

const MAX_DIMENSION = 1920;
const QUALITY = 80;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Convertir/redimensionar a WebP en el servidor
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(bytes)
        .rotate() // respeta orientación EXIF
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY, effort: 4 })
        .toBuffer();
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
      bytesOriginal: bytes.length,
      bytesWebp: webpBuffer.length,
    });
  } catch {
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}