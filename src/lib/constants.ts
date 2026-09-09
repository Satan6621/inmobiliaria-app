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

export const TIPOS_INMUEBLE = ["Apartamento", "Casa", "Townhouse", "Terreno", "Galpón", "Oficina/Local"] as const;

export const DEFAULT_BOT_TOKEN = "8918703330:AAG74VYqyO0L11y0BKqCy5HFiAqPbBWCJOM";
export const DEFAULT_CHAT_ID = "1841487600";
