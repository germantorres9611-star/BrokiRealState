import React, { useEffect } from 'react';
import AdminLayout from './layout';
import { useSiteContent, useUpdateContent } from '../../hooks/use-broki';
import { Button, Input, Label } from '../../components/ui-custom';
import { useForm } from 'react-hook-form';
import { SiteContent } from '../../lib/local-db';

export default function AdminContent() {
  const { data: content } = useSiteContent();
  const updateMut = useUpdateContent();

  const { register, handleSubmit, reset } = useForm<SiteContent>();

  useEffect(() => {
    if (content) reset(content);
  }, [content, reset]);

  const onSubmit = async (data: SiteContent) => {
    await updateMut.mutateAsync(data);
    alert('Contenido actualizado correctamente');
  };

  return (
    <AdminLayout>
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl font-display font-bold mb-2">Contenido del Sitio</h1>
        <p className="text-muted-foreground">Modifica los textos principales de la página pública</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-10">
        
        <div className="bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase border-b border-border pb-2 mb-4">Sección Hero</h2>
          <div>
            <Label>Título Principal</Label>
            <Input {...register('heroTitle')} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input {...register('heroSubtitle')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Texto Botón Primario</Label>
              <Input {...register('heroCta')} />
            </div>
            <div>
              <Label>Texto Botón Secundario</Label>
              <Input {...register('heroCtaSecondary')} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase border-b border-border pb-2 mb-4">Datos de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Teléfono</Label>
              <Input {...register('contactPhone')} />
            </div>
            <div>
              <Label>WhatsApp (Código de país + Número)</Label>
              <Input {...register('contactWhatsapp')} placeholder="573041363265" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label>Correo Electrónico</Label>
              <Input {...register('contactEmail')} type="email" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={updateMut.isPending}>
          {updateMut.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </AdminLayout>
  );
}
