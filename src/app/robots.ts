import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/inventario", "/crm", "/mi-crm", "/seguimiento", "/finanzas", "/social", "/rastreador", "/hipotecas", "/mercado", "/guiones", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}