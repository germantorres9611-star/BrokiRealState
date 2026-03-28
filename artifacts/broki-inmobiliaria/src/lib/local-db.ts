// LocalStorage Database Wrapper simulating an API

export type Property = {
  id: string;
  name: string;
  location: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images: string[]; // array of base64 strings or URLs
  category: 'economico' | 'medio' | 'premium';
  available: boolean;
  createdAt: string;
}

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaSecondary: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
}

export type UploadedFile = {
  id: string;
  name: string;
  data: string; // base64
  type: 'image' | 'audio';
  createdAt: string;
}

export type PricingCategory = {
  id: string;
  name: string;
  priceRange: string;
  features: string[];
}

const SEED_PROPERTIES: Property[] = [
  {
    id: "p1",
    name: "OASIS CONCRETO",
    location: "El Poblado, Medellín",
    price: 850000000,
    area: 120,
    bedrooms: 2,
    bathrooms: 2,
    description: "Apartamento de diseño brutalista con acabados en concreto expuesto y domótica avanzada. Vistas panorámicas a la ciudad.",
    images: ["/images/demo-apt-1.png"],
    category: "premium",
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "p2",
    name: "NOIR LOFT",
    location: "Chapinero, Medellín",
    price: 620000000,
    area: 85,
    bedrooms: 1,
    bathrooms: 1,
    description: "Loft de concepto abierto con tonos oscuros y luz tenue. Ideal para ejecutivos y creativos. Acabados mate y madera quemada.",
    images: ["/images/demo-apt-2.png"],
    category: "medio",
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "p3",
    name: "ESTUDIO ZERO",
    location: "Laureles, Bogotá",
    price: 450000000,
    area: 60,
    bedrooms: 1,
    bathrooms: 1,
    description: "Espacio minimalista funcional. Menos es más. Diseñado para maximizar la entrada de luz natural conservando privacidad.",
    images: ["/images/demo-apt-3.png"],
    category: "economico",
    available: true,
    createdAt: new Date().toISOString()
  }
];

const SEED_CONTENT: SiteContent = {
  heroTitle: "BROKI INMOBILIARIA",
  heroSubtitle: "Espacios que definen tu estilo de vida.",
  heroCta: "Ver Apartamentos",
  heroCtaSecondary: "Contáctanos",
  contactPhone: "3041363265",
  contactEmail: "broki.inmobiliaria@gmail.com",
  contactWhatsapp: "573041363265"
};

const SEED_PRICING: PricingCategory[] = [
  { id: "economico", name: "ESTÁNDAR", priceRange: "Desde $350M COP", features: ["Diseño Funcional", "Ubicación Estratégica", "1-2 Habitaciones"] },
  { id: "medio", name: "AVANZADO", priceRange: "Desde $600M COP", features: ["Acabados Premium", "Domótica Básica", "Vistas Panorámicas"] },
  { id: "premium", name: "SIGNATURE", priceRange: "Desde $900M COP", features: ["Arquitectura de Autor", "Materiales Importados", "Servicios Exclusivos"] }
];

export const initDB = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('broki_properties')) {
    localStorage.setItem('broki_properties', JSON.stringify(SEED_PROPERTIES));
  }
  if (!localStorage.getItem('broki_content')) {
    localStorage.setItem('broki_content', JSON.stringify(SEED_CONTENT));
  }
  if (!localStorage.getItem('broki_prices')) {
    localStorage.setItem('broki_prices', JSON.stringify(SEED_PRICING));
  }
  if (!localStorage.getItem('broki_images')) {
    localStorage.setItem('broki_images', JSON.stringify([]));
  }
  if (!localStorage.getItem('broki_gallery')) {
    localStorage.setItem('broki_gallery', JSON.stringify(["/images/demo-apt-1.png", "/images/demo-apt-2.png", "/images/demo-apt-3.png"]));
  }
};

export const getDB = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setDB = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
