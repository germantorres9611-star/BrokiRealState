import React, { useState, useCallback, useRef } from 'react';
import AdminLayout from './layout';
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty, useImages, useUploadImage } from '../../hooks/use-broki';
import { Property } from '../../lib/local-db';
import { Button, Input, Textarea, Label, Dialog } from '../../components/ui-custom';
import { formatCurrency, fileToBase64, cn } from '../../lib/utils';
import { Edit, Trash2, Plus, Upload, X, GripVertical, ImageIcon, Check } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  location: z.string().min(1, "Requerido"),
  price: z.coerce.number().min(0),
  area: z.coerce.number().min(0),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  description: z.string().min(1, "Requerido"),
  category: z.enum(['economico', 'medio', 'premium']),
  available: z.boolean(),
  images: z.array(z.string())
});

type FormValues = z.infer<typeof schema>;

function ImageUploadZone({ value = [], onChange }: { value: string[]; onChange: (imgs: string[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: library = [] } = useImages();
  const uploadImgMut = useUploadImage();
  const [showLibrary, setShowLibrary] = useState(false);

  const processFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await fileToBase64(file);
        // Also save to global library
        uploadImgMut.mutate({ name: file.name, data: base64 });
        newImages.push(base64);
      }
      onChange([...value, ...newImages]);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, uploadImgMut]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) await processFiles(files);
  }, [processFiles]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragEnd = () => { setDraggedIdx(null); setDragOver(null); };
  const handleDragOverItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };
  const handleDropOnItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) moveImage(draggedIdx, idx);
    setDragOver(null);
    setDraggedIdx(null);
  };

  const toggleFromLibrary = (imgData: string) => {
    if (value.includes(imgData)) {
      onChange(value.filter(v => v !== imgData));
    } else {
      onChange([...value, imgData]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-10 px-6 text-center",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-secondary/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload size={32} className={cn("mb-3 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
        <p className="font-bold uppercase tracking-wider text-sm mb-1">
          {uploading ? "Subiendo imágenes..." : "Arrastra imágenes aquí"}
        </p>
        <p className="text-xs text-muted-foreground">o haz clic para seleccionar — JPG, PNG, WEBP — múltiples archivos</p>
      </div>

      {/* Selected images grid with drag-to-reorder */}
      {value.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <GripVertical size={12} /> Arrastra para reordenar · Primera imagen = portada
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {value.map((img, idx) => (
              <div
                key={img.slice(-20) + idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOverItem(e, idx)}
                onDrop={(e) => handleDropOnItem(e, idx)}
                className={cn(
                  "relative aspect-square border overflow-hidden group cursor-grab active:cursor-grabbing transition-all",
                  dragOver === idx ? "border-primary ring-2 ring-primary scale-105" : "border-border",
                  draggedIdx === idx ? "opacity-40" : "opacity-100",
                  idx === 0 ? "ring-2 ring-primary ring-offset-1" : ""
                )}
              >
                <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                    Portada
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library picker toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowLibrary(s => !s)}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-bold"
        >
          <ImageIcon size={14} />
          {showLibrary ? "Ocultar biblioteca" : `Elegir de biblioteca (${library.length} imágenes)`}
        </button>

        {showLibrary && (
          <div className="mt-3 border border-border bg-background p-3 max-h-52 overflow-y-auto">
            {library.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay imágenes en la biblioteca aún.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {library.map(img => {
                  const selected = value.includes(img.data);
                  return (
                    <div
                      key={img.id}
                      onClick={() => toggleFromLibrary(img.data)}
                      className={cn(
                        "relative aspect-square border cursor-pointer overflow-hidden transition-all",
                        selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                      )}
                    >
                      <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                      {selected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={18} className="text-primary drop-shadow" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProperties() {
  const { data: properties = [] } = useProperties();
  const createMut = useCreateProperty();
  const updateMut = useUpdateProperty();
  const deleteMut = useDeleteProperty();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { available: true, category: 'medio', images: [] }
  });

  const openNew = () => {
    setEditingId(null);
    reset({ available: true, category: 'medio', images: [] });
    setIsOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p.id);
    reset({ ...p });
    setIsOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    if (editingId) {
      await updateMut.mutateAsync({ ...data, id: editingId, createdAt: properties.find(p => p.id === editingId)?.createdAt || '' });
    } else {
      await createMut.mutateAsync(data);
    }
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar esta propiedad?")) {
      await deleteMut.mutateAsync(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Apartamentos</h1>
          <p className="text-muted-foreground">Gestiona el inventario de propiedades</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={18} /> Nuevo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {properties.map(p => (
          <div key={p.id} className="bg-card border border-border p-4 flex items-center justify-between group hover:border-primary transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-secondary border border-border overflow-hidden shrink-0">
                {p.images[0]
                  ? <img src={p.images[0]} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">SIN IMG</div>
                }
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground">· {p.images.length} foto{p.images.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{p.location} · {formatCurrency(p.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${p.available ? 'border-primary text-primary' : 'border-destructive text-destructive'}`}>
                    {p.available ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-border text-muted-foreground">
                    {p.category}
                  </span>
                </div>
              </div>
            </div>
            {/* Mini image strip */}
            {p.images.length > 1 && (
              <div className="hidden md:flex gap-1 mx-4">
                {p.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-10 h-10 border border-border overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
                {p.images.length > 4 && (
                  <div className="w-10 h-10 border border-border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    +{p.images.length - 4}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" onClick={() => openEdit(p)} className="px-3 py-2"><Edit size={16} /></Button>
              <Button variant="danger" onClick={() => handleDelete(p.id)} className="px-3 py-2"><Trash2 size={16} /></Button>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="border border-dashed border-border py-20 text-center text-muted-foreground">
            No hay propiedades. Crea la primera.
          </div>
        )}
      </div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? 'Editar Propiedad' : 'Nueva Propiedad'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label>Nombre</Label><Input {...register('name')} /></div>
            <div><Label>Ubicación</Label><Input {...register('location')} /></div>
            <div><Label>Precio (COP)</Label><Input type="number" {...register('price')} /></div>
            <div><Label>Área (m²)</Label><Input type="number" {...register('area')} /></div>
            <div><Label>Habitaciones</Label><Input type="number" {...register('bedrooms')} /></div>
            <div><Label>Baños</Label><Input type="number" {...register('bathrooms')} /></div>
            <div>
              <Label>Categoría</Label>
              <select {...register('category')} className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary outline-none">
                <option value="economico">Económico</option>
                <option value="medio">Medio</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('available')} className="w-5 h-5 accent-primary bg-background border-border" />
                <span className="text-sm font-bold uppercase tracking-wider">Disponible en sitio</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea {...register('description')} />
          </div>

          <div>
            <Label className="mb-3 block">
              Imágenes del apartamento
              <span className="ml-2 text-xs font-normal text-muted-foreground normal-case tracking-normal">(múltiples · arrastra para reordenar · primera = portada)</span>
            </Label>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploadZone value={field.value || []} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editingId ? 'Actualizar Propiedad' : 'Crear Propiedad'}
            </Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
