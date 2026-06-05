import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDB, setDB, addActivityLog,
  Property, SiteContent, UploadedFile, PricingCategory,
  WhatsAppConfig, ActivityLog,
  initDB
} from "../lib/local-db";

initDB();

// --- PROPERTIES ---
export function useProperties() {
  return useQuery({ queryKey: ['properties'], queryFn: () => getDB<Property[]>('broki_properties', []) });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Property, 'id' | 'createdAt'>) => {
      const props = getDB<Property[]>('broki_properties', []);
      const newProp: Property = { ...data, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
      setDB('broki_properties', [newProp, ...props]);
      addActivityLog('Propiedad creada', `"${data.name}" en ${data.location}`);
      return newProp;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Property) => {
      const props = getDB<Property[]>('broki_properties', []);
      setDB('broki_properties', props.map(p => p.id === data.id ? data : p));
      addActivityLog('Propiedad editada', `"${data.name}"`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const props = getDB<Property[]>('broki_properties', []);
      const prop = props.find(p => p.id === id);
      setDB('broki_properties', props.filter(p => p.id !== id));
      addActivityLog('Propiedad eliminada', prop ? `"${prop.name}"` : id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}

// --- CONTENT ---
export function useSiteContent() {
  return useQuery({ queryKey: ['content'], queryFn: () => getDB<SiteContent>('broki_content', {} as SiteContent) });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SiteContent) => {
      setDB('broki_content', data);
      addActivityLog('Contenido del sitio actualizado', 'Textos y datos de contacto');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] })
  });
}

// --- WHATSAPP CONFIG ---
export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ['whatsapp'],
    queryFn: () => getDB<WhatsAppConfig>('broki_whatsapp', { number: '573041363265', message: '', buttonText: 'Escríbenos' })
  });
}

export function useUpdateWhatsAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WhatsAppConfig) => {
      setDB('broki_whatsapp', data);
      addActivityLog('WhatsApp actualizado', `Número: ${data.number}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp'] })
  });
}

// --- HERO BACKGROUND ---
export function useHeroBg() {
  return useQuery({
    queryKey: ['hero_bg'],
    queryFn: () => localStorage.getItem('broki_hero_bg') || null
  });
}

export function useUpdateHeroBg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: string | null) => {
      if (data) {
        localStorage.setItem('broki_hero_bg', data);
        addActivityLog('Fondo del hero actualizado', 'Nueva imagen de fondo');
      } else {
        localStorage.removeItem('broki_hero_bg');
        addActivityLog('Fondo del hero eliminado', 'Usando imagen por defecto');
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero_bg'] })
  });
}

// --- FILES (Images) ---
export function useImages() {
  return useQuery({ queryKey: ['images'], queryFn: () => getDB<UploadedFile[]>('broki_images', []) });
}

export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, data }: { name: string; data: string }) => {
      const files = getDB<UploadedFile[]>('broki_images', []);
      const newFile: UploadedFile = { id: Math.random().toString(36).substring(2, 9), name, data, type: 'image', createdAt: new Date().toISOString() };
      setDB('broki_images', [newFile, ...files]);
      addActivityLog('Imagen subida', name);
      return newFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] })
  });
}

export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const files = getDB<UploadedFile[]>('broki_images', []);
      const file = files.find(f => f.id === id);
      setDB('broki_images', files.filter(f => f.id !== id));
      if (file) addActivityLog('Imagen eliminada', file.name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] })
  });
}

// --- AUDIO ---
export function useAudio() {
  return useQuery({ queryKey: ['audio'], queryFn: () => typeof window !== 'undefined' ? localStorage.getItem('broki_audio') : null });
}

export function useUploadAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (base64: string) => {
      localStorage.setItem('broki_audio', base64);
      addActivityLog('Audio del reproductor actualizado', '');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audio'] })
  });
}

// --- GALLERY ---
export function useGallery() {
  return useQuery({ queryKey: ['gallery'], queryFn: () => getDB<string[]>('broki_gallery', []) });
}

export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (urls: string[]) => { setDB('broki_gallery', urls); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] })
  });
}

// --- PRICING ---
export function usePricing() {
  return useQuery({ queryKey: ['pricing'], queryFn: () => getDB<PricingCategory[]>('broki_prices', []) });
}

export function useUpdatePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categories: PricingCategory[]) => {
      setDB('broki_prices', categories);
      addActivityLog('Precios actualizados', '');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing'] })
  });
}

// --- ACTIVITY LOG ---
export function useActivityLog() {
  return useQuery({ queryKey: ['activity'], queryFn: () => getDB<ActivityLog[]>('broki_activity', []) });
}
