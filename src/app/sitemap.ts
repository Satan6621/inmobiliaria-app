import type { MetadataRoute } from "next";
import { listarPropiedadesPublicas } from "@/lib/catalogo";

export const revalidate = 3600;

export const SITE_URL = "https://inmobiliaria-app-eta.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();
  let propiedades: Awaited<ReturnType<typeof listarPropiedadesPublicas>> = [];
  try {
    propiedades = await listarPropiedadesPublicas();
  } catch {
    propiedades = [];
  }

  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/propiedades`, lastModified: ahora, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/captacion`, lastModified: ahora, changeFrequency: "weekly", priority: 0.8 },
    ...(propiedades || []).map((p) => ({
      url: `${SITE_URL}/propiedades/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : ahora,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return urls;
}