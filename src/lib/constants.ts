export const ZONAS_DISPONIBLES: Record<string, string> = {
  "Cojedes (San Carlos, Tinaquillo)": "Cojedes",
  "Carabobo (Valencia, San Diego, Naguanagua, Los Guayos)": "Valencia Carabobo",
  "Caracas (Distrito Capital)": "Caracas",
  "Miranda (Chacao, Baruta, El Hatillo, San Antonio)": "Chacao Miranda",
  "Aragua (Maracay, Turmero, El Limón)": "Maracay",
  "Lara (Barquisimeto, Cabudare)": "Barquisimeto",
  "Zulia (Maracaibo, San Francisco)": "Maracaibo",
  "Anzoátegui (Lechería, Puerto La Cruz)": "Lecheria",
  "Nueva Esparta (Margarita, Porlamar)": "Margarita",
  "Bolívar (Ciudad Guayana, Puerto Ordaz)": "Bolívar",
  "Falcón (Coro, Punto Fijo)": "Falcón",
  "Mérida (Mérida, El Vigía)": "Mérida",
  "Táchira (San Cristóbal, Mérida)": "Táchira",
  "Trujillo (Trujillo, Valera)": "Trujillo",
  "Yaracuy (San Felipe)": "Yaracuy",
  "Guárico (San Juan de los Morros)": "Guárico",
  "Monagas (Maturín)": "Monagas",
  "Sucre (Cumaná)": "Sucre",
  "Amazonas (Puerto Ayacucho)": "Amazonas",
  "Delta Amacuro (Tucupita)": "Delta Amacuro",
  "Vargas (La Guaira)": "Vargas",
};

export const ESTADOS_VENEZUELA = [
  "Cojedes", "Carabobo", "Distrito Capital", "Miranda", "Aragua", "Lara", "Zulia",
  "Anzoátegui", "Bolívar", "Falcón", "Mérida", "Táchira", "Trujillo", "Yaracuy",
  "Guárico", "Monagas", "Sucre", "Nueva Esparta", "Amazonas", "Delta Amacuro", "Vargas",
] as const;

export const MUNICIPIOS_POR_ESTADO: Record<string, string[]> = {
  Cojedes: ["San Carlos", "Tinaquillo", "Anzoátegui", "Girardot", "Tinaco", "Lima Blanco", "Ricaurte", "Rómulo Gallegos", "Ezequiel Zamora"],
  Carabobo: ["Valencia", "Naguanagua", "San Diego", "Los Guayos", "Guacara", "Puerto Cabello", "San Joaquín", "Diego Ibarra", "Bejuma", "Miranda"],
  "Distrito Capital": ["Libertador", "El Recreo", "Santa Rosalía", "Leoncio Martínez"],
  Miranda: ["Sucre", "Baruta", "Chacao", "El Hatillo", "Los Salias", "Guaicaipuro", "Carrizal", "Plaza", "Zamora", "Independencia"],
  Aragua: ["Girardot", "Mario Briceño Iragorry", "Santiago Mariño", "José Félix Ribas", "Sucre", "Zamora", "Francisco Linares Alcántara", "Libertador"],
  Lara: ["Iribarren", "Palavecino", "Crespo", "Jiménez", "Morán", "Torres", "Urdaneta"],
  Zulia: ["Maracaibo", "San Francisco", "La Cañada de Urdaneta", "Mara", "Guajira", "Cabimas", "Lagunillas", "Santa Rita", "Machiques de Perijá", "Colón"],
  Anzoátegui: ["Simón Bolívar", "Diego Bautista Urbaneja", "Sotillo", "Guanta", "Anaco", "Simón Rodríguez", "Freites", "Bruzual", "Independencia"],
  Bolívar: ["Caroní", "Heres", "Piar", "Roscio", "Sifontes", "Gran Sabana", "Cedeño"],
  Falcón: ["Miranda", "Carirubana", "Colina", "Los Taques", "Silva", "Mauroa", "Zamora", "Acosta", "Falcón"],
  Mérida: ["Libertador", "Alberto Adriani", "Campo Elías", "Santos Marquina", "Tovar", "Zea", "Rangel"],
  Táchira: ["San Cristóbal", "Bolívar", "Cárdenas", "Ureña", "Junín", "García de Hevia", "Guásimos", "Lobatera", "Fernández Feo"],
  Trujillo: ["Trujillo", "Valera", "Boconó", "Betijoque", "Escuque", "Motatán", "Pampán", "Carache"],
  Yaracuy: ["San Felipe", "Independencia", "Cocorote", "Bruzual", "Peña", "Bolívar", "Nirgua", "Urachiche"],
  Guárico: ["Juan Germán Roscio", "Miranda", "Leonardo Infante", "Ortiz", "Zaraza", "Camaguán", "Chaguaramas", "Julián Mellado", "Monagas"],
  Monagas: ["Maturín", "Ezequiel Zamora", "Caripe", "Cedeño", "Uracoa", "Libertador"],
  Sucre: ["Sucre", "Bermúdez", "Montes", "Valdez", "Arizmendi", "Andrés Eloy Blanco"],
  "Nueva Esparta": ["Mariño", "Arismendi", "García", "Tubores", "Díaz", "Macanao", "Antolín del Campo"],
  Amazonas: ["Atures", "Atabapo", "Manapiare", "Alto Orinoco", "Río Negro"],
  "Delta Amacuro": ["Tucupita", "Pedernales", "Antonio Díaz", "Casacoima"],
  Vargas: ["Vargas"],
};

export const ZONAS_POR_MUNICIPIO: Record<string, string[]> = {
  "San Carlos": ["Centro de San Carlos", "Cantaclaro", "La Campiña", "Urbanización El Carmen", "Urbanización Limoncito", "La Aurora", "San Rafael", "El Maracay", "La Guacamaya", "El Bosque", "Caja de Agua", "Montes de Oca"],
  Tinaquillo: ["Centro de Tinaquillo", "La Campiña", "Villa Italia", "Los Samanes", "Urbanización Miranda", "La Macandona", "Las Flores", "Brisas del Sur", "San Luis"],
  Anzoátegui: ["Cojedes (centro)", "Chupadero", "Santa Rosa", "Camoruco", "El Guárico"],
  Girardot: ["El Baúl", "San José de Mapuey", "El Chorro"],
  Tinaco: ["Tinaco centro", "El Amparo", "La Palma", "Lechozas"],
  "Lima Blanco": ["Macapo", "La Sierra", "Las Vegas"],
  Ricaurte: ["Libertad", "La Unión", "El Laurel", "San José de la Montaña"],
  "Rómulo Gallegos": ["Las Vegas", "La Pascua", "El Jobo"],
  "Ezequiel Zamora": ["San Carlos de Mapuey", "El Limón", "San José"],
};

/** Código de cartera por estado: COJ-101, CAR-102, MIR-103... */
export function generarCodigoCartera(estado: string, contador: number, listaExistente: string[] = []): string {
  const abrev: Record<string, string> = {
    Cojedes: "COJ", Carabobo: "CAR", "Distrito Capital": "CCS", Miranda: "MIR",
    Aragua: "ARG", Lara: "LAR", Zulia: "ZUL", Anzoátegui: "ANZ", Bolívar: "BOL",
    Falcón: "FAL", Mérida: "MER", Táchira: "TAC", Trujillo: "TRU", Yaracuy: "YAR",
    Guárico: "GUA", Monagas: "MON", Sucre: "SUC", "Nueva Esparta": "NVA",
    Amazonas: "AMA", "Delta Amacuro": "DEL", Vargas: "VAR",
  };
  const prefijo = abrev[estado] || "VEN";

  const usados = new Set(
    listaExistente
      .map((c) => c?.match(/-(\d+)$/))
      .filter(Boolean)
      .map((m: any) => Number(m[1]))
  );
  let numero = 100 + (contador % 900);
  while (usados.has(numero)) numero += 1;
  return `${prefijo}-${numero}`;
}

export const TERMINOS_INMOBILIARIOS = [
  "apartamento", "apto", "casa", "townhouse", "town house", "th",
  "terreno", "galpon", "galpón", "quinta", "penthouse", "pent house",
  "ph", "inmueble", "propiedad", "habitacion", "parcela", "edificio",
];

export const PALABRAS_PROHIBIDAS = [
  "carro", "vehiculo", "vehículo", "camioneta", "moto", "toyota", "chevrolet",
  "ford", "corolla", "optra", "spark", "fiesta", "nevera", "lavadora",
  "aire acondicionado", "split", "iphone", "samsung", "laptop", "computadora",
  "televisor", "tv", "ropa", "zapatos", "repuesto", "repuestos", "caucho",
  "cauchos", "bateria", "baterias", "perro", "perros", "cachorro", "comida",
  "muebles", "comedor", "juego de cuarto",
];

export const PALABRAS_URGENCIA = [
  "motivo de viaje", "viaje al exterior", "remato", "remate", "urgencia",
  "oportunidad", "escucho ofertas", "precio de regalo", "recibo vehiculo",
  "recibo carro", "acepto vehiculo", "liquido", "negociable",
];

export const PALABRAS_DUENO = [
  "trato directo", "sin intermediarios", "abstenerse asesores",
  "abstenerse inmobiliarias", "propietario", "dueño vende", "directo de dueño",
];

export const PALABRAS_COMPRADOR = [
  "busco comprar", "compro", "en busca de", "busco casa", "busco apartamento",
  "tengo presupuesto", "comprador directo", "busco townhouse", "tengo cliente", "quien vende",
];

export const ESTADOS_GESTION = ["NUEVO", "CONTACTADO", "EN NEGOCIACION", "DESCARTADO"] as const;

export const ESTADOS_SOLICITUD = ["NUEVA", "CONTACTADA", "PROMOVIDA", "DESCARTADA"] as const;

export const TIPOS_INMUEBLE = ["Apartamento", "Casa", "Townhouse", "Terreno", "Galpón", "Oficina/Local"] as const;

/** Número de WhatsApp del asesor: 58 + 41234567 (sin el 0 inicial) */
export const WHATSAPP_COJEDES = "584141234567";

/** Convierte un teléfono venezolano suelto a un link wa.me */
export function buildWhatsAppLink(telefono: string | null | undefined, mensaje?: string): string {
  const limpio = (telefono || "").replace(/[^0-9]/g, "");
  let numero = limpio;
  if (limpio.startsWith("0")) numero = `58${limpio.slice(1)}`;
  else if (!limpio.startsWith("58")) numero = `58${limpio}`;
  const url = `https://wa.me/${numero}`;
  return mensaje ? `${url}?text=${encodeURIComponent(mensaje)}` : url;
}

export const DEFAULT_BOT_TOKEN = "8918703330:AAG74VYqyO0L11y0BKqCy5HFiAqPbBWCJOM";
export const DEFAULT_CHAT_ID = "1841487600";
