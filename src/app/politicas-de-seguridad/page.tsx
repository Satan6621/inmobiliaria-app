import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Lock, Eye, Database, Share2, RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Seguridad | Inmobiliaria Chuo-Zu",
  description:
    "Política de seguridad y protección de datos de Inmobiliaria Chuo-Zu: cómo protegemos la información de clientes y visitantes.",
};

export default function PoliticasSeguridadPage() {
  const secciones = [
    {
      icon: ShieldCheck,
      titulo: "1. Nuestro compromiso",
      texto:
        "En Inmobiliaria Chuo-Zu tratamos la información de nuestros clientes y visitantes con confidencialidad y responsabilidad. Implementamos medidas técnicas y organizativas para proteger los datos personales y las comunicaciones dentro de la plataforma.",
    },
    {
      icon: Lock,
      titulo: "2. Seguridad de la información",
      texto:
        "Las comunicaciones entre tu navegador y nuestros servidores viajan cifradas (HTTPS). Los datos se almacenan en servicios seguros en la nube con control de accesos por roles. No vendemos ni cedemos tus datos a terceros con fines comerciales.",
    },
    {
      icon: Eye,
      titulo: "3. Información que recopilamos",
      texto:
        "Recopilamos únicamente la información necesaria para el servicio: nombre, teléfono de contacto, tipo de interés (comprar o vender), ubicación y presupuesto. También registramos datos técnicos básicos (como el navegador) para el correcto funcionamiento y la mejora del sitio.",
    },
    {
      icon: Share2,
      titulo: "4. Uso de la información",
      texto:
        "Tus datos se usan para ponernos en contacto contigo, buscar coincidencias entre oferta y demanda, y mantenerte informado sobre tu solicitud. Al publicar una solicitud pública, algunos datos limitados (como la zona y el tipo de interés) pueden mostrarse para facilitar el contacto entre partes.",
    },
    {
      icon: Database,
      titulo: "5. Conservación y acceso",
      texto:
        "Conservamos la información mientras sea útil para el servicio y de acuerdo con la ley aplicable. Puedes solicitar la consulta, corrección o eliminación de tus datos en cualquier momento contactándonos por los canales oficiales de la plataforma.",
    },
    {
      icon: ShieldAlert,
      titulo: "6. Responsabilidad",
      texto:
        "Hacemos esfuerzos razonables para proteger los datos, pero ningún sistema es infalible. No nos hacemos responsables por accesos indebidos derivados de uso negligente de tus credenciales, dispositivos o redes públicas, ni por información que decidas compartir voluntariamente con terceros.",
    },
    {
      icon: RefreshCcw,
      titulo: "7. Cambios a esta política",
      texto:
        "Esta política puede actualizarse para reflejar cambios legales o funcionales. La versión vigente estará siempre publicada en esta página con su fecha de actualización.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
          Política de Seguridad y Privacidad
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
          Si tienes dudas sobre el tratamiento de tus datos, escríbenos por WhatsApp o por los canales de contacto de la plataforma.
        </p>
        <Link href="/captacion" className="btn-primary mt-4 inline-flex">Contactar con el asesor</Link>
      </div>
    </div>
  );
}