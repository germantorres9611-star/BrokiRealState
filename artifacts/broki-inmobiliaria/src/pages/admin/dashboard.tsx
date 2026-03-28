import React from 'react';
import AdminLayout from './layout';
import { useProperties, useImages } from '../../hooks/use-broki';
import { Home, Image as ImageIcon, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { data: properties = [] } = useProperties();
  const { data: images = [] } = useImages();

  const stats = [
    { label: 'Propiedades Totales', value: properties.length, icon: Home },
    { label: 'Propiedades Activas', value: properties.filter(p => p.available).length, icon: TrendingUp },
    { label: 'Imágenes Subidas', value: images.length, icon: ImageIcon },
  ];

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen general de BROKI INMOBILIARIA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">{stat.label}</span>
              <stat.icon className="text-primary" size={20} />
            </div>
            <div className="text-5xl font-display font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
