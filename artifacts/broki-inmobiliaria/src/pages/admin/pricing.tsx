import React, { useEffect } from 'react';
import AdminLayout from './layout';
import { usePricing, useUpdatePricing } from '../../hooks/use-broki';
import { Button, Input, Label } from '../../components/ui-custom';
import { useForm, useFieldArray } from 'react-hook-form';
import { PricingCategory } from '../../lib/local-db';

export default function AdminPricing() {
  const { data: pricing = [] } = usePricing();
  const updateMut = useUpdatePricing();

  const { register, control, handleSubmit, reset } = useForm<{categories: PricingCategory[]}>({
    defaultValues: { categories: [] }
  });

  const { fields } = useFieldArray({
    control,
    name: "categories"
  });

  useEffect(() => {
    if (pricing.length > 0) {
      reset({ categories: pricing });
    }
  }, [pricing, reset]);

  const onSubmit = async (data: {categories: PricingCategory[]}) => {
    // Process features string back to array if modified as comma separated
    const processed = data.categories.map(c => ({
      ...c,
      features: typeof c.features === 'string' ? (c.features as string).split(',').map(s=>s.trim()) : c.features
    }));
    await updateMut.mutateAsync(processed);
    alert('Planes de inversión actualizados');
  };

  return (
    <AdminLayout>
      <div className="mb-10 border-b border-border pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Planes de Inversión</h1>
          <p className="text-muted-foreground">Edita las 3 tarjetas de precios que aparecen en la landing page.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={updateMut.isPending}>Guardar Precios</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {fields.map((field, index) => (
          <div key={field.id} className={`bg-card border p-6 ${index===2 ? 'border-primary' : 'border-border'}`}>
            <h3 className="font-bold text-xl uppercase mb-4 text-white">Plan {index+1}</h3>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Plan</Label>
                <Input {...register(`categories.${index}.name`)} />
              </div>
              <div>
                <Label>Rango de Precio</Label>
                <Input {...register(`categories.${index}.priceRange`)} placeholder="Desde $350M COP" />
              </div>
              <div>
                <Label>Características (separadas por coma)</Label>
                <Input {...register(`categories.${index}.features`)} placeholder="Feature 1, Feature 2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
