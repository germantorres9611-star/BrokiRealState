import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Property, SiteContent, PricingCategory,
  WhatsAppConfig, ActivityLog, AudioTrack, UploadedFile,
  AudiovisualSubService, BrokerageSubService,
  initDB
} from "../lib/local-db";
import {
  isApiMode,
  getData, setData,
  logActivity, getActivityLog,
  getProperties, createProperty, updateProperty, deleteProperty,
  getImages, uploadImage, deleteImage,
  getTracks, getActiveTrackId, uploadTrack, deleteTrack, setActiveTrackId,
} from "../lib/storage-adapter";

// Seed localStorage in dev mode on first load
initDB();

// ─── PROPERTIES ───────────────────────────────────────
export function useProperties() {
  return useQuery({ queryKey: ['properties'], queryFn: () => getProperties() });
}
export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Property, 'id' | 'createdAt'>) => {
      const p = await createProperty(data);
      logActivity('Propiedad creada', `"${data.name}" en ${data.location}`);
      return p;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}
export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Property) => {
      const p = await updateProperty(data);
      logActivity('Propiedad editada', `"${data.name}"`);
      return p;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}
export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const props = await getProperties();
      const prop  = props.find(p => p.id === id);
      await deleteProperty(id);
      logActivity('Propiedad eliminada', prop ? `"${prop.name}"` : id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] })
  });
}

// ─── SITE CONTENT ─────────────────────────────────────
export function useSiteContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: () => getData<SiteContent>('site_content', {} as SiteContent)
  });
}
export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SiteContent) => {
      await setData('site_content', data);
      logActivity('Contenido del sitio actualizado', 'Textos y datos de contacto');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] })
  });
}

// ─── WHATSAPP ─────────────────────────────────────────
export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ['whatsapp'],
    queryFn: () => getData<WhatsAppConfig>('whatsapp', { number: '573507081756', message: '', buttonText: 'Escríbenos' })
  });
}
export function useUpdateWhatsAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WhatsAppConfig) => {
      await setData('whatsapp', data);
      logActivity('WhatsApp actualizado', `Número: ${data.number}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp'] })
  });
}

// ─── HERO BACKGROUND ──────────────────────────────────
export function useHeroBg() {
  return useQuery({
    queryKey: ['hero_bg'],
    queryFn: () => getData<string | null>('hero_bg', null)
  });
}
export function useUpdateHeroBg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: string | null) => {
      if (data) {
        await setData('hero_bg', data); // adapter handles base64→upload in API mode
        logActivity('Fondo del hero actualizado', 'Nueva imagen de fondo');
      } else {
        await setData('hero_bg', null);
        logActivity('Fondo del hero eliminado', 'Usando animación de agua');
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero_bg'] })
  });
}

// ─── FILE UPLOADS (Images) ────────────────────────────
export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: () => getImages()
  });
}
export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, data, file }: { name: string; data: string; file?: File }) => {
      let result: UploadedFile;
      if (isApiMode()) {
        let f = file;
        if (!f && data) {
          const res  = await fetch(data);
          const blob = await res.blob();
          f = new File([blob], name, { type: blob.type });
        }
        result = await uploadImage(f!, name);
      } else {
        // localStorage: store base64 directly (no File conversion needed)
        const existing: UploadedFile[] = JSON.parse(localStorage.getItem('broki_images') ?? '[]');
        const entry: UploadedFile = { id: Math.random().toString(36).substring(2, 9), name, data, type: 'image', createdAt: new Date().toISOString() };
        localStorage.setItem('broki_images', JSON.stringify([entry, ...existing]));
        result = entry;
      }
      logActivity('Imagen subida', name);
      return result;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] })
  });
}
export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiMode()) {
        const imgs = await getImages();
        const img = imgs.find(f => f.id === id);
        await deleteImage(id);
        if (img) logActivity('Imagen eliminada', img.name);
      } else {
        const files: UploadedFile[] = JSON.parse(localStorage.getItem('broki_images') ?? '[]');
        const f = files.find(f => f.id === id);
        localStorage.setItem('broki_images', JSON.stringify(files.filter(f => f.id !== id)));
        if (f) logActivity('Imagen eliminada', f.name);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] })
  });
}

// ─── AUDIO TRACKS ─────────────────────────────────────
export function useTracks() {
  return useQuery({ queryKey: ['tracks'], queryFn: () => getTracks() });
}
export function useActiveTrackId() {
  return useQuery({ queryKey: ['active_track'], queryFn: () => getActiveTrackId() });
}
export function useActiveTrack() {
  const { data: tracks = [] } = useTracks();
  const { data: activeId }    = useActiveTrackId();
  return (tracks as AudioTrack[]).find(t => t.id === activeId) ?? (tracks as AudioTrack[])[0] ?? null;
}
export function useUploadTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, format, data, file }: { name: string; format: string; data: string; file?: File }) => {
      let track: AudioTrack;
      if (isApiMode()) {
        let f = file;
        if (!f && data) {
          const res  = await fetch(data);
          const blob = await res.blob();
          f = new File([blob], `${name}.${format}`, { type: blob.type });
        }
        track = await uploadTrack(f!, name, format);
      } else {
        const tracks: AudioTrack[] = JSON.parse(localStorage.getItem('broki_tracks') ?? '[]');
        track = { id: Math.random().toString(36).substring(2, 9), name, format, data, createdAt: new Date().toISOString() };
        const updated = [track, ...tracks];
        localStorage.setItem('broki_tracks', JSON.stringify(updated));
        if (tracks.length === 0) localStorage.setItem('broki_active_track', track.id);
      }
      logActivity('Canción subida', name);
      return track;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tracks'] }); qc.invalidateQueries({ queryKey: ['active_track'] }); }
  });
}
export function useDeleteTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const tracks: AudioTrack[] = await getTracks();
      const track = tracks.find(t => t.id === id);
      await deleteTrack(id);
      if (track) logActivity('Canción eliminada', track.name);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tracks'] }); qc.invalidateQueries({ queryKey: ['active_track'] }); }
  });
}
export function useSetActiveTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await setActiveTrackId(id);
      const tracks: AudioTrack[] = await getTracks();
      const track = tracks.find(t => t.id === id);
      if (track) logActivity('Canción activa cambiada', track.name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['active_track'] })
  });
}
export function useAudio() {
  const track = useActiveTrack();
  return { data: track?.data ?? null };
}
export function useUploadAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (base64: string) => {
      localStorage.setItem('broki_audio', base64);
      logActivity('Audio del reproductor actualizado', '');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audio'] })
  });
}

// ─── GALLERY ──────────────────────────────────────────
export function useGallery() {
  return useQuery({ queryKey: ['gallery'], queryFn: () => getData<string[]>('gallery', []) });
}
export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (urls: string[]) => { await setData('gallery', urls); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] })
  });
}

// ─── PRICING ──────────────────────────────────────────
export function usePricing() {
  return useQuery({ queryKey: ['pricing'], queryFn: () => getData<PricingCategory[]>('pricing', []) });
}
export function useUpdatePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categories: PricingCategory[]) => {
      await setData('pricing', categories);
      logActivity('Precios actualizados', '');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing'] })
  });
}

// ─── AUDIOVISUAL SUB-SERVICE ───────────────────────────
export function useAudiovisualService() {
  return useQuery({
    queryKey: ['audiovisual_svc'],
    queryFn: () => getData<AudiovisualSubService>('audiovisual_svc', {} as AudiovisualSubService)
  });
}
export function useUpdateAudiovisualService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AudiovisualSubService) => {
      await setData('audiovisual_svc', data);
      logActivity('Servicio audiovisual actualizado', data.title);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audiovisual_svc'] })
  });
}

// ─── BROKERAGE SUB-SERVICE ────────────────────────────
export function useBrokerageService() {
  return useQuery({
    queryKey: ['brokerage_svc'],
    queryFn: () => getData<BrokerageSubService>('brokerage_svc', {} as BrokerageSubService)
  });
}
export function useUpdateBrokerageService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: BrokerageSubService) => {
      await setData('brokerage_svc', data);
      logActivity('Servicio de corretaje actualizado', data.title);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brokerage_svc'] })
  });
}

// Legacy aliases
export function usePropertyMgmtService() { return useAudiovisualService(); }
export function useUpdatePropertyMgmtService() { return useUpdateAudiovisualService(); }

// ─── ACTIVITY LOG ─────────────────────────────────────
export function useActivityLog() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () => getActivityLog()
  });
}
