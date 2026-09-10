import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppFloat } from "@/components/whatsapp-button";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";

export const metadata: Metadata = {
  title: "Inmobiliaria Chuo-Zu - Plataforma Integral de Bienes Raíces",
  description: "Plataforma integral de wholesaling y bienes raíces en Venezuela. Rastreador de mercado, CRM, inventario y marketing multiplataforma.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistrar />
        <ThemeProvider>
          <Sidebar />
          <main className="ml-[260px] min-h-screen">
            <div className="p-8">{children}</div>
            <footer className="p-6 border-t border-border-subtle text-center text-xs text-text-muted space-x-4">
              <span>© {new Date().getFullYear()} Inmobiliaria Chuo-Zu.</span>
              <a href="/politicas-de-seguridad" className="hover:text-text-primary transition-colors">Política de Seguridad</a>
              <a href="/terminos-de-servicios" className="hover:text-text-primary transition-colors">Términos de Servicio</a>
            </footer>
          </main>
          <WhatsAppFloat />
        </ThemeProvider>
      </body>
    </html>
  );
}
