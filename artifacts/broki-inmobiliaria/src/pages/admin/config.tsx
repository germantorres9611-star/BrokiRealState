import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from './layout';
import {
  useWhatsAppConfig, useUpdateWhatsAppConfig,
  useHeroBg, useUpdateHeroBg,
  useActivityLog
} from '../../hooks/use-broki';
import { Button, Input, Label, Textarea } from '../../components/ui-custom';
import { fileToBase64 } from '../../lib/utils';
import { hashPassword, getAdminCreds, saveAdminCreds, passwordStrength, sanitize } from '../../lib/security';
import { addActivityLog } from '../../lib/local-db';
import { MessageCircle, ImageIcon, Shield, Activity, CheckCircle, XCircle, Trash2, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- WhatsApp Section ---
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
          <Input
            value={form.number}
            onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
            placeholder="573041363265"
          />
          <p className="text-xs text-muted-foreground mt-1">Incluye código de país sin +. Ej: 573041363265</p>
        </div>
        <div>
          <Label>Texto del botón</Label>
          <Input
            value={form.buttonText}
            onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
            placeholder="Escríbenos"
          />
        </div>
      </div>
      <div>
        <Label>Mensaje predeterminado</Label>
        <Textarea
          value={form.message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Hola, estoy interesado en conocer más sobre sus apartamentos..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">Se envía automáticamente al abrir WhatsApp.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={updateMut.isPending}>
          {updateMut.isPending ? 'Guardando...' : 'Guardar WhatsApp'}
        </Button>
        {saved && <span className="text-primary text-sm flex items-center gap-1"><CheckCircle size={14} /> Guardado</span>}
      </div>
      <div className="p-3 bg-secondary border border-border text-sm text-muted-foreground">
        Vista previa del link: <span className="font-mono text-foreground">https://wa.me/{form.number}?text={encodeURIComponent(form.message).slice(0, 40)}...</span>
      </div>
    </div>
  );
}

// --- Hero Background Section ---
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
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    await updateMut.mutateAsync(null);
  };

  const current = preview || heroBg;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/5] bg-secondary border border-border overflow-hidden">
        {current ? (
          <img src={current} alt="Hero background" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon size={32} />
            <span className="text-sm">Sin imagen personalizada (usando imagen por defecto)</span>
          </div>
        )}
        {current && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-bold uppercase tracking-wider">Imagen actual</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm hover:bg-primary/90 transition-colors">
            <Upload size={16} /> {uploading ? 'Subiendo...' : current ? 'Reemplazar imagen' : 'Subir imagen'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {current && (
          <Button variant="danger" onClick={handleRemove} className="flex items-center gap-2">
            <Trash2 size={16} /> Eliminar
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Máximo 5MB · Se actualiza automáticamente en el Home.</p>
    </div>
  );
}

// --- Password Change Section ---
function PasswordSection() {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const creds = getAdminCreds();
  const strength = passwordStrength(form.newPwd);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.current || !form.newPwd || !form.confirm) { setError('Completa todos los campos'); return; }
    if (form.newPwd !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.newPwd.length < 4) { setError('Mínimo 4 caracteres'); return; }

    const currentHash = await hashPassword(form.current);
    if (!creds || creds.passwordHash !== currentHash) {
      setError('Contraseña actual incorrecta');
      return;
    }

    const newHash = await hashPassword(form.newPwd);
    saveAdminCreds({ ...creds, passwordHash: newHash, lastChanged: new Date().toISOString() });
    addActivityLog('Contraseña cambiada', 'Nueva contraseña guardada de forma segura (SHA-256)');
    setSuccess('Contraseña actualizada correctamente');
    setForm({ current: '', newPwd: '', confirm: '' });
  };

  return (
    <form onSubmit={handleChange} className="space-y-4 max-w-md">
      {error && <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm">{error}</div>}
      {success && <div className="p-3 bg-primary/10 border border-primary text-primary text-sm flex items-center gap-2"><CheckCircle size={14} />{success}</div>}

      <div>
        <Label>Contraseña actual</Label>
        <Input type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
      </div>
      <div>
        <Label>Nueva contraseña</Label>
        <Input type="password" value={form.newPwd} onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))} />
        {form.newPwd && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={cn("h-1 flex-1 transition-colors", i <= strength.score ? strength.color : 'bg-border')} />
              ))}
            </div>
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
      {creds?.lastChanged && (
        <p className="text-xs text-muted-foreground">Último cambio: {new Date(creds.lastChanged).toLocaleString('es-CO')}</p>
      )}
      <p className="text-xs text-muted-foreground bg-secondary p-2 border border-border">
        🔒 Las contraseñas se almacenan con hash SHA-256. Nunca se guarda texto plano.
      </p>
      <Button type="submit">Cambiar Contraseña</Button>
    </form>
  );
}

// --- Activity Log Section ---
function ActivitySection() {
  const { data: logs = [] } = useActivityLog();

  const actionIcon: Record<string, string> = {
    'Inicio de sesión': '🔑',
    'Propiedad creada': '🏠',
    'Propiedad editada': '✏️',
    'Propiedad eliminada': '🗑️',
    'Contraseña cambiada': '🔒',
    'WhatsApp actualizado': '💬',
    'Imagen subida': '🖼️',
    'Imagen eliminada': '🗑️',
    'Contenido del sitio actualizado': '📝',
    'Fondo del hero actualizado': '🌄',
    'Fondo del hero eliminado': '🌄',
    'Audio del reproductor actualizado': '🎵',
    'Precios actualizados': '💰',
  };

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed border-border">
        <Activity size={32} className="mx-auto mb-2 opacity-40" />
        <p>No hay actividad registrada aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {logs.map(log => (
        <div key={log.id} className="flex gap-4 p-3 bg-card border border-border hover:border-primary/50 transition-colors">
          <span className="text-lg shrink-0">{actionIcon[log.action] || '📋'}</span>
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

// --- Main Config Page ---
const sections = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'hero', label: 'Fondo Hero', icon: ImageIcon },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'activity', label: 'Actividad', icon: Activity },
];

export default function AdminConfig() {
  const [active, setActive] = useState('whatsapp');

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Configuración</h1>
          <p className="text-muted-foreground">WhatsApp, fondo, seguridad y registro de actividad</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sub-nav */}
        <nav className="flex flex-row md:flex-col gap-1 md:w-48 shrink-0">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-left border font-bold uppercase text-xs tracking-wider transition-colors",
                active === s.id
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === 'whatsapp' && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageCircle size={20} /> Configuración de WhatsApp</h2>
              <WhatsAppSection />
            </section>
          )}
          {active === 'hero' && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ImageIcon size={20} /> Fondo Principal (Hero)</h2>
              <HeroBgSection />
            </section>
          )}
          {active === 'security' && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield size={20} /> Seguridad Administrativa</h2>
              <PasswordSection />
            </section>
          )}
          {active === 'activity' && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity size={20} /> Registro de Actividad</h2>
              <ActivitySection />
            </section>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
