import React, { useState } from 'react';
import AdminLayout from './layout';
import { useImages, useUploadImage, useDeleteImage, useUploadAudio, useAudio } from '../../hooks/use-broki';
import { fileToBase64 } from '../../lib/utils';
import { Button, Label } from '../../components/ui-custom';
import { Trash2, Upload, Music } from 'lucide-react';

export default function AdminFiles() {
  const { data: images = [] } = useImages();
  const uploadImgMut = useUploadImage();
  const deleteImgMut = useDeleteImage();
  
  const { data: hasAudio } = useAudio();
  const uploadAudioMut = useUploadAudio();

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const base64 = await fileToBase64(file);
        await uploadImgMut.mutateAsync({ name: file.name, data: base64 });
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      await uploadAudioMut.mutateAsync(base64);
      alert("Audio cargado exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error al subir audio");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl font-display font-bold mb-2">Archivos</h1>
        <p className="text-muted-foreground">Sube imágenes y música para usar en el sitio. Todo se guarda localmente.</p>
      </div>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
            <Music size={20}/> Reproductor de Fondo
          </h2>
        </div>
        <div className="bg-card border border-border p-6 flex items-center justify-between">
          <div>
            <p className="font-bold mb-1">Estado actual: {hasAudio ? <span className="text-primary">Audio cargado</span> : <span className="text-destructive">Sin audio</span>}</p>
            <p className="text-sm text-muted-foreground">Sube un archivo MP3 para que se reproduzca en el pie de la página pública.</p>
          </div>
          <div>
            <Label className="cursor-pointer border border-border hover:border-primary px-6 py-3 font-bold uppercase text-sm inline-block transition-colors">
              {uploading ? 'Cargando...' : 'Subir MP3'}
              <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={uploading} />
            </Label>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
            <Upload size={20}/> Biblioteca de Imágenes
          </h2>
          <Label className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 font-bold uppercase text-sm inline-block hover:bg-primary/90 transition-colors">
            {uploading ? 'Cargando...' : 'Subir Imágenes'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="aspect-square bg-card border border-border relative group overflow-hidden">
              <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                <span className="text-xs text-white px-2 text-center truncate w-full">{img.name}</span>
                <Button variant="danger" className="py-2 px-4 text-xs" onClick={() => deleteImgMut.mutate(img.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-border text-muted-foreground">
              No hay imágenes subidas.
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
