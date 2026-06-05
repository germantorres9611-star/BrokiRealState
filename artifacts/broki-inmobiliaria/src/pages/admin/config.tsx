import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from './layout';
import {
  useWhatsAppConfig, useUpdateWhatsAppConfig,
  useHeroBg, useUpdateHeroBg,
  useActivityLog,
  useAudiovisualService, useUpdateAudiovisualService,
  useBrokerageService, useUpdateBrokerageService,
} from '../../hooks/use-broki';
import { Button, Input, Label, Textarea } from '../../components/ui-custom';
import { fileToBase64 } from '../../lib/utils';
import { hashPassword, getAdminCreds, saveAdminCreds, passwordStrength, sanitize } from '../../lib/security';
import { addActivityLog, AudiovisualSubService, BrokerageSubService } from '../../lib/local-db';
import { MessageCircle, ImageIcon, Shield, Activity, CheckCircle, XCircle, Trash2, Upload, Building2, Plus, X, Video, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── WhatsApp ────────────────────────────────────────
function WhatsAppSection() {
  const { data: config } = useWhatsAppConfig();
  const updateMut = useUpdateWhatsAppConfig();
  const [form, setForm] = useState({ number: '', message: '', buttonText: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm({ number: config.number, message: config.message, buttonText: config.buttonText });
  }, [config]);

  const handleSave = async () => {
    await updateMut.mutateAsync({
      number: sanitize(form.number),
      message: sanitize(form.message),
      buttonText: sanitize(form.buttonText),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número de WhatsApp</Label>
          <Input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="573041363265" />
          <p className="text-xs text-muted-foreground mt-1">Incluye código de país sin +. Ej: 573507081756</p>
        </div>
        <div>
          <Label>Texto del botón</Label>
          <Input value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} placeholder="Escríbenos" />
        </div>
      </div>
      <div>
        <Label>Mensaje predeterminado</Label>
        <Textarea value={form.message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Hola, estoy interesado..." rows={3} />
        <p className="text-xs text-muted-foreground mt-1">Se envía automáticamente al abrir WhatsApp.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={updateMut.isPending}>{updateMut.isPending ? 'Guardando...' : 'Guardar WhatsApp'}</Button>
        {saved && <span className="text-primary text-sm flex items-center gap-1"><CheckCircle size={14} /> Guardado</span>}
      </div>
      <div className="p-3 bg-secondary border border-border text-sm text-muted-foreground rounded">
        Vista previa: <span className="font-mono text-foreground">https://wa.me/{form.number}</span>
      </div>
    </div>
  );
}

// ─── Hero Background ──────────────────────────────────
function HeroBgSection() {
  const { data: heroBg } = useHeroBg();
  const updateMut = useUpdateHeroBg();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      await updateMut.mutateAsync(base64);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleRemove = async () => { setPreview(null); await updateMut.mutateAsync(null); };
  const current = preview || heroBg;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Sin imagen personalizada se mostrará la <strong>animación de agua</strong> como fondo del hero.</p>
      <div className="relative aspect-[16/5] bg-secondary border border-border overflow-hidden rounded">
        {current ? (
          <img src={current} alt="Hero background" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon size={32} />
            <span className="text-sm">Usando animación de agua (por defecto)</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm hover:bg-primary/90 transition-colors rounded">
            <Upload size={16} /> {uploading ? 'Subiendo...' : current ? 'Reemplazar imagen' : 'Subir imagen'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {current && (
          <Button variant="danger" onClick={handleRemove} className="flex items-center gap-2">
            <Trash2 size={16} /> Eliminar (volver al agua)
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Máximo 5MB</p>
    </div>
  );
}

// ─── Password ─────────────────────────────────────────
function PasswordSection() {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const creds = getAdminCreds();
  const strength = passwordStrength(form.newPwd);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.current || !form.newPwd || !form.confirm) { setError('Completa todos los campos'); return; }
    if (form.newPwd !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.newPwd.length < 4) { setError('Mínimo 4 caracteres'); return; }
    const currentHash = await hashPassword(form.current);
    if (!creds || creds.passwordHash !== currentHash) { setError('Contraseña actual incorrecta'); return; }
    const newHash = await hashPassword(form.newPwd);
    saveAdminCreds({ ...creds, passwordHash: newHash, lastChanged: new Date().toISOString() });
    addActivityLog('Contraseña cambiada', 'Nueva contraseña guardada (SHA-256)');
    setSuccess('Contraseña actualizada correctamente');
    setForm({ current: '', newPwd: '', confirm: '' });
  };

  return (
    <form onSubmit={handleChange} className="space-y-4 max-w-md">
      {error && <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded">{error}</div>}
      {success && <div className="p-3 bg-primary/10 border border-primary text-primary text-sm flex items-center gap-2 rounded"><CheckCircle size={14} />{success}</div>}
      <div><Label>Contraseña actual</Label><Input type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} /></div>
      <div>
        <Label>Nueva contraseña</Label>
        <Input type="password" value={form.newPwd} onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))} />
        {form.newPwd && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">{[1,2,3,4,5].map(i => (<div key={i} className={cn("h-1 flex-1 rounded transition-colors", i <= strength.score ? strength.color : 'bg-border')} />))}</div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>
      <div>
        <Label>Confirmar nueva contraseña</Label>
        <Input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
        {form.confirm && form.newPwd !== form.confirm && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1"><XCircle size={12} /> No coinciden</p>
        )}
      </div>
      {creds?.lastChanged && <p className="text-xs text-muted-foreground">Último cambio: {new Date(creds.lastChanged).toLocaleString('es-CO')}</p>}
      <p className="text-xs text-muted-foreground bg-secondary p-2 border border-border rounded">🔒 Las contraseñas se almacenan con hash SHA-256.</p>
      <Button type="submit">Cambiar Contraseña</Button>
    </form>
  );
}

// ─── Activity ─────────────────────────────────────────
function ActivitySection() {
  const { data: logs = [] } = useActivityLog();
  const icons: Record<string, string> = {
    'Inicio de sesión': '🔑', 'Propiedad creada': '🏠', 'Propiedad editada': '✏️',
    'Propiedad eliminada': '🗑️', 'Contraseña cambiada': '🔒', 'WhatsApp actualizado': '💬',
    'Imagen subida': '🖼️', 'Imagen eliminada': '🗑️', 'Contenido del sitio actualizado': '📝',
    'Fondo del hero actualizado': '🌊', 'Fondo del hero eliminado': '🌊',
    'Audio del reproductor actualizado': '🎵', 'Precios actualizados': '💰',
    'Servicio audiovisual actualizado': '🎥', 'Servicio de corretaje actualizado': '🏢',
  };
  if (logs.length === 0) return (
    <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded">
      <Activity size={32} className="mx-auto mb-2 opacity-40" /><p>No hay actividad registrada aún.</p>
    </div>
  );
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {logs.map(log => (
        <div key={log.id} className="flex gap-4 p-3 bg-card border border-border rounded hover:border-primary/50 transition-colors">
          <span className="text-lg shrink-0">{icons[log.action] || '📋'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{log.action}</p>
            {log.details && <p className="text-muted-foreground text-xs truncate">{log.details}</p>}
          </div>
          <time className="text-xs text-muted-foreground shrink-0 text-right">
            {new Date(log.timestamp).toLocaleDateString('es-CO')}<br />
            {new Date(log.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      ))}
    </div>
  );
}

// ─── List editor helper ────────────────────────────────
function ListEditor({
  label, items, onChange
}: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [newItem, setNewItem] = useState('');
  const add = () => { if (!newItem.trim()) return; onChange([...items, newItem.trim()]); setNewItem(''); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-secondary border border-border rounded">
            <span className="flex-1 text-sm">{item}</span>
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Agregar ítem..." className="flex-1" />
        <Button type="button" variant="outline" onClick={add} className="px-3"><Plus size={16} /></Button>
      </div>
    </div>
  );
}

// ─── Audiovisual Sub-service ──────────────────────────
function AudiovisualServiceSection() {
  const { data: svc } = useAudiovisualService();
  const updateMut = useUpdateAudiovisualService();
  const [form, setForm] = useState<AudiovisualSubService | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (svc && !form) setForm(svc); }, [svc]);
  if (!form) return null;

  const set = (patch: Partial<AudiovisualSubService>) => setForm(f => f ? { ...f, ...patch } : f);

  const handleSave = async () => {
    await updateMut.mutateAsync(form);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 p-6 border border-border rounded-xl bg-card/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Video size={18} className="text-primary" /></div>
        <h3 className="font-black text-lg">Servicio 01 — Producción Audiovisual</h3>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.visible} onChange={e => set({ visible: e.target.checked })} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-semibold">Visible en el sitio</span>
      </label>

      <div><Label>Título</Label><Input value={form.title} onChange={e => set({ title: e.target.value })} /></div>
      <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ description: e.target.value })} rows={3} /></div>

      <ListEditor label="Qué incluye" items={form.includes} onChange={includes => set({ includes })} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Precio del servicio</Label><Input value={form.price} onChange={e => set({ price: e.target.value })} /></div>
        <div><Label>Comisión por venta</Label><Input value={form.commission} onChange={e => set({ commission: e.target.value })} /></div>
      </div>

      <div><Label>Beneficio especial</Label><Textarea value={form.benefit} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ benefit: e.target.value })} rows={2} /></div>
      <div><Label>Nota de propiedad del contenido</Label><Textarea value={form.ownershipNote} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ ownershipNote: e.target.value })} rows={2} /></div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.noExclusivity} onChange={e => set({ noExclusivity: e.target.checked })} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-semibold">Mostrar nota de "Sin exclusividad"</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={updateMut.isPending}>{updateMut.isPending ? 'Guardando...' : 'Guardar Servicio Audiovisual'}</Button>
        {saved && <span className="text-primary text-sm flex items-center gap-1"><CheckCircle size={14} /> Guardado</span>}
      </div>
    </div>
  );
}

// ─── Brokerage Sub-service ────────────────────────────
function BrokerageServiceSection() {
  const { data: svc } = useBrokerageService();
  const updateMut = useUpdateBrokerageService();
  const [form, setForm] = useState<BrokerageSubService | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (svc && !form) setForm(svc); }, [svc]);
  if (!form) return null;

  const set = (patch: Partial<BrokerageSubService>) => setForm(f => f ? { ...f, ...patch } : f);

  const handleSave = async () => {
    await updateMut.mutateAsync(form);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 p-6 border border-border rounded-xl bg-card/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Briefcase size={18} className="text-primary" /></div>
        <h3 className="font-black text-lg">Servicio 02 — Corretaje y Arrendamientos</h3>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.visible} onChange={e => set({ visible: e.target.checked })} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-semibold">Visible en el sitio</span>
      </label>

      <div><Label>Título</Label><Input value={form.title} onChange={e => set({ title: e.target.value })} /></div>
      <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ description: e.target.value })} rows={3} /></div>

      <ListEditor label="El primer canon cubre:" items={form.firstMonthCovers ?? []} onChange={firstMonthCovers => set({ firstMonthCovers })} />

      <div><Label>Nota del segundo mes en adelante</Label><Textarea value={form.fromSecondMonthNote} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ fromSecondMonthNote: e.target.value })} rows={2} /></div>

      <ListEditor label="Beneficios" items={form.benefits ?? []} onChange={benefits => set({ benefits })} />

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={updateMut.isPending}>{updateMut.isPending ? 'Guardando...' : 'Guardar Servicio de Corretaje'}</Button>
        {saved && <span className="text-primary text-sm flex items-center gap-1"><CheckCircle size={14} /> Guardado</span>}
      </div>
    </div>
  );
}

// ─── Main Config Page ─────────────────────────────────
const sections = [
  { id: 'whatsapp', label: 'WhatsApp',  icon: MessageCircle },
  { id: 'hero',     label: 'Fondo Hero', icon: ImageIcon },
  { id: 'services', label: 'Servicios',  icon: Building2 },
  { id: 'security', label: 'Seguridad',  icon: Shield },
  { id: 'activity', label: 'Actividad',  icon: Activity },
];

export default function AdminConfig() {
  const [active, setActive] = useState('whatsapp');

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black mb-2">Configuración</h1>
          <p className="text-muted-foreground">WhatsApp, fondo hero, servicios, seguridad y actividad</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="flex flex-row md:flex-col gap-1 md:w-48 shrink-0">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-left rounded font-bold text-xs uppercase tracking-wider transition-colors",
                active === s.id
                  ? "bg-primary/15 border border-primary/40 text-primary"
                  : "border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {active === 'whatsapp' && (
            <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><MessageCircle size={20} /> WhatsApp</h2>
              <WhatsAppSection />
            </section>
          )}
          {active === 'hero' && (
            <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><ImageIcon size={20} /> Fondo Principal (Hero)</h2>
              <HeroBgSection />
            </section>
          )}
          {active === 'services' && (
            <section>
              <h2 className="text-xl font-black mb-2 flex items-center gap-2"><Building2 size={20} /> Administración de Inmuebles</h2>
              <p className="text-muted-foreground text-sm mb-8">Edita los dos sub-servicios de forma independiente. Los cambios se reflejan en tiempo real en el sitio.</p>
              <div className="space-y-8">
                <AudiovisualServiceSection />
                <BrokerageServiceSection />
              </div>
            </section>
          )}
          {active === 'security' && (
            <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Shield size={20} /> Seguridad Administrativa</h2>
              <PasswordSection />
            </section>
          )}
          {active === 'activity' && (
            <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Activity size={20} /> Registro de Actividad</h2>
              <ActivitySection />
            </section>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
