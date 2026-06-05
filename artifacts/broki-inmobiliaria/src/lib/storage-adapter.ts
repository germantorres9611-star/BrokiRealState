// ═══════════════════════════════════════════════════════
//  Storage Adapter — switches between localStorage (dev)
//  and PHP+MySQL API (Hostinger production)
//
//  Dev  (Replit) : VITE_STORAGE_MODE=localStorage  (default)
//  Prod (Hostinger): VITE_STORAGE_MODE=api
// ═══════════════════════════════════════════════════════

const MODE = import.meta.env.VITE_STORAGE_MODE ?? 'localStorage';
const BASE = ((import.meta.env.VITE_API_BASE as string) ?? '/api').replace(/\/$/, '');

export const isApiMode = (): boolean => MODE === 'api';

// ── localStorage key mapping (backward-compat with existing data) ────────────
// Maps API/adapter key → actual localStorage key used by old local-db.ts
const LS_KEY_MAP: Record<string, string> = {
  site_content:    'broki_content',
  pricing:         'broki_prices',
  gallery:         'broki_gallery',
  whatsapp:        'broki_whatsapp',
  audiovisual_svc: 'broki_audiovisual_svc',
  brokerage_svc:   'broki_brokerage_svc',
};
// These are stored as raw strings (not JSON) in localStorage
const LS_RAW_KEYS = new Set(['hero_bg', 'active_track']);

function lsKey(key: string): string {
  return LS_KEY_MAP[key] ?? `broki_${key}`;
}

// ── Low-level fetch helper ────────────────────────────────────
async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const isFormData = init.body instanceof FormData;
  const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  const r = await fetch(`${BASE}/${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  return r.json();
}

// Convert a base64 data URL to a File object for upload
async function base64ToFile(dataUrl: string, filename: string): Promise<File> {
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

// ── Generic settings store ────────────────────────────────────

export async function getData<T>(key: string, fallback: T): Promise<T> {
  if (isApiMode()) {
    try {
      const j = await apiFetch(`settings.php?key=${encodeURIComponent(key)}`);
      return j.ok && j.data !== undefined && j.data !== null ? (j.data as T) : fallback;
    } catch { return fallback; }
  }
  try {
    if (LS_RAW_KEYS.has(key)) {
      // Stored as raw string (not JSON-wrapped)
      const v = localStorage.getItem(`broki_${key}`);
      return (v ?? null) as unknown as T;
    }
    const v = localStorage.getItem(lsKey(key));
    return v != null ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

export async function setData<T>(key: string, value: T): Promise<void> {
  if (isApiMode()) {
    // Transparently handle base64 data URLs → upload as file
    if (typeof value === 'string' && (value as string).startsWith('data:')) {
      const dataUrl = value as string;
      const isAudio = dataUrl.startsWith('data:audio');
      const ext     = dataUrl.match(/data:[^/]+\/([^;]+)/)?.[1] ?? 'bin';
      const type    = key === 'hero_bg' ? 'hero_bg' : (isAudio ? 'audio' : 'image');
      const file    = await base64ToFile(dataUrl, `${key}.${ext}`);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      const up = await apiFetch('upload.php', { method: 'POST', body: fd });
      if (up.ok) {
        await apiFetch('settings.php', { method: 'POST', body: JSON.stringify({ key, value: up.data.url }) });
      }
      return;
    }
    await apiFetch('settings.php', { method: 'POST', body: JSON.stringify({ key, value }) });
    return;
  }
  // localStorage mode
  if (LS_RAW_KEYS.has(key)) {
    if (value == null) localStorage.removeItem(`broki_${key}`);
    else localStorage.setItem(`broki_${key}`, value as string);
    return;
  }
  localStorage.setItem(lsKey(key), JSON.stringify(value));
}

// ── Activity log ──────────────────────────────────────────────

export function logActivity(action: string, details: string): void {
  // Always write to localStorage (works in both modes, keeps admin UI working)
  try {
    const logs: { id: string; action: string; details: string; timestamp: string }[] =
      JSON.parse(localStorage.getItem('broki_activity') ?? '[]');
    const entry = { id: Math.random().toString(36).substring(2, 9), action, details, timestamp: new Date().toISOString() };
    localStorage.setItem('broki_activity', JSON.stringify([entry, ...logs].slice(0, 100)));
  } catch { /* ignore */ }

  // Also write to API (fire and forget)
  if (isApiMode()) {
    apiFetch('activity.php', { method: 'POST', body: JSON.stringify({ action, details }) }).catch(() => {});
  }
}

export async function getActivityLog(): Promise<{ id: string; action: string; details: string; timestamp: string }[]> {
  if (isApiMode()) {
    try {
      const j = await apiFetch('activity.php');
      return j.ok ? j.data : [];
    } catch { return []; }
  }
  try {
    return JSON.parse(localStorage.getItem('broki_activity') ?? '[]');
  } catch { return []; }
}

// ── Properties ────────────────────────────────────────────────

export interface Property {
  id: string; name: string; location: string; price: number;
  area: number; bedrooms: number; bathrooms: number;
  description: string; images: string[];
  category: 'economico' | 'medio' | 'premium';
  available: boolean; createdAt: string;
}

export async function getProperties(): Promise<Property[]> {
  if (isApiMode()) {
    try {
      const j = await apiFetch('properties.php');
      return j.ok ? (j.data as Property[]) : [];
    } catch { return []; }
  }
  try { return JSON.parse(localStorage.getItem('broki_properties') ?? '[]'); }
  catch { return []; }
}

export async function createProperty(data: Omit<Property, 'id' | 'createdAt'>): Promise<Property> {
  if (isApiMode()) {
    const j = await apiFetch('properties.php', { method: 'POST', body: JSON.stringify({ action: 'create', data }) });
    if (!j.ok) throw new Error(j.error);
    return j.data as Property;
  }
  const props = await getProperties();
  const p: Property = { ...data, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
  localStorage.setItem('broki_properties', JSON.stringify([p, ...props]));
  return p;
}

export async function updateProperty(data: Property): Promise<Property> {
  if (isApiMode()) {
    const j = await apiFetch('properties.php', { method: 'POST', body: JSON.stringify({ action: 'update', data }) });
    if (!j.ok) throw new Error(j.error);
    return data;
  }
  const props = await getProperties();
  localStorage.setItem('broki_properties', JSON.stringify(props.map(p => p.id === data.id ? data : p)));
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  if (isApiMode()) {
    const j = await apiFetch('properties.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    if (!j.ok) throw new Error(j.error);
    return;
  }
  const props = await getProperties();
  localStorage.setItem('broki_properties', JSON.stringify(props.filter(p => p.id !== id)));
}

// ── File Uploads (images) ─────────────────────────────────────

export interface UploadedFile {
  id: string; name: string; data: string; type: 'image' | 'audio'; createdAt: string;
}

export async function getImages(): Promise<UploadedFile[]> {
  if (isApiMode()) {
    try {
      const j = await apiFetch('upload.php?type=image');
      return j.ok ? j.data : [];
    } catch { return []; }
  }
  try { return JSON.parse(localStorage.getItem('broki_images') ?? '[]'); }
  catch { return []; }
}

export async function uploadImage(file: File, name: string): Promise<UploadedFile> {
  if (isApiMode()) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'image');
    const j = await apiFetch('upload.php', { method: 'POST', body: fd });
    if (!j.ok) throw new Error(j.error);
    return { id: j.data.id, name: j.data.name, data: j.data.url, type: 'image', createdAt: j.data.createdAt };
  }
  // localStorage: store as base64
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const files = await getImages();
  const newFile: UploadedFile = { id: Math.random().toString(36).substring(2, 9), name, data, type: 'image', createdAt: new Date().toISOString() };
  localStorage.setItem('broki_images', JSON.stringify([newFile, ...files]));
  return newFile;
}

export async function deleteImage(id: string): Promise<void> {
  if (isApiMode()) {
    await apiFetch('upload.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    return;
  }
  const files = await getImages();
  localStorage.setItem('broki_images', JSON.stringify(files.filter(f => f.id !== id)));
}

// ── Audio Tracks ──────────────────────────────────────────────

export interface AudioTrack {
  id: string; name: string; format: string; data: string; createdAt: string;
}

export async function getTracks(): Promise<AudioTrack[]> {
  if (isApiMode()) {
    try {
      const j = await apiFetch('tracks.php');
      return j.ok ? j.data : [];
    } catch { return []; }
  }
  try { return JSON.parse(localStorage.getItem('broki_tracks') ?? '[]'); }
  catch { return []; }
}

export async function getActiveTrackId(): Promise<string | null> {
  if (isApiMode()) {
    try {
      const j = await apiFetch('tracks.php?action=active_id');
      return j.ok ? j.data : null;
    } catch { return null; }
  }
  return localStorage.getItem('broki_active_track');
}

export async function uploadTrack(file: File, name: string, format: string): Promise<AudioTrack> {
  if (isApiMode()) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name);
    fd.append('format', format);
    const j = await apiFetch('tracks.php', { method: 'POST', body: fd });
    if (!j.ok) throw new Error(j.error);
    return j.data as AudioTrack;
  }
  // localStorage: base64
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const tracks = await getTracks();
  const track: AudioTrack = { id: Math.random().toString(36).substring(2, 9), name, format, data, createdAt: new Date().toISOString() };
  const updated = [track, ...tracks];
  localStorage.setItem('broki_tracks', JSON.stringify(updated));
  if (tracks.length === 0) localStorage.setItem('broki_active_track', track.id);
  return track;
}

export async function deleteTrack(id: string): Promise<void> {
  if (isApiMode()) {
    await apiFetch('tracks.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    return;
  }
  const tracks = await getTracks();
  const remaining = tracks.filter(t => t.id !== id);
  localStorage.setItem('broki_tracks', JSON.stringify(remaining));
  const active = localStorage.getItem('broki_active_track');
  if (active === id) {
    if (remaining.length > 0) localStorage.setItem('broki_active_track', remaining[0].id);
    else localStorage.removeItem('broki_active_track');
  }
}

export async function setActiveTrackId(id: string): Promise<void> {
  if (isApiMode()) {
    await apiFetch('tracks.php', { method: 'POST', body: JSON.stringify({ action: 'set_active', id }) });
    return;
  }
  localStorage.setItem('broki_active_track', id);
}

// ── Auth (API mode only) ──────────────────────────────────────

export async function apiLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!isApiMode()) return { ok: false, error: 'not-api-mode' };
  try {
    const j = await apiFetch('auth.php', { method: 'POST', body: JSON.stringify({ action: 'login', username, password }) });
    if (j.ok) localStorage.setItem('broki_auth', 'true');
    return j;
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function apiLogout(): Promise<void> {
  if (isApiMode()) {
    apiFetch('auth.php', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }).catch(() => {});
  }
  localStorage.removeItem('broki_auth');
}

export async function apiChangePassword(current: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (!isApiMode()) return { ok: false, error: 'not-api-mode' };
  return apiFetch('auth.php', { method: 'POST', body: JSON.stringify({ action: 'change_password', current, new_password: newPassword }) });
}
