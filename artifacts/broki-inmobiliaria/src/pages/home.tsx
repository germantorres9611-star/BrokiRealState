import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'wouter';
import {
  useSiteContent, useProperties, useGallery, usePricing,
  useWhatsAppConfig, useHeroBg, useAudiovisualService, useBrokerageService
} from '../hooks/use-broki';
import { formatCurrency, cn } from '../lib/utils';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../lib/local-db';
import { Button } from '../components/ui-custom';
import { AudioPlayer } from '../components/AudioPlayer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { WaterBackground } from '../components/WaterBackground';
import {
  Video, Camera, FileText, RotateCcw, Shield, Briefcase,
  CheckCircle, Users, FileCheck, Clock, Star
} from 'lucide-react';

// ── Animation variants ──────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

// ── Animated hero title ──────────────────────────────
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <div className="overflow-hidden flex flex-wrap justify-center gap-x-4 gap-y-1">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.1 + wi * 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
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

// ── Stagger list ─────────────────────────────────────
function RevealList({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div variants={fadeUp} transition={{ delay: delay + i * 0.06 }}>{child}</motion.div>
      ))}
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
  const { data: audiovisual } = useAudiovisualService();
  const { data: brokerage } = useBrokerageService();

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

  const showServices = (audiovisual?.visible || brokerage?.visible);
  const avIncludes = audiovisual?.includes ?? [];
  const avIcons = [Video, Camera, Camera, FileText, FileText];
  const brokerIcons = [FileCheck, Users, FileCheck, FileText];
  const benefitIcons = [Users, CheckCircle, Shield, Briefcase, Clock, Star];

  return (
    <div className="min-h-screen pb-24">

      {/* ── Navbar ── */}
      <nav className={cn(
        "fixed top-0 w-full z-40 transition-all duration-500",
        scrolled ? "glass-nav border-b border-white/10 shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/logo-broki-transparent.png"
              alt="Broki Inmobiliaria"
              className="h-12 w-auto object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden md:flex gap-8 text-sm font-semibold text-foreground/80"
          >
            <a href="#apartamentos" className="hover:text-primary transition-colors">Apartamentos</a>
            <a href="#galeria"       className="hover:text-primary transition-colors">Galería</a>
            {showServices && <a href="#servicios" className="hover:text-primary transition-colors">Servicios</a>}
            <a href="#precios"       className="hover:text-primary transition-colors">Inversión</a>
          </motion.div>

          <Link href="/admin" className="text-xs font-semibold text-foreground/50 hover:text-primary transition-colors tracking-wider">
            Admin
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Water animation background */}
        {heroBg ? (
          <div className="absolute inset-0 z-0">
            <img src={heroBg} alt="Broki Inmobiliaria" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <WaterBackground />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Ambient glow orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -24, 0], opacity: [0.15, 0.28, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/15 blur-[130px] rounded-full"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 blur-[110px] rounded-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center pt-20">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-8"
          >
            Inmobiliaria Premium · Colombia
          </motion.p>

          <h1 className="text-5xl md:text-7xl lg:text-[108px] font-display font-black leading-[1.05] mb-8 text-white">
            <AnimatedTitle text={content.heroTitle} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-foreground/70 font-light mb-14 max-w-xl mx-auto leading-relaxed"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button
              onClick={() => document.getElementById('apartamentos')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base px-10 py-4 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
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
            transition={{ duration: 0.8, delay: 1.0 }}
            className="inline-flex flex-wrap justify-center gap-10 glass-card px-10 py-5"
          >
            {[
              { value: properties.filter(p => p.available).length, label: 'Disponibles' },
              { value: '100%', label: 'Satisfacción' },
              { value: '10+', label: 'Años de exp.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-primary">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-foreground/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
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
            <h2 className="text-4xl md:text-6xl font-black mb-3">Colección</h2>
            <p className="text-foreground/50 text-sm uppercase tracking-widest font-semibold">Espacios seleccionados</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.filter(p => p.available).map((prop, i) => (
              <Reveal key={prop.id} delay={i * 0.08}>
                <div onClick={() => setSelectedProperty(prop)} className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-card border border-border relative mb-5">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                    <img
                      src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop'}
                      alt={prop.name}
                      className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
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
                    <h3 className="text-xl font-black mb-1.5 group-hover:text-primary transition-colors">{prop.name}</h3>
                    <p className="text-foreground/50 text-xs uppercase tracking-widest mb-3 font-semibold">{prop.location}</p>
                    <p className="text-lg font-black text-primary">{formatCurrency(prop.price)}</p>
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
            <h2 className="text-4xl md:text-6xl font-black">Visuales</h2>
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
                <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
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

      {/* ── Servicios: Dos sub-servicios ── */}
      {showServices && (
        <section id="servicios" className="py-32 border-t border-border relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 blur-[160px] rounded-full" />
            <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-cyan-400/5 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <Reveal className="mb-20 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-4">Nuestros Servicios</p>
              <h2 className="text-4xl md:text-6xl font-black mb-4">Administración de Inmuebles</h2>
              <p className="text-foreground/60 max-w-xl mx-auto">Dos soluciones especializadas para propietarios que quieren vender o arrendar con respaldo profesional.</p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* ── Sub-servicio 1: Audiovisual ── */}
              {audiovisual?.visible && (
                <Reveal delay={0.1}>
                  <div className="service-card rounded-2xl p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Video size={26} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">Servicio 01</p>
                        <h3 className="text-xl font-black leading-tight">{audiovisual.title}</h3>
                      </div>
                    </div>

                    <p className="text-foreground/65 text-sm leading-relaxed mb-6">{audiovisual.description}</p>

                    {/* Includes */}
                    <div className="space-y-3 mb-6 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Incluye</p>
                      {avIncludes.map((item, i) => {
                        const Icon = avIcons[i] ?? FileText;
                        return (
                          <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/8">
                            <Icon size={15} className="text-primary shrink-0" />
                            <span className="text-sm text-foreground/80">{item}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Price card */}
                    <div className="p-5 rounded-xl bg-primary/15 border border-primary/30 mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-primary/80 mb-1">Valor del Servicio</p>
                      <p className="text-3xl font-black text-primary mb-0.5">{audiovisual.price}</p>
                      <p className="text-xs text-foreground/55">+ {audiovisual.commission} al concretarse la venta</p>
                    </div>

                    {/* Benefit */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8 mb-4">
                      <RotateCcw size={16} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70 leading-relaxed">{audiovisual.benefit}</p>
                    </div>

                    {/* No exclusivity */}
                    {audiovisual.noExclusivity && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8 mb-6">
                        <Shield size={16} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/70 leading-relaxed">{audiovisual.ownershipNote}</p>
                      </div>
                    )}

                    <Button className="w-full" onClick={handleContact}>Solicitar Servicio Audiovisual</Button>
                  </div>
                </Reveal>
              )}

              {/* ── Sub-servicio 2: Corretaje ── */}
              {brokerage?.visible && (
                <Reveal delay={0.2}>
                  <div className="service-card rounded-2xl p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Briefcase size={26} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">Servicio 02</p>
                        <h3 className="text-xl font-black leading-tight">{brokerage.title}</h3>
                      </div>
                    </div>

                    <p className="text-foreground/65 text-sm leading-relaxed mb-6">{brokerage.description}</p>

                    {/* First month */}
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">El primer canon de arrendamiento cubre:</p>
                      <RevealList delay={0.3} className="space-y-2.5">
                        {(brokerage.firstMonthCovers ?? []).map((item, i) => {
                          const Icon = brokerIcons[i] ?? CheckCircle;
                          return (
                            <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/8">
                              <Icon size={15} className="text-primary shrink-0" />
                              <span className="text-sm text-foreground/80">{item}</span>
                            </div>
                          );
                        })}
                      </RevealList>
                    </div>

                    {/* From 2nd month */}
                    {brokerage.fromSecondMonthNote && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/15 border border-primary/30 mb-6">
                        <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80 mb-0.5">A partir del segundo mes</p>
                          <p className="text-sm text-foreground/75 leading-relaxed">{brokerage.fromSecondMonthNote}</p>
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="flex-1 mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Beneficios</p>
                      <div className="grid grid-cols-1 gap-2">
                        {(brokerage.benefits ?? []).map((b, i) => {
                          const Icon = benefitIcons[i] ?? CheckCircle;
                          return (
                            <div key={i} className="flex items-center gap-3 text-sm text-foreground/75">
                              <Icon size={14} className="text-primary shrink-0" />
                              {b}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleContact}>Solicitar Servicio de Corretaje</Button>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Precios ── */}
      <section id="precios" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/7 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-3">Inversión</h2>
            <p className="text-foreground/50 text-sm uppercase tracking-widest font-semibold">Planes estructurados</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.1}>
                <div className={cn(
                  "p-8 rounded-2xl flex flex-col transition-all duration-300 h-full",
                  tier.id === 'premium'
                    ? "service-card shadow-[0_0_50px_rgba(143,168,77,0.15)] relative"
                    : "border border-border bg-card/40 hover:border-primary/40 backdrop-blur-sm"
                )}>
                  {tier.id === 'premium' && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                      Top
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-8">{tier.priceRange}</p>
                  <ul className="flex-1 space-y-3 mb-8">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-foreground/65 text-sm">
                        <CheckCircle size={15} className="text-primary shrink-0" />
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
      <section className="py-32 text-white text-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2535 0%, #0d3140 50%, #112a3a 100%)' }}>
        <div className="absolute inset-0">
          <WaterBackground />
          <div className="absolute inset-0 bg-background/60" />
        </div>
        <Reveal className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6">¿Listo para dar el siguiente paso?</p>
          <h2 className="text-5xl md:text-7xl font-black mb-10 max-w-4xl mx-auto leading-tight">
            Encuentra Tu Próximo Espacio
          </h2>
          <Button onClick={handleContact} className="bg-primary text-white hover:bg-primary/90 border-none text-lg py-4 px-14 font-bold shadow-2xl shadow-primary/30 rounded-2xl">
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
