import React, { useState } from 'react';
import { Property } from '../lib/local-db';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../lib/utils';
import { MapPin, BedDouble, Bath, Square, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui-custom';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onContact: () => void;
}

export function PropertyModal({ property, onClose, onContact }: PropertyModalProps) {
  const [imgIndex, setImgIndex] = useState(0);

  if (!property) return null;

  const nextImg = () => setImgIndex((prev) => (prev + 1) % Math.max(1, property.images.length));
  const prevImg = () => setImgIndex((prev) => (prev - 1 + property.images.length) % Math.max(1, property.images.length));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
      >
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-border bg-background/80 backdrop-blur-sm">
            <h2 className="text-xl font-display font-bold">{property.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-border transition-colors">
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="relative h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-border bg-card overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIndex}
                  src={property.images[imgIndex] || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&h=800&fit=crop'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt={property.name}
                />
              </AnimatePresence>
              
              {property.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <button onClick={prevImg} className="p-3 bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImg} className="p-3 bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-sm mb-4">
                <MapPin size={16} />
                {property.location}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-primary">{formatCurrency(property.price)}</h1>
              
              <div className="grid grid-cols-3 gap-6 border-y border-border py-8 mb-8">
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2"><Square size={16}/> Área</span>
                  <span className="text-xl font-bold">{property.area} m²</span>
                </div>
                <div className="flex flex-col gap-2 border-l border-border pl-6">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2"><BedDouble size={16}/> Habs</span>
                  <span className="text-xl font-bold">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col gap-2 border-l border-border pl-6">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2"><Bath size={16}/> Baños</span>
                  <span className="text-xl font-bold">{property.bathrooms}</span>
                </div>
              </div>

              <div className="mb-12 flex-1">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-border pb-2 inline-block">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-light">
                  {property.description}
                </p>
              </div>

              <Button onClick={onContact} className="w-full py-5 text-lg">
                Agendar Visita
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
