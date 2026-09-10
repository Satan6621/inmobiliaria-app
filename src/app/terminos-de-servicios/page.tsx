import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, AlertTriangle, UserCheck, BadgeInfo, Gavel } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de Servicio | Venezuela Inmobiliaria",
  description:
    "Términos y condiciones de uso de la plataforma Venezuela Inmobiliaria. Al usar el sitio aceptas estas condiciones.",
};

export default function TerminosServiciosPage() {
  const secciones = [
    {
      icon: FileText,
      titulo: "1. Aceptación de los términos",
      texto:
        "Al acceder y usar la plataforma Venezuela Inmobiliaria aceptas estos Términos de Servicio. Si no estás de acuerdo, por favor no utilices el sitio.",
    },
    {
      icon: UserCheck,
      titulo: "2. Servicio de intermediación",
      texto:
        "La plataforma actúa como herramienta de captación y difusión de oportunidades inmobiliarias. No es propietaria ni garante de los inmuebles publicados: la información proviene de los propios interesados y de terceros, por lo que debe verificarse en cada caso.",
    },
    {
      icon: AlertTriangle,
      titulo: "3. Responsabilidad sobre la información",
      texto:
        "Los datos de propiedades, precios, ubicaciones y contactos publicados son de carácter informativo y pueden cambiar. No garantizamos la exactitud, integridad o disponibilidad de dicha información, ni la existencia jurídica de los inmuebles. El usuario es responsable de verificar la documentación antes de cualquier negociación.",
    },
    {
      icon: Scale,
      titulo: "4. Límites de responsabilidad",
      texto:
        "Venezuela Inmobiliaria no se responsabiliza por pérdidas, daños o perjuicios derivados del uso del sitio, de transacciones entre usuarios, de decisiones de inversión basadas en la información publicada, ni de fallos de disponibilidad del servicio. No prestamos asesoría jurídica ni financiera.",
    },
    {
      icon: BadgeInfo,
      titulo: "5. Uso correcto de la plataforma",
      texto:
        "Queda prohibido: enviar información falsa o engañosa, usar la plataforma para actividades fraudulentas o ilegales, copiar o explotar comercialmente el contenido sin autorización, y perjudicar el funcionamiento técnico del sitio.",
    },
    {
      icon: Gavel,
      titulo: "6. Ley aplicable",
      texto:
        "Estos términos se rigen por el ordenamiento jurídico de la República Bolivariana de Venezuela. Cualquier controversia será sometida a los tribunales competentes de la jurisdicción del usuario, conforme a la ley.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
          Términos de Servicio
        </h1>
        <p className="text-text-muted text-sm">Última actualización: septiembre de 2026</p>
      </div>

      <div className="space-y-4">
        {secciones.map((s) => (
          <div key={s.titulo} className="glass-card p-6">
            <h2 className="font-semibold font-[family-name:var(--font-display)] mb-2 flex items-center gap-2">
              <s.icon className="w-4 h-4 text-primary" /> {s.titulo}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">{s.texto}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Al publicar una solicitud o usar el catálogo aceptas estos términos. Lee también nuestra{" "}
          <Link href="/politicas-de-seguridad" className="text-primary hover:underline">
            Política de Seguridad y Privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}