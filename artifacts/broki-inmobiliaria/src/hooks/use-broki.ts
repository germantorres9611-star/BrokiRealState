import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDB, setDB, Property, SiteContent, UploadedFile, PricingCategory, initDB } from "../lib/local-db";

// Initialize local DB on first load
initDB();

// --- PROPERTIES ---
export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      return getDB<Property[]>('broki_properties', []);
    }
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Property, 'id' | 'createdAt'>) => {
      const props = getDB<Property[]>('broki_properties', []);
      const newProp: Property = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      setDB('broki_properties', [newProp, ...props]);
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
      const updated = props.map(p => p.id === data.id ? data : p);
      setDB('broki_properties', updated);
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
      setDB('broki_properties', props.filter(p => p.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}

// --- CONTENT ---
export function useSiteContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: async () => getDB<SiteContent>('broki_content', {} as SiteContent)
  });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SiteContent) => {
      setDB('broki_content', data);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] })
  });
}

// --- FILES (Images) ---
export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: async () => getDB<UploadedFile[]>('broki_images', [])
  });
}

export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, data }: { name: string, data: string }) => {
      const files = getDB<UploadedFile[]>('broki_images', []);
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        data,
        type: 'image',
        createdAt: new Date().toISOString()
      };
      setDB('broki_images', [newFile, ...files]);
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
      setDB('broki_images', files.filter(f => f.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] })
  });
}

// --- AUDIO ---
export function useAudio() {
  return useQuery({
    queryKey: ['audio'],
    queryFn: async () => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('broki_audio');
    }
  });
}

export function useUploadAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (base64: string) => {
      localStorage.setItem('broki_audio', base64);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audio'] })
  });
}

// --- GALLERY ---
export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => getDB<string[]>('broki_gallery', [])
  });
}

export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (urls: string[]) => {
      setDB('broki_gallery', urls);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] })
  });
}

// --- PRICING ---
export function usePricing() {
  return useQuery({
    queryKey: ['pricing'],
    queryFn: async () => getDB<PricingCategory[]>('broki_prices', [])
  });
}

export function useUpdatePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categories: PricingCategory[]) => {
      setDB('broki_prices', categories);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing'] })
  });
}
