import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      prospectos: {
        Row: {
          id: number;
          fecha: string;
          zona: string;
          rol: string;
          calificado: string;
          precio_usd: number;
          metros: number;
          precio_m2: number;
          urgencia_score: number;
          servicios: string;
          telefono: string;
          whatsapp_link: string;
          titulo: string;
          detalle: string;
          enlace: string;
          estado_gestion: string;
          notas: string;
        };
        Insert: Omit<{ id: number }, "id">;
      };
      inventario: {
        Row: {
          id: number;
          fecha: string;
          titulo: string;
          tipo: string;
          estado: string;
          ciudad: string;
          urbanizacion: string;
          precio_dueno: number;
          precio_venta: number;
          habs: number;
          banos: number;
          puestos: number;
          metros: number;
          precio_m2: number;
          servicios: string;
          descripcion: string;
          fotos_rutas: string;
          contacto_dueno: string;
          estatus: string;
          check_titulo: number;
          check_catastro: number;
          check_solvencia: number;
          check_hipoteca: number;
        };
        Insert: Omit<{ id: number }, "id">;
      };
    };
  };
};
