import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSiteContent, useProperties, useGallery, usePricing } from '../hooks/use-broki';
import { formatCurrency, cn } from '../lib/utils';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../lib/local-db';
import { Button } from '../components/ui-custom';
import { AudioPlayer } from '../components/AudioPlayer';
import { WhatsAppButton } from '../components/WhatsAppButton';

export default function Home() {
  const { data: content } = useSiteContent();
  const { data: properties = [] } = useProperties();
  const { data: gallery = [] } = useGallery();
  const { data: pricing = [] } = usePricing();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  if (!content) return null;

  const handleContact = () => {
    window.open(`https://wa.me/${content.contactWhatsapp.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-display font-bold text-2xl tracking-tighter">BROKI</div>
          <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-bold">
            <a href="#apartamentos" className="hover:text-primary transition-colors">Apartamentos</a>
            <a href="#galeria" className="hover:text-primary transition-colors">Galería</a>
            <a href="#precios" className="hover:text-primary transition-colors">Inversión</a>
          </div>
          <Link href="/admin" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[140px] font-display font-bold leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              {content.heroTitle}
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground font-light mb-12 max-w-3xl mx-auto">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button onClick={() => document.getElementById('apartamentos')?.scrollIntoView({ behavior: 'smooth' })}>
                {content.heroCta}
              </Button>
              <Button variant="outline" onClick={handleContact}>
                {content.heroCtaSecondary}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Apartamentos Section */}
      <section id="apartamentos" className="py-32 border-t border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">COLECCIÓN</h2>
            <p className="text-muted-foreground text-lg uppercase tracking-widest">Espacios seleccionados</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.filter(p => p.available).map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProperty(prop)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden bg-card border border-border relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                  <img 
                    src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop'} 
                    alt={prop.name}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider border border-border z-20">
                    {prop.category}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{prop.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">{prop.location}</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(prop.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria Section */}
      <section id="galeria" className="py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-display font-bold mb-16 text-center"
          >
            VISUALES
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {gallery.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative overflow-hidden group border border-border",
                  i === 0 ? "col-span-2 row-span-2" : "",
                  i === 3 ? "md:col-span-2" : ""
                )}
              >
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios Section */}
      <section id="precios" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">INVERSIÓN</h2>
            <p className="text-muted-foreground uppercase tracking-widest">Planes estructurados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((tier, i) => (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-8 border bg-card/50 backdrop-blur-sm flex flex-col",
                  tier.id === 'premium' ? "border-primary shadow-[0_0_30px_rgba(10,10,255,0.1)] relative" : "border-border"
                )}
              >
                {tier.id === 'premium' && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Top
                  </div>
                )}
                <h3 className="text-2xl font-display font-bold mb-2">{tier.name}</h3>
                <p className="text-3xl text-white font-bold mb-8">{tier.priceRange}</p>
                <ul className="flex-1 space-y-4 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-none" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.id === 'premium' ? 'primary' : 'outline'} className="w-full" onClick={handleContact}>
                  Consultar
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-primary text-primary-foreground text-center px-6">
        <h2 className="text-5xl md:text-7xl font-display font-black mb-8 max-w-4xl mx-auto uppercase">
          Encuentra Tu Próximo Espacio
        </h2>
        <Button onClick={handleContact} className="bg-black text-white hover:bg-white hover:text-black border-none text-xl py-4 px-10">
          Agendar Visita Ahora
        </Button>
      </section>

      <PropertyModal 
        property={selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
        onContact={handleContact}
      />
      
      <WhatsAppButton number={content.contactWhatsapp} />
      <AudioPlayer />
    </div>
  );
}
