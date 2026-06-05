// LocalStorage Database Wrapper

export type Property = {
  id: string;
  name: string;
  location: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images: string[];
  category: 'economico' | 'medio' | 'premium';
  available: boolean;
  createdAt: string;
};

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaSecondary: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
};

export type WhatsAppConfig = {
  number: string;
  message: string;
  buttonText: string;
};

export type UploadedFile = {
  id: string;
  name: string;
  data: string;
  type: 'image' | 'audio';
  createdAt: string;
};

export type AudioTrack = {
  id: string;
  name: string;
  format: string;
  data: string; // base64
  createdAt: string;
};

export type PricingCategory = {
  id: string;
  name: string;
  priceRange: string;
  features: string[];
};

// ── Sub-services for "Administración de Inmuebles" ──

export type AudiovisualSubService = {
  visible: boolean;
  title: string;
  description: string;
  includes: string[];
  price: string;
  commission: string;
  benefit: string;
  ownershipNote: string;
  noExclusivity: boolean;
};

export type BrokerageSubService = {
  visible: boolean;
  title: string;
  description: string;
  firstMonthCovers: string[];
  fromSecondMonthNote: string;
  benefits: string[];
};

// Legacy (kept for backward compat with any existing admin reads)
export type PropertyManagementService = AudiovisualSubService;

export type ActivityLog = {
  id: string;
  action: string;
  details: string;
  timestamp: string;
};

// ── Seeds ──────────────────────────────────────────

const SEED_PROPERTIES: Property[] = [
  {
    id: "p1", name: "OASIS CONCRETO", location: "El Poblado, Medellín",
    price: 850000000, area: 120, bedrooms: 2, bathrooms: 2,
    description: "Apartamento de diseño brutalista con acabados en concreto expuesto y domótica avanzada. Vistas panorámicas a la ciudad.",
    images: ["/images/demo-apt-1.png"], category: "premium", available: true, createdAt: new Date().toISOString()
  },
  {
    id: "p2", name: "NOIR LOFT", location: "Chapinero, Medellín",
    price: 620000000, area: 85, bedrooms: 1, bathrooms: 1,
    description: "Loft de concepto abierto con tonos oscuros y luz tenue. Ideal para ejecutivos y creativos. Acabados mate y madera quemada.",
    images: ["/images/demo-apt-2.png"], category: "medio", available: true, createdAt: new Date().toISOString()
  },
  {
    id: "p3", name: "ESTUDIO ZERO", location: "Laureles, Bogotá",
    price: 450000000, area: 60, bedrooms: 1, bathrooms: 1,
    description: "Espacio minimalista funcional. Menos es más. Diseñado para maximizar la entrada de luz natural conservando privacidad.",
    images: ["/images/demo-apt-3.png"], category: "economico", available: true, createdAt: new Date().toISOString()
  }
];

const SEED_CONTENT: SiteContent = {
  heroTitle: "Broki Inmobiliaria",
  heroSubtitle: "Espacios que definen tu estilo de vida.",
  heroCta: "Ver Apartamentos",
  heroCtaSecondary: "Contáctanos",
  contactPhone: "3507081756",
  contactEmail: "broki.inmobiliaria@gmail.com",
  contactWhatsapp: "573507081756"
};

const SEED_WHATSAPP: WhatsAppConfig = {
  number: "573507081756",
  message: "Hola, estoy interesado en conocer más sobre sus apartamentos disponibles.",
  buttonText: "Escríbenos"
};

const SEED_PRICING: PricingCategory[] = [
  { id: "economico", name: "Estándar", priceRange: "Desde $350M COP", features: ["Diseño Funcional", "Ubicación Estratégica", "1-2 Habitaciones"] },
  { id: "medio", name: "Avanzado", priceRange: "Desde $600M COP", features: ["Acabados Premium", "Domótica Básica", "Vistas Panorámicas"] },
  { id: "premium", name: "Signature", priceRange: "Desde $900M COP", features: ["Arquitectura de Autor", "Materiales Importados", "Servicios Exclusivos"] }
];

const SEED_AUDIOVISUAL: AudiovisualSubService = {
  visible: true,
  title: "Producción Audiovisual para Venta de Inmuebles",
  description: "Potenciamos la venta de inmuebles mediante contenido audiovisual profesional.",
  includes: [
    "2 videos de alta calidad",
    "Tomas aéreas con dron",
    "20 fotografías profesionales en alta calidad",
    "Material para inventarios y promoción",
    "Ficha técnica del inmueble"
  ],
  price: "$600.000 COP",
  commission: "2.8% sobre el valor final de venta",
  benefit: "El valor invertido en el trabajo audiovisual será devuelto al concretarse la venta con nosotros.",
  ownershipNote: "El propietario conserva todo el contenido realizado y puede utilizarlo libremente para cualquier necesidad.",
  noExclusivity: true
};

const SEED_BROKERAGE: BrokerageSubService = {
  visible: true,
  title: "Corretaje y Administración de Arrendamientos",
  description: "Trabajamos bajo modalidad de corretaje con respaldo de aseguradoras reconocidas, garantizando un proceso seguro, transparente y confiable.",
  firstMonthCovers: [
    "Comisión inmobiliaria",
    "Estudio de perfiles",
    "Póliza de arrendamiento",
    "Gestión documental"
  ],
  fromSecondMonthNote: "El propietario recibe el 100% del canon mensual sin descuentos adicionales.",
  benefits: [
    "Filtro de clientes calificados",
    "Proceso ágil de colocación",
    "Respaldo jurídico durante la vigencia del contrato",
    "Respaldo financiero mediante póliza de arrendamiento",
    "Seguimiento permanente al inmueble",
    "Acompañamiento profesional durante todo el proceso"
  ]
};

// ── Init ────────────────────────────────────────────

export const initDB = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('broki_properties'))
    localStorage.setItem('broki_properties', JSON.stringify(SEED_PROPERTIES));
  if (!localStorage.getItem('broki_content'))
    localStorage.setItem('broki_content', JSON.stringify(SEED_CONTENT));
  if (!localStorage.getItem('broki_prices'))
    localStorage.setItem('broki_prices', JSON.stringify(SEED_PRICING));
  if (!localStorage.getItem('broki_images'))
    localStorage.setItem('broki_images', JSON.stringify([]));
  if (!localStorage.getItem('broki_gallery'))
    localStorage.setItem('broki_gallery', JSON.stringify(["/images/demo-apt-1.png", "/images/demo-apt-2.png", "/images/demo-apt-3.png"]));
  if (!localStorage.getItem('broki_whatsapp'))
    localStorage.setItem('broki_whatsapp', JSON.stringify(SEED_WHATSAPP));
  if (!localStorage.getItem('broki_activity'))
    localStorage.setItem('broki_activity', JSON.stringify([]));
  if (!localStorage.getItem('broki_tracks'))
    localStorage.setItem('broki_tracks', JSON.stringify([]));
  if (!localStorage.getItem('broki_audiovisual_svc'))
    localStorage.setItem('broki_audiovisual_svc', JSON.stringify(SEED_AUDIOVISUAL));
  if (!localStorage.getItem('broki_brokerage_svc'))
    localStorage.setItem('broki_brokerage_svc', JSON.stringify(SEED_BROKERAGE));
};

export const getDB = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch { return fallback; }
};

export const setDB = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const addActivityLog = (action: string, details: string): void => {
  const logs = getDB<ActivityLog[]>('broki_activity', []);
  const entry: ActivityLog = {
    id: Math.random().toString(36).substring(2, 9),
    action, details,
    timestamp: new Date().toISOString(),
  };
  setDB('broki_activity', [entry, ...logs].slice(0, 100));
};
