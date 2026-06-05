import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'wouter';
import {
  useSiteContent, useProperties, useGallery, usePricing,
  useWhatsAppConfig, useHeroBg, usePropertyMgmtService
} from '../hooks/use-broki';
import { formatCurrency, cn } from '../lib/utils';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../lib/local-db';
import { Button } from '../components/ui-custom';
import { AudioPlayer } from '../components/AudioPlayer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Video, Camera, FileText, RotateCcw, Shield } from 'lucide-react';

// ── Animation variants ──────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

// ── Animated hero title ──────────────────────────────
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <div className="overflow-hidden">
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ y: '110%', opacity: 0, rotateX: -20 }}
              animate={{ y: '0%', opacity: 1, rotateX: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.1 + wi * 0.18,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {word}
            </motion.span>
          </span>
          {wi < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Scroll reveal wrapper ────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { data: content } = useSiteContent();
  const { data: properties = [] } = useProperties();
  const { data: gallery = [] } = useGallery();
  const { data: pricing = [] } = usePricing();
  const { data: whatsapp } = useWhatsAppConfig();
  const { data: heroBg } = useHeroBg();
  const { data: mgmt } = usePropertyMgmtService();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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
        scrolled ? "glass-nav border-b border-white/20 shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-bold text-2xl"
          >
            BROKI
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-semibold"
          >
            <a href="#apartamentos" className="hover:text-primary transition-colors">Apartamentos</a>
            <a href="#galeria"       className="hover:text-primary transition-colors">Galería</a>
            <a href="#servicios"     className="hover:text-primary transition-colors">Servicios</a>
            <a href="#precios"       className="hover:text-primary transition-colors">Inversión</a>
          </motion.div>

          <Link href="/admin" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 z-0">
          <img src={bgSrc} alt="Broki Inmobiliaria" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
        </div>

        {/* Ambient orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -28, 0], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{ y: [0, 22, 0], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 blur-[100px] rounded-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center pt-20">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-8"
          >
            Inmobiliaria Premium · Colombia
          </motion.p>

          {/* Animated word-by-word title */}
          <h1 className="text-5xl md:text-7xl lg:text-[110px] font-display font-bold leading-[1.0] mb-8 text-foreground perspective-[1200px]">
            <AnimatedTitle text={content.heroTitle} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-lg md:text-xl text-muted-foreground font-light mb-14 max-w-xl mx-auto leading-relaxed"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button
              onClick={() => document.getElementById('apartamentos')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base px-10 py-4 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              {content.heroCta}
            </Button>
            <Button variant="outline" onClick={handleContact} className="text-base px-10 py-4 glass-btn">
              {content.heroCtaSecondary}
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="inline-flex flex-wrap justify-center gap-8 glass-card px-10 py-5 border border-white/20"
          >
            {[
              { value: properties.filter(p => p.available).length, label: 'Disponibles' },
              { value: '100%', label: 'Satisfacción' },
              { value: '10+', label: 'Años de exp.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-display font-bold text-primary">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-px h-14 bg-gradient-to-b from-primary to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ── Apartamentos ── */}
      <section id="apartamentos" className="py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-3">COLECCIÓN</h2>
            <p className="text-muted-foreground uppercase tracking-widest">Espacios seleccionados</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.filter(p => p.available).map((prop, i) => (
              <Reveal key={prop.id} delay={i * 0.08}>
                <div
                  onClick={() => setSelectedProperty(prop)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-card border border-border relative mb-5">
                    <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                    <img
                      src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop'}
                      alt={prop.name}
                      className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 group-hover:scale-104 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 glass-tag px-3 py-1 text-xs font-bold uppercase tracking-wider z-20">
                      {prop.category}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 glass-overlay py-4 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                      <p className="text-sm font-semibold text-white uppercase tracking-wider">Ver detalles →</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1.5 group-hover:text-primary transition-colors">{prop.name}</h3>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">{prop.location}</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(prop.price)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería ── */}
      <section id="galeria" className="py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold">VISUALES</h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {gallery.map((img, i) => (
              <Reveal
                key={i}
                delay={i * 0.04}
                className={cn(
                  "relative overflow-hidden group border border-border",
                  i === 0 ? "col-span-2 row-span-2" : "",
                  i === 3 ? "md:col-span-2" : ""
                )}
              >
                <div className="absolute inset-0 bg-primary/35 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img
                  src={img} alt={`Gallery ${i}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Administración de Inmuebles ── */}
      {mgmt?.visible && (
        <section id="servicios" className="py-32 border-t border-border relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <Reveal className="mb-16">
              <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-3">Nuestros Servicios</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">{mgmt.title}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">{mgmt.description}</p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Includes */}
              <Reveal delay={0.1}>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-5">Incluye</h3>
                  {mgmt.includes.map((item, i) => {
                    const icons = [Video, Camera, Camera, FileText, FileText];
                    const Icon = icons[i] ?? FileText;
                    return (
                      <div key={i} className="flex items-start gap-4 p-4 bg-card border border-border hover:border-primary/40 transition-colors">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-primary" />
                        </div>
                        <p className="text-sm leading-relaxed pt-2">{item}</p>
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              {/* Pricing & details */}
              <Reveal delay={0.2}>
                <div className="space-y-6">
                  {/* Price card */}
                  <div className="p-8 border border-primary bg-primary/5">
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Valor del Servicio Audiovisual</p>
                    <p className="text-4xl font-display font-bold mb-1">{mgmt.audiovisualPrice}</p>
                    <p className="text-sm text-muted-foreground">+ {mgmt.commission} al concretarse la venta</p>
                  </div>

                  {/* Benefit */}
                  <div className="p-6 border border-border bg-card flex gap-4">
                    <RotateCcw size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm mb-1 uppercase tracking-wider">Beneficio Especial</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{mgmt.benefit}</p>
                    </div>
                  </div>

                  {/* No exclusivity */}
                  {mgmt.noExclusivity && (
                    <div className="p-6 border border-border bg-card flex gap-4">
                      <Shield size={20} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm mb-1 uppercase tracking-wider">Sin Exclusividad</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{mgmt.ownershipNote}</p>
                      </div>
                    </div>
                  )}

                  <Button className="w-full py-4 text-base" onClick={handleContact}>
                    Solicitar Información
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── Precios ── */}
      <section id="precios" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/7 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-3">INVERSIÓN</h2>
            <p className="text-muted-foreground uppercase tracking-widest">Planes estructurados</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.1}>
                <div className={cn(
                  "p-8 border flex flex-col transition-all duration-300 h-full",
                  tier.id === 'premium'
                    ? "border-primary glass-card shadow-[0_0_40px_rgba(22,163,74,0.12)] relative"
                    : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/40"
                )}>
                  {tier.id === 'premium' && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-widest">
                      Top
                    </div>
                  )}
                  <h3 className="text-2xl font-display font-bold mb-2">{tier.name}</h3>
                  <p className="text-2xl text-foreground font-bold mb-8">{tier.priceRange}</p>
                  <ul className="flex-1 space-y-3 mb-8">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-muted-foreground text-sm">
                        <div className="w-1.5 h-1.5 bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={tier.id === 'premium' ? 'primary' : 'outline'} className="w-full" onClick={handleContact}>
                    Consultar
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-32 bg-primary text-primary-foreground text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
        <Reveal className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-display font-black mb-8 max-w-4xl mx-auto uppercase">
            Encuentra Tu Próximo Espacio
          </h2>
          <Button onClick={handleContact} className="bg-white text-primary hover:bg-white/90 border-none text-lg py-4 px-12 font-bold shadow-2xl">
            Agendar Visita Ahora
          </Button>
        </Reveal>
      </section>

      <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} onContact={handleContact} />
      <WhatsAppButton />
      <AudioPlayer />
    </div>
  );
}
