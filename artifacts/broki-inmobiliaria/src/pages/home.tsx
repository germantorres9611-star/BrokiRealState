import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSiteContent, useProperties, useGallery, usePricing, useWhatsAppConfig, useHeroBg } from '../hooks/use-broki';
import { formatCurrency, cn } from '../lib/utils';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../lib/local-db';
import { Button } from '../components/ui-custom';
import { AudioPlayer } from '../components/AudioPlayer';
import { WhatsAppButton } from '../components/WhatsAppButton';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const fadeIn  = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function Home() {
  const { data: content } = useSiteContent();
  const { data: properties = [] } = useProperties();
  const { data: gallery = [] } = useGallery();
  const { data: pricing = [] } = usePricing();
  const { data: whatsapp } = useWhatsAppConfig();
  const { data: heroBg } = useHeroBg();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!content) return null;

  const handleContact = () => {
    const num = (whatsapp?.number || content.contactWhatsapp).replace(/\D/g, '');
    const msg = whatsapp?.message ? encodeURIComponent(whatsapp.message) : '';
    window.open(`https://wa.me/${num}${msg ? `?text=${msg}` : ''}`, '_blank');
  };

  const bgSrc = heroBg || `${import.meta.env.BASE_URL}images/hero-bg.png`;

  return (
    <div className="min-h-screen pb-24">

      {/* ── Navbar ── */}
      <nav className={cn(
        "fixed top-0 w-full z-40 transition-all duration-500",
        scrolled
          ? "glass-nav border-b border-white/20 shadow-lg shadow-black/5"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-2xl tracking-tighter"
          >
            BROKI
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-bold"
          >
            <a href="#apartamentos" className="hover:text-primary transition-colors">Apartamentos</a>
            <a href="#galeria"       className="hover:text-primary transition-colors">Galería</a>
            <a href="#precios"       className="hover:text-primary transition-colors">Inversión</a>
          </motion.div>

          <Link href="/admin" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgSrc}
            alt="Hero Background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary/15 blur-[80px] rounded-full"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center pt-20">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-6"
          >
            Inmobiliaria Premium
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-6xl md:text-8xl lg:text-[130px] font-display font-bold leading-none mb-6 text-foreground"
          >
            {content.heroTitle}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground font-light mb-14 max-w-2xl mx-auto"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-20"
          >
            <Button
              onClick={() => document.getElementById('apartamentos')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base px-10 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            >
              {content.heroCta}
            </Button>
            <Button variant="outline" onClick={handleContact} className="text-base px-10 py-4 glass-btn">
              {content.heroCtaSecondary}
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.7 }}
            className="inline-flex gap-12 glass-card px-10 py-5 border border-white/20"
          >
            {[
              { value: properties.filter(p => p.available).length, label: 'Disponibles' },
              { value: '100%', label: 'Satisfacción' },
              { value: '10+', label: 'Años exp.' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ── Apartamentos ── */}
      <section id="apartamentos" className="py-32 border-t border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">COLECCIÓN</h2>
            <p className="text-muted-foreground text-lg uppercase tracking-widest">Espacios seleccionados</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.filter(p => p.available).map((prop, i) => (
              <motion.div
                key={prop.id}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProperty(prop)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden bg-card border border-border relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                  <img
                    src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop'}
                    alt={prop.name}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 glass-tag px-3 py-1 text-xs font-bold uppercase tracking-wider z-20">
                    {prop.category}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 glass-overlay py-4 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Ver detalles →</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{prop.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">{prop.location}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(prop.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería ── */}
      <section id="galeria" className="py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-4xl md:text-6xl font-display font-bold mb-16 text-center"
          >
            VISUALES
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {gallery.map((img, i) => (
              <motion.div
                key={i}
                variants={fadeIn} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative overflow-hidden group border border-border",
                  i === 0 ? "col-span-2 row-span-2" : "",
                  i === 3 ? "md:col-span-2" : ""
                )}
              >
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img
                  src={img} alt={`Gallery ${i}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ── */}
      <section id="precios" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-4xl md:text-6xl font-display font-bold mb-4"
            >
              INVERSIÓN
            </motion.h2>
            <p className="text-muted-foreground uppercase tracking-widest">Planes estructurados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((tier, i) => (
              <motion.div
                key={tier.id}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-8 border flex flex-col transition-all duration-300",
                  tier.id === 'premium'
                    ? "border-primary glass-card shadow-[0_0_40px_rgba(22,163,74,0.15)] relative"
                    : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50"
                )}
              >
                {tier.id === 'premium' && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Top
                  </div>
                )}
                <h3 className="text-2xl font-display font-bold mb-2">{tier.name}</h3>
                <p className="text-3xl text-foreground font-bold mb-8">{tier.priceRange}</p>
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

      {/* ── Footer CTA ── */}
      <section className="py-32 bg-primary text-primary-foreground text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-5xl md:text-7xl font-display font-black mb-8 max-w-4xl mx-auto uppercase relative z-10"
        >
          Encuentra Tu Próximo Espacio
        </motion.h2>
        <Button onClick={handleContact} className="bg-white text-primary hover:bg-white/90 border-none text-xl py-4 px-10 font-bold relative z-10 shadow-2xl">
          Agendar Visita Ahora
        </Button>
      </section>

      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onContact={handleContact}
      />

      <WhatsAppButton />
      <AudioPlayer />
    </div>
  );
}
