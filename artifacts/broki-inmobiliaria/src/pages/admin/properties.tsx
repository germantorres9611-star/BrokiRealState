import React, { useState } from 'react';
import AdminLayout from './layout';
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty, useImages } from '../../hooks/use-broki';
import { Property } from '../../lib/local-db';
import { Button, Input, Textarea, Label, Dialog } from '../../components/ui-custom';
import { formatCurrency } from '../../lib/utils';
import { Edit, Trash2, Plus } from 'lucide-react';
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

export default function AdminProperties() {
  const { data: properties = [] } = useProperties();
  const { data: uploadedImages = [] } = useImages();
  const createMut = useCreateProperty();
  const updateMut = useUpdateProperty();
  const deleteMut = useDeleteProperty();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      available: true,
      category: 'medio',
      images: []
    }
  });

  const selectedImages = watch('images') || [];

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
      await updateMut.mutateAsync({ ...data, id: editingId, createdAt: properties.find(p=>p.id===editingId)?.createdAt || '' });
    } else {
      await createMut.mutateAsync(data);
    }
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("¿Seguro que quieres eliminar esta propiedad?")) {
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
                {p.images[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xs">NO IMG</div>}
              </div>
              <div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{p.location} • {formatCurrency(p.price)}</p>
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
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" onClick={() => openEdit(p)} className="px-3 py-2"><Edit size={16} /></Button>
              <Button variant="danger" onClick={() => handleDelete(p.id)} className="px-3 py-2"><Trash2 size={16} /></Button>
            </div>
          </div>
        ))}
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
                <span className="text-sm font-bold uppercase tracking-wider">Disponible en sitio web</span>
              </label>
            </div>
          </div>
          
          <div>
            <Label>Descripción</Label>
            <Textarea {...register('description')} />
          </div>

          <div>
            <Label>Seleccionar Imágenes (Galería)</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-border bg-background">
              {uploadedImages.length === 0 && <div className="col-span-full text-muted-foreground text-sm py-4">Sube imágenes en la sección de Archivos primero.</div>}
              {uploadedImages.map(img => (
                <div 
                  key={img.id} 
                  className={`aspect-square border cursor-pointer relative overflow-hidden ${selectedImages.includes(img.data) ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                >
                  <img src={img.data} className="w-full h-full object-cover" />
                  <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                      <input 
                        type="checkbox"
                        className="absolute top-1 left-1 w-4 h-4"
                        checked={field.value?.includes(img.data)}
                        onChange={(e) => {
                          const val = e.target.checked 
                            ? [...(field.value||[]), img.data] 
                            : field.value?.filter(v => v !== img.data);
                          field.onChange(val);
                        }}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
            {/* Fallback to external URL input if they want */}
            <div className="mt-4">
              <Label>Añadir URL externa (Opcional)</Label>
              <div className="flex gap-2">
                <Input id="ext_url" placeholder="https://..." />
                <Button type="button" variant="outline" onClick={() => {
                  const el = document.getElementById('ext_url') as HTMLInputElement;
                  if(el.value) {
                    const current = control._formValues.images || [];
                    reset({...control._formValues, images: [...current, el.value]});
                    el.value = '';
                  }
                }}>Añadir</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editingId ? 'Actualizar' : 'Crear Propiedad'}
            </Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
