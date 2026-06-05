import React, { useRef, useState } from 'react';
import AdminLayout from './layout';
import { useTracks, useUploadTrack, useDeleteTrack, useSetActiveTrack, useActiveTrackId } from '../../hooks/use-broki';
import { fileToBase64 } from '../../lib/utils';
import { Button } from '../../components/ui-custom';
import { Music2, Trash2, Play, CheckCircle, Upload, FileAudio } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav'];
const MAX_SIZE_MB = 15;

export default function AdminMusic() {
  const { data: tracks = [] } = useTracks();
  const { data: activeId } = useActiveTrackId();
  const uploadMut = useUploadTrack();
  const deleteMut = useDeleteTrack();
  const setActiveMut = useSetActiveTrack();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
          setError(`"${file.name}" no es un formato permitido (MP3, WAV, OGG)`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`"${file.name}" supera el límite de ${MAX_SIZE_MB}MB`);
          continue;
        }
        const base64 = await fileToBase64(file);
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
        await uploadMut.mutateAsync({ name: file.name, format: ext, data: base64 });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const formatBytes = (b64: string) => {
    const bytes = Math.round((b64.length * 3) / 4);
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Música</h1>
          <p className="text-muted-foreground">Gestiona el reproductor de fondo del sitio</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors p-12 flex flex-col items-center justify-center gap-3 mb-8 text-center"
      >
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <Upload size={36} className="text-muted-foreground" />
        <div>
          <p className="font-bold uppercase tracking-wider text-sm mb-1">
            {uploading ? 'Subiendo...' : 'Arrastra archivos o haz clic para subir'}
          </p>
          <p className="text-xs text-muted-foreground">MP3 · WAV · OGG · Máximo {MAX_SIZE_MB}MB por archivo</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Track list */}
      <div className="space-y-3">
        {tracks.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border text-muted-foreground">
            <FileAudio size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold">No hay canciones subidas aún</p>
            <p className="text-sm mt-1">Sube tu primer track para activar el reproductor</p>
          </div>
        )}

        <AnimatePresence>
          {tracks.map(track => {
            const isActive = track.id === activeId || (!activeId && tracks[0]?.id === track.id);
            const name = track.name.replace(/\.[^.]+$/, '');

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "flex items-center gap-4 p-4 border transition-all",
                  isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                )}
              >
                {/* Active indicator / Play icon */}
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center shrink-0",
                  isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                )}>
                  {isActive ? <Music2 size={18} /> : <Play size={16} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm truncate">{name}</p>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 shrink-0">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {track.format.toUpperCase()} · {formatBytes(track.data)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {!isActive && (
                    <Button
                      variant="outline"
                      className="px-3 py-2 text-xs flex items-center gap-1.5"
                      onClick={() => setActiveMut.mutate(track.id)}
                      disabled={setActiveMut.isPending}
                    >
                      <CheckCircle size={14} /> Activar
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    className="px-3 py-2"
                    onClick={() => {
                      if (confirm(`¿Eliminar "${name}"?`)) deleteMut.mutate(track.id);
                    }}
                    disabled={deleteMut.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {tracks.length > 0 && (
        <p className="mt-6 text-xs text-muted-foreground text-center border-t border-border pt-4">
          El reproductor en el sitio público reproducirá en bucle la canción marcada como <strong>Activa</strong>.
        </p>
      )}
    </AdminLayout>
  );
}
