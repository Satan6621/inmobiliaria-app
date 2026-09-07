import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { texto, botToken, chatId, fotos } = await request.json();

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Faltan botToken o chatId" }, { status: 400 });
    }

    const urlBase = `https://api.telegram.org/bot${botToken}`;

    if (!fotos || fotos.length === 0) {
      // Send text message only
      const res = await fetch(`${urlBase}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: texto,
          parse_mode: "Markdown",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        return NextResponse.json({ success: true, message: "Mensaje publicado con éxito" });
      }
      return NextResponse.json({ error: data.description || "Error de Telegram" }, { status: 400 });
    }

    if (fotos.length === 1) {
      // Send single photo
      const res = await fetch(`${urlBase}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: fotos[0],
          caption: texto.substring(0, 1024),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        return NextResponse.json({ success: true, message: "Foto y ficha publicadas" });
      }
      return NextResponse.json({ error: data.description }, { status: 400 });
    }

    // Send media group
    const media = fotos.slice(0, 10).map((foto: string, idx: number) => ({
      type: "photo",
      media: foto,
      ...(idx === 0 ? { caption: texto.substring(0, 1024) } : {}),
    }));

    const res = await fetch(`${urlBase}/sendMediaGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        media,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return NextResponse.json({ success: true, message: `Álbum de ${fotos.length} fotos publicado` });
    }
    return NextResponse.json({ error: data.description }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión con Telegram" }, { status: 500 });
  }
}
