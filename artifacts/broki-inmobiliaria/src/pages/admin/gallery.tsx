import React, { useState } from 'react';
import AdminLayout from './layout';
import { useImages, useGallery, useUpdateGallery } from '../../hooks/use-broki';
import { Button } from '../../components/ui-custom';

export default function AdminGallery() {
  const { data: uploadedImages = [] } = useImages();
  const { data: gallery = [] } = useGallery();
  const updateMut = useUpdateGallery();

  const [selected, setSelected] = useState<string[]>([]);
  
  // Initialize selection on load
  React.useEffect(() => {
    setSelected(gallery);
  }, [gallery]);

  const toggleImage = (url: string) => {
    setSelected(prev => 
      prev.includes(url) ? prev.filter(x => x !== url) : [...prev, url]
    );
  };

  const handleSave = async () => {
    await updateMut.mutateAsync(selected);
    alert("Galería pública actualizada");
  };

  return (
    <AdminLayout>
      <div className="mb-10 border-b border-border pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Galería Pública</h1>
          <p className="text-muted-foreground">Selecciona las imágenes que aparecerán en la grilla visual de la página principal.</p>
        </div>
        <Button onClick={handleSave} disabled={updateMut.isPending}>Guardar Selección</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {uploadedImages.map(img => {
          const isSelected = selected.includes(img.data);
          return (
            <div 
              key={img.id} 
              onClick={() => toggleImage(img.data)}
              className={`aspect-[4/5] cursor-pointer relative overflow-hidden border-2 transition-all ${isSelected ? 'border-primary scale-95' : 'border-transparent'}`}
            >
              <img src={img.data} className="w-full h-full object-cover" />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-primary text-white font-bold px-3 py-1 uppercase text-xs">Seleccionada</div>
                </div>
              )}
            </div>
          )
        })}
        {uploadedImages.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-border text-muted-foreground">
            No hay imágenes en la biblioteca. Sube archivos primero.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
