import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { ArrowRightIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SiPython, SiNotion, SiOpenai, SiZapier, SiAirtable, SiMake, SiGooglegemini, SiAnthropic, SiHuggingface, SiTensorflow } from 'react-icons/si';
import { SvgRings, SvgArrows, SvgFaceCursor, SvgAsterisk, SvgFlower } from './Decorations';
import PrivacyPolicy from './PrivacyPolicy';
import Blog from './Blog';
import BlogPost from './BlogPost';
import ImagePresentationViewer from './components/ImagePresentationViewer';
import Lenis from 'lenis';

// --- Types ---
export interface Testimonial {
  id: string;
  clientName: string;
  companyRole: string;
  quote: string;
  photo?: { url: string };
}

// --- Smooth Scroll Init ---
const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
};

// --- Interactive 3D Particle Sphere ---
const ParticleSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const numParticles = 800; // Number of dots
    let particles: { baseX: number, baseY: number, baseZ: number, cx: number, cy: number, cz: number, vx: number, vy: number, vz: number }[] = [];
    let sphereRadius = Math.min(width, height) * 0.4;
    
    // Golden ratio for even spherical distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    
    for (let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2; 
      const radiusAtY = Math.sqrt(1 - y * y); 
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Las partículas inician formando la esfera normal
      particles.push({
        baseX: x, baseY: y, baseZ: z,
        cx: x, cy: y, cz: z,
        vx: 0, vy: 0, vz: 0
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      sphereRadius = Math.min(width, height) * 0.4;
    };
    let mouse = { x: -1000, y: -1000 };
    let isExploded = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      const dx = mouse.x - width / 2;
      const dy = mouse.y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < sphereRadius && !isExploded) {
        isExploded = true;
        // Trigger explosion
        particles.forEach(p => {
           const speed = Math.random() * 40 + 20;
           p.vx = p.cx * speed;
           p.vy = p.cy * speed;
           p.vz = p.cz * speed;
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const deltaAngleY = 0.003; 
      const deltaAngleX = 0.001;

      const centerX = width / 2;
      const centerY = height / 2;

      // Physics variables
      const dampening = 0.96; // Se deslizan más lejos antes de detenerse

      particles.forEach((p) => {
        // 1. Apply Continuous Rotation directly to cx, cy, cz
        let rx = p.cx;
        let ry = p.cy * Math.cos(deltaAngleX) - p.cz * Math.sin(deltaAngleX);
        let rz = p.cy * Math.sin(deltaAngleX) + p.cz * Math.cos(deltaAngleX);

        p.cx = rx * Math.cos(deltaAngleY) + rz * Math.sin(deltaAngleY);
        p.cy = ry;
        p.cz = -rx * Math.sin(deltaAngleY) + rz * Math.cos(deltaAngleY);

        p.cx += p.vx / sphereRadius;
        p.cy += p.vy / sphereRadius;
        p.cz += p.vz / sphereRadius;

        // Friction
        p.vx *= dampening;
        p.vy *= dampening;
        p.vz *= dampening;

        // 5. Render
        const finalScale = 1000 / (1000 + p.cz * sphereRadius);
        const finalScreenX = centerX + p.cx * sphereRadius * finalScale;
        const finalScreenY = centerY + p.cy * sphereRadius * finalScale;

        // Depth sorting effect (fade out back particles)
        const zIndex = p.cz; 
        let opacity = Math.max(0.05, (zIndex + 1) / 2);

        // Vertical edge fade to prevent clipping at section divisions
        const marginY = height * 0.15; // 15% of screen height at top/bottom
        
        if (finalScreenY < marginY) {
          const fadeOut = finalScreenY / marginY;
          opacity *= Math.max(0, fadeOut);
        } else if (finalScreenY > height - marginY) {
          const fadeOut = (height - finalScreenY) / marginY;
          opacity *= Math.max(0, fadeOut);
        }

        const radius = Math.max(0.5, 3 * opacity * finalScale);

        ctx.beginPath();
        ctx.arc(finalScreenX, finalScreenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
};

// --- Animated Background (Intellexia-style breathing glow and drifting stars) ---
const AnimatedBackground = ({ showParticles = true }: { showParticles?: boolean }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0 bg-black">
      
      {/* Interactive Sphere */}
      {showParticles && <ParticleSphere />}

      {/* Massive centered yellow glow (Breathing / Pulsing) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#dcea22]/15 rounded-full blur-[150px] animate-glow-pulse z-0 will-change-transform" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#eab308]/10 rounded-full blur-[100px] animate-glow-pulse z-0 will-change-transform" style={{ animationDelay: '2s' }} />
      
      {/* Drifting Star particles */}
      <motion.div 
        animate={{ y: [0, -1000] }} 
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-[200%]" 
        style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '200px 200px', opacity: 0.3 }} 
      />
      <motion.div 
        animate={{ y: [0, -1000] }} 
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-[200%]" 
        style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 10px 10px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 150px, #ffffff, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '300px 300px', opacity: 0.15 }} 
      />
    </div>
  );
};

// --- Magnetic Interaction Wrapper ---
const Magnetic = ({ children }: { children: React.ReactElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      style={{ position: "relative" }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// --- Word Reveal Animation ---
const WordReveal = ({ text, className = "" }: { text: string, className?: string }) => {
  const words = text.split(" ");
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {}
      }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.25em]">
          <motion.span
            variants={{
              hidden: { y: "120%", opacity: 0, rotateZ: 5 },
              visible: { y: "0%", opacity: 1, rotateZ: 0, transition: { duration: 0.8 } }
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
};

// --- Scroll Reveal Text (Lights up on scroll) ---
const ScrollRevealText = ({ text, className = "" }: { text: string, className?: string }) => {
  const container = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "end 0.6"]
  });

  const words = text.split(" ");
  return (
    <p ref={container} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        const color = useTransform(scrollYProgress, [start, end], ["#ffffff40", "#ffffff"]);
        return (
          <motion.span key={i} style={{ color }} className="mr-[0.25em] transition-colors duration-100">
            {word}
          </motion.span>
        );
      })}
    </p>
  );
};

// --- Hover Bento Card (Glowing Borders) ---
const HoverBentoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative rounded-[32px] border border-white/5 bg-[#0a0a0c] overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 234, 34, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition duration-300 group-hover:opacity-100 border border-primary/50"
        style={{
          maskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
        }}
      />
      <div className="relative h-full z-10">
        {children}
      </div>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 inset-x-0 z-50 py-5 px-8 md:px-12 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/5"
    >
      <Magnetic>
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="https://framerusercontent.com/images/4cRD3H5ZmU3bQoa4cQR44DKeUs.png" 
            alt="Innogyzer Logo" 
            className="h-8 md:h-10 object-contain" 
          />
        </Link>
      </Magnetic>
      
      <div className="hidden lg:flex gap-8 text-sm font-medium text-white/70">
        <Magnetic><Link to={isHome ? "#quienes-somos" : "/#quienes-somos"} className="hover:text-white transition-colors">¿Quiénes somos?</Link></Magnetic>
        <Magnetic><Link to={isHome ? "#servicios" : "/#servicios"} className="hover:text-white transition-colors">Servicios Innovación</Link></Magnetic>
        <Magnetic><Link to={isHome ? "#servicios-ia" : "/#servicios-ia"} className="hover:text-white transition-colors">Servicios IA</Link></Magnetic>
        <Magnetic><Link to="/aviso-privacidad" className="hover:text-white transition-colors">Aviso de Privacidad</Link></Magnetic>
        <Magnetic><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></Magnetic>
      </div>

      <Magnetic>
        <button onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} className="bg-[#dcea22] hover:bg-[#eab308] text-black px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-yellow-900/30">
          Agenda
        </button>
      </Magnetic>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden z-10">
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">
        <motion.div style={{ y: yText, opacity: opacityText }} className="flex flex-col items-center w-full">
          
          {/* Top Pill / Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center bg-black/40 border border-white/10 rounded-full mb-10 overflow-hidden backdrop-blur-md shadow-2xl"
          >
            <div className="bg-[#dcea22] text-black text-xs font-bold px-4 py-1.5 tracking-wide">
              AI Driven
            </div>
            <div className="text-white/80 text-xs font-medium px-4 py-1.5 tracking-wide">
              Automatización de ventas
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1] w-full"
          >
            Automatización Inteligente<br />Para tu Empresa
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Innogyzer es tu aliado estratégico para transformar ideas en soluciones innovadoras y escalar tus resultados.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <Magnetic>
              <button onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} className="px-8 py-3.5 bg-[#dcea22] text-black font-bold rounded-lg hover:bg-[#eab308] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/30 w-full sm:w-auto text-sm">
                Contactanos
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </Magnetic>
            <Magnetic>
              <a href="#servicios" className="px-8 py-3.5 bg-black text-white/90 font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center w-full sm:w-auto text-sm">
                Nuestros Servicios
              </a>
            </Magnetic>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const Manifesto = () => {
  return (
    <section className="py-16 md:py-24 relative z-10 overflow-hidden bg-black/40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 max-w-5xl text-left relative z-10">
        <ScrollRevealText 
          text="Las mejores organizaciones no se limitan a sobrevivir a la inestabilidad ni a sortearla. La convierten en su ventaja. Utilizamos el diseño, la IA y la innovación para ayudarte a responder grandes preguntas y mejorar las cosas para tu organización, las personas y el planeta." 
          className="text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.3] justify-start tracking-tight" 
        />
      </div>
    </section>
  );
}

// --- Interactive Rings Animation ---
const InteractiveRings = () => {
  return (
    <motion.div 
      className="relative w-full flex-grow flex items-center justify-center mt-12 mb-4 min-h-[160px] cursor-crosshair group-hover:scale-105 transition-transform duration-500"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      whileHover="hover"
      initial="initial"
    >
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const dist = 55;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        
        return (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full border border-black/30 mix-blend-multiply"
            variants={{
              initial: { x: Math.cos(angle)*3, y: Math.sin(angle)*3, scale: 1 }, 
              hover: { 
                x: x, 
                y: y, 
                scale: 1.1,
                borderColor: "rgba(0,0,0,0.8)",
                borderWidth: "1.5px",
                transition: { type: "spring", stiffness: 80, damping: 10 } 
              }
            }}
          />
        );
      })}
    </motion.div>
  );
};

const About = () => {
  const cards = [
    { num: '1', title: 'Nuestro por qué', desc: 'Creemos en el potencial creativo de todas las personas, queremos ser esa chispa que detone innovación y su impacto en las organizaciones a través del diseño y la IA.' },
    { num: '2', title: 'El problema', desc: 'Las organizaciones pierden mucho tiempo y dinero en tratar de generar soluciones innovadoras a sus mayores desafíos sin tener certeza que funcionarán.' },
    { num: '3', title: 'Cómo lo hacemos', desc: 'Nosotros solucionamos esto a través de las metodologías más ágiles y rápidas, probadas con éxito en las organizaciones más innovadoras del mundo: Uber, Google, GE, Adidas, ONU, etc.' },
    { num: '4', title: 'We are...', desc: 'The AI Sprint Innovation Agency', highlight: true }
  ];

  return (
    <section id="quienes-somos" className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <WordReveal text="¿Quiénes somos?" className="text-4xl md:text-6xl font-bold mb-20 justify-center" />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              whileHover={{ scale: 1.05, y: -10 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
              className={`p-10 rounded-3xl border ${card.highlight ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(220,234,34,0.15)]' : 'glass-panel text-white'} flex flex-col group shadow-2xl relative overflow-hidden h-full`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <span className={`text-sm font-bold mb-8 block ${card.highlight ? 'text-black/50' : 'text-primary'}`}>0{card.num}</span>
                <h3 className={`text-2xl font-bold mb-4 ${card.highlight ? 'text-black' : 'text-white'}`}>{card.title}</h3>
                <p className={`${card.highlight ? 'text-black/80 font-medium' : 'text-white/60'} text-base leading-relaxed`}>{card.desc}</p>
                {card.highlight && <InteractiveRings />}
              </div>
              {!card.highlight && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Pillars = () => {
  const pillars = [
    { title: 'Agilidad y velocidad', icon: <SvgRings className="w-20 h-20" /> },
    { title: 'Tecnología', icon: <SvgArrows className="w-20 h-20" /> },
    { title: 'El Humano es el centro', icon: <SvgFaceCursor className="w-20 h-20" /> },
    { title: 'Decisiones con evidencia', icon: <SvgAsterisk className="w-20 h-20" /> },
  ];

  return (
    <section id="pilares" className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <WordReveal text="Nuestros Pilares Fundamentales" className="text-4xl md:text-6xl font-bold mb-20 text-center text-gradient-animate" />
        
        <div className="grid md:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              whileHover={{ scale: 1.05, y: -5 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center p-8 transition-colors group"
            >
              <div className="mb-8 text-white group-hover:text-primary transition-colors duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:drop-shadow-[0_0_15px_rgba(220,234,34,0.2)]">
                {pillar.icon}
              </div>
              <h4 className="font-light text-lg text-white/80 group-hover:text-primary transition-colors">{pillar.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Services = () => {
  const fallbackServices = [
    { slug: 'investigacion-y-insights', title: 'Investigación & Insights', desc: 'Descubrimos lo que realmente impulsa las decisiones de tus clientes para identificar oportunidades.', deco: <SvgRings /> },
    { slug: 'designing-strategy', title: 'Designing Strategy', desc: 'Alineamos objetivos, recursos y capacidades para asegurar un crecimiento a largo plazo.', deco: <SvgArrows /> },
    { slug: 'design-sprints', title: 'Design Sprints', desc: 'Resolvemos grandes desafíos e impulsamos la innovación probando soluciones reales en 5 días.', deco: <SvgFaceCursor /> },
    { slug: 'business-design', title: 'Business Design', desc: 'Diseñamos modelos de negocio y propuestas de valor innovadoras y sostenibles que generan valor.', deco: <SvgAsterisk /> },
    { slug: 'experimentacion', title: 'Experimentación', desc: 'Validamos tus ideas de negocio de manera ágil y efectiva reduciendo la incertidumbre mediante pilotos.', deco: <SvgFlower /> },
  ];

  const services = fallbackServices;

  return (
    <section id="servicios" className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <WordReveal text="Servicios de Innovación" className="text-4xl md:text-6xl font-bold mb-20" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(320px,auto)] gap-6">
          {services.map((svc, i) => {
            // Asymmetric Bento Layout classes
            let bentoClass = "md:col-span-1";
            if (i === 0) bentoClass = "md:col-span-2 md:row-span-2"; // Big Feature
            else if (i === 1) bentoClass = "md:col-span-2"; // Wide Horizontal
            else if (i === 4) bentoClass = "md:col-span-2"; // Wide Horizontal bottom
            else if (i === 5) bentoClass = "md:col-span-2"; // Wide Horizontal bottom

            return (
              <HoverBentoCard key={i} className={bentoClass}>
                <motion.div 
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                  className="h-full w-full p-8 flex flex-col relative z-10"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none z-0" />
                  
                  {/* Geometric Decoration Watermark */}
                  <div className={`absolute ${i === 0 ? '-bottom-12 right-0 md:right-8 w-80 h-80' : 'top-1/2 -translate-y-1/2 -right-16 md:-right-8 w-64 h-64'} text-white/5 group-hover:text-primary/10 transition-colors duration-700 pointer-events-none z-0 rotate-12 group-hover:rotate-0`}>
                    {svc.deco}
                  </div>
                  
                  <div className="relative z-10 w-full pr-4 md:pr-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary group-hover:text-yellow-400 transition-colors">{svc.title}</h3>
                    <p className="text-white/60 mb-8 flex-grow text-lg">{svc.desc}</p>
                  </div>
                  
                  <Magnetic>
                    <Link to={`/servicios/${svc.slug}`} className="relative z-10 flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all mt-auto w-fit text-sm">
                      Ver detalles <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </Magnetic>
                  
                  {i === 0 && (
                    <div className="mt-12 flex flex-row items-center gap-4 md:gap-6 flex-wrap relative z-10 justify-start">
                      {[
                        { Icon: SiPython, bg: "bg-white text-black" },
                        { Icon: SiOpenai, bg: "bg-white text-black" },
                        { Icon: SiNotion, bg: "bg-white text-black" },
                        { Icon: SiMake, bg: "bg-[#5E17EB] text-white" },
                        { Icon: SiZapier, bg: "bg-[#FF4A00] text-white" },
                        { Icon: SiGooglegemini, bg: "bg-blue-500 text-white" },
                        { Icon: SiAirtable, bg: "bg-white text-[#18BFFF]" },
                        { Icon: SiAnthropic, bg: "bg-[#F0C951] text-white" },
                        { Icon: SiHuggingface, bg: "bg-white text-[#FFD21E]" },
                        { Icon: SiTensorflow, bg: "bg-[#0052CC] text-white" }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-[1.5rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer ${item.bg}`}
                          animate={{
                            y: [0, -15, 0, 10, 0],
                            x: [0, 8, 0, -8, 0],
                            rotate: [0, 10, 0, -10, 0]
                          }}
                          transition={{
                            duration: 7 + (idx % 3),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: idx * 0.4
                          }}
                          whileHover={{ scale: 1.2, rotate: 0, transition: { duration: 0.3 } }}
                        >
                          <item.Icon className="w-8 h-8 md:w-10 md:h-10" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </HoverBentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ServicesAI = () => {
  return (
    <section id="servicios-ia" className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-glow/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 pb-2 text-gradient-animate tracking-tighter">Servicios de Inteligencia Artificial</h2>
            <p className="text-white/60 text-xl leading-relaxed mb-12">
              Mejora tus flujos de trabajo para maximizar el rendimiento y tomar un control efectivo de tu tiempo. Enfócate en lo que realmente importa para tu negocio, mientras las tareas rutinarias se ejecutan automáticamente con la ayuda de nuestras soluciones basadas en no-code y código.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{ perspective: 1000 }}
            >
              <div className="w-full max-w-md rounded-[40px] glass-panel border border-white/10 hidden lg:block overflow-hidden relative group">
                <ImagePresentationViewer />
              </div>
            </motion.div>
          </motion.div>

          <div className="flex flex-col gap-8 justify-center">
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" whileHover={{ scale: 1.05, x: -10 }} viewport={{ once: true }} 
              className="glass-panel p-10 rounded-[40px] group hover:border-glow/50 transition-colors shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-glow/20 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-3xl font-bold mb-2 relative z-10">Consultoría en automatización de IA</h3>
              <h4 className="text-primary font-medium mb-6 text-xl relative z-10">AI Consulting</h4>
              <p className="text-white/60 mb-8 text-lg relative z-10">¿Necesitas transformar tus procesos con IA? Nuestro equipo de expertos diseña soluciones a medida que se integran perfectamente con los flujos de trabajo de tu industria.</p>
              <Magnetic>
                <Link to="/servicios/ai-consulting" className="flex items-center gap-3 text-white font-bold group-hover:text-glow transition-colors relative z-10 text-lg">
                  Ver detalles <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" whileHover={{ scale: 1.05, x: -10 }} viewport={{ once: true }} 
              className="bg-gradient-to-br from-primary to-[#b8c617] p-10 rounded-[40px] group shadow-xl relative overflow-hidden"
            >
              <h3 className="text-3xl font-bold mb-2 relative z-10 text-black">Procesos de Automatización empresarial</h3>
              <h4 className="text-black/70 font-bold mb-6 text-xl relative z-10">El futuro llegó</h4>
              <p className="text-black/80 mb-8 text-lg relative z-10">Dale un respiro a tu equipo. Permite que la IA gestione las tareas repetitivas y minimice los errores, mientras tu empresa se enfoca en estrategias de alto impacto.</p>
              <Magnetic>
                <Link to="/servicios/business-automation" className="flex items-center gap-3 text-black font-black group-hover:gap-5 transition-all relative z-10 text-lg">
                  Ver detalles <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" whileHover={{ scale: 1.05, x: -10 }} viewport={{ once: true }} 
              className="glass-panel p-10 rounded-[40px] group hover:border-primary/50 transition-colors shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-3xl font-bold mb-2 relative z-10">Capacitación de IA</h3>
              <h4 className="text-primary font-medium mb-6 text-xl relative z-10">AI Training</h4>
              <p className="text-white/60 mb-8 text-lg relative z-10">Potencia las habilidades de tu equipo. Ofrecemos programas de capacitación y talleres prácticos para dominar las herramientas de Inteligencia Artificial.</p>
              <Magnetic>
                <Link to="/servicios/ai-training" className="flex items-center gap-3 text-white font-bold group-hover:text-primary transition-colors relative z-10 text-lg">
                  Ver detalles <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Team = () => {
  const members = [
    { name: 'Marco Velasco', role: 'Chief Executive Officer', image: '/team/marcovelazco.jpeg', linkedin: 'https://www.linkedin.com/in/marco-velasco-toledo/' },
    { name: 'Claudia Mendoza', role: 'Chief Operations and Project', image: '/team/claudiamendoza.jpg' },
    { name: 'Iván Sánchez', role: 'Head of Artificial Intelligence Solutions', image: '/team/ivansanchez.png', linkedin: 'https://www.linkedin.com/in/ivsanchezm/' },
    { name: 'Mariana Díaz', role: 'Head of Innovation Design', image: '/team/marianalopez.jpg' },
    { name: 'Juan Jose Cordova Zamorano', role: 'CTO - Chief Technology Officer', image: '/team/juanjosa.jpeg', linkedin: 'https://www.linkedin.com/in/jjcordova/' },
  ];

  return (
    <section id="equipo" className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20 max-w-3xl mx-auto">
          <WordReveal text="Equipo" className="text-4xl md:text-6xl font-bold mb-8 justify-center" />
          <p className="text-white/60 text-xl">Nuestro equipo está formado por profesionales apasionados por la innovación y la tecnología, comprometidos con habilitar soluciones estratégicas que impulsen el éxito de cada proyecto.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {members.map((member, i) => {
            const CardWrapper = member.linkedin ? motion.a : motion.div;
            return (
              <CardWrapper 
                key={i}
                href={member.linkedin}
                target={member.linkedin ? "_blank" : undefined}
                rel={member.linkedin ? "noopener noreferrer" : undefined}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                whileHover={{ scale: 1.1, y: -10 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="glass-panel p-8 rounded-[30px] text-center group relative overflow-hidden block"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-surface to-white/5 mb-8 border border-white/10 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(220,234,34,0.3)] transition-all duration-500 relative z-10 overflow-hidden">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <h4 className="text-xl font-bold mb-2 relative z-10 group-hover:text-primary transition-colors">{member.name}</h4>
                <p className="text-white/50 text-sm relative z-10">{member.role}</p>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('https://innogyzer-lms.vercel.app/api/testimonials?depth=1')
      .then(res => res.json())
      .then(data => {
        if (data && data.docs && data.docs.length > 0) {
          setTestimonials(data.docs);
        } else {
          // Fallback dummy data si no hay testimonios en el CMS
          setTestimonials([
            { id: '1', clientName: 'María González', companyRole: 'Directora de Innovación, TechCorp', quote: 'Innogyzer transformó por completo nuestra cultura organizacional. Gracias a su sprint de innovación, reducimos nuestros tiempos de entrega en un 40%.' },
            { id: '2', clientName: 'Carlos Ruiz', companyRole: 'CEO, StartupXYZ', quote: 'La implementación de IA que diseñaron para nosotros nos ahorró cientos de horas manuales al mes. Su equipo entiende perfectamente el cruce entre negocio y tecnología.' }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching testimonials:', err);
        // Fallback dummy data en caso de error
        setTestimonials([
          { id: '1', clientName: 'María González', companyRole: 'Directora de Innovación, TechCorp', quote: 'Innogyzer transformó por completo nuestra cultura organizacional. Gracias a su sprint de innovación, reducimos nuestros tiempos de entrega en un 40%.' }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <section className="py-16 md:py-24 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 max-w-3xl mx-auto">
          <WordReveal text="Testimonios" className="text-4xl md:text-6xl font-bold mb-8 justify-center" />
          <p className="text-white/60 text-xl">Lo que dicen los líderes sobre nuestro impacto.</p>
        </motion.div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 scrollbar-hide">
          {testimonials.map((test, i) => (
            <motion.div 
              key={test.id || i}
              variants={fadeUp} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="glass-panel p-8 md:p-10 rounded-[30px] flex-shrink-0 w-[85vw] md:w-[600px] snap-center flex flex-col justify-between border border-white/5"
            >
              <div className="mb-8 relative">
                <span className="text-[#dcea22] text-6xl absolute -top-4 -left-2 opacity-30 font-serif">"</span>
                <p className="text-white/80 text-lg md:text-xl relative z-10 italic pl-6 leading-relaxed">{test.quote}</p>
              </div>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                {test.photo?.url ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#dcea22]/50 shrink-0">
                    <img src={test.photo.url.startsWith('http') ? test.photo.url : `https://innogyzer-lms.vercel.app${test.photo.url}`} alt={test.clientName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-[#dcea22]/50 shrink-0 flex items-center justify-center">
                    <span className="text-white font-bold">{test.clientName.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h4 className="text-white font-bold text-lg">{test.clientName}</h4>
                  <p className="text-[#dcea22] text-sm font-medium">{test.companyRole}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { scrollYProgress } = useScroll();
  const yText = useTransform(scrollYProgress, [0.8, 1], [-100, 0]);
  
  return (
    <footer id="contacto" className="relative z-10 border-t border-white/10 pt-16 md:pt-24 pb-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
        <motion.div style={{ y: yText }} className="max-w-3xl mx-auto mb-24">
          <WordReveal text="¿Dudas?" className="text-6xl md:text-8xl font-black mb-8 justify-center tracking-tighter" />
          <p className="text-white/60 text-xl mb-16 leading-relaxed">Contáctanos para conocer más sobre Innogyzer y descubrir cómo tu equipo puede transformar su forma de trabajar con la Innovación y la Inteligencia Artificial</p>
          
          <Magnetic>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} className="btn-shine inline-flex items-center gap-4 px-10 py-6 bg-primary text-black font-black rounded-full hover:bg-white transition-colors text-xl shadow-[0_0_40px_rgba(220,234,34,0.3)] hover:scale-105 transform duration-300">
              <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
              Agendar ahora
            </button>
          </Magnetic>
          <p className="mt-10 text-white/40 text-lg">o escríbenos a <a href="mailto:info@innogyzer.com" className="text-white hover:text-primary transition-colors hover:underline">info@innogyzer.com</a></p>
        </motion.div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/assets/official/4cRD3H5ZmU3bQoa4cQR44DKeUs.png" alt="Innogyzer Logo" className="h-6 object-contain" />
            <p className="text-white/40 text-sm">2026 © The AI Sprint Agency.</p>
          </div>
          <div className="flex gap-8 text-sm text-white/60">
            <a href="https://www.linkedin.com/company/innogyzer" className="hover:text-primary transition-colors hover:scale-110 transform">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors hover:scale-110 transform">X</a>
            <a href="#" className="hover:text-primary transition-colors hover:scale-110 transform">Aviso de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const ContactModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openContactModal', handleOpen);
    return () => window.removeEventListener('openContactModal', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0c] border border-white/10 p-8 md:p-10 rounded-[30px] shadow-2xl w-full max-w-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-3xl font-bold mb-2">Agendar una llamada</h2>
            <p className="text-white/60 mb-8">Déjanos tus datos y nos pondremos en contacto contigo lo antes posible.</p>
            <form className="flex flex-col gap-4 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('¡Formulario enviado con éxito!'); setIsOpen(false); }}>
              <input required type="text" placeholder="Nombre completo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors" />
              <input required type="email" placeholder="Correo electrónico corporativo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors" />
              <input required type="text" placeholder="Empresa" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors" />
              <textarea required placeholder="¿Cómo podemos ayudarte?" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors resize-none" />
              <button type="submit" className="btn-shine w-full bg-primary text-black font-bold rounded-xl px-4 py-4 mt-4 hover:bg-white transition-colors">
                Enviar mensaje
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Clients Marquee ---
const ClientsMarquee = () => {
  const clients = [
    { name: 'Tecnológico de Monterrey', src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgc29kaXBvZGk6ZG9jbmFtZT0iTG9nbyBkZWwgSVRFU00uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjAgKDQwMzVhNGZiNDksIDIwMjAtMDUtMDEpIgogICBpZD0ic3ZnOCIKICAgdmVyc2lvbj0iMS4xIgogICB2aWV3Qm94PSIwIDAgNTg4LjU1OTAyIDU4OC41NTkwMiIKICAgaGVpZ2h0PSI1ODguNTU5MDJtbSIKICAgd2lkdGg9IjU4OC41NTkwMm1tIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjEzNTIiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAxNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE5MjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXJvdGF0aW9uPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImxheWVyMSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3k9IjM3MTguNjU0MiIKICAgICBpbmtzY2FwZTpjeD0iLTg1Ny4wMjY2NCIKICAgICBpbmtzY2FwZTp6b29tPSIwLjA4ODM4ODM0OCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBpZD0iYmFzZSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlkPSJsYXllcjEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpbmtzY2FwZTpsYWJlbD0iQ2FwYSAxIj4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDg0NyIKICAgICAgIGQ9Im0gMjU3LjMzMzE1LDU4OC4zOTQxNiB2IC00Mi44ODgzMyBjIC01MS43MjQzNywtNC4xMjEzMSAtOTQuMTc0MzksLTI5LjY4OTQzIC0xMjguNTEwOTcsLTY3LjAxMyBoIDMzMC42NDc5IGMgLTMzLjAyNDY5LDM3Ljg0NzYgLTc3LjY4NjIyLDYyLjk5MDg4IC0xMjguNTEwOTQsNjcuMDEzIHYgNDIuODg4MzMgQyA0MzEuMzMwMTYsNTY5LjY3MjA4IDUxOC4yODUxOCw1MTUuMzk4MiA1NjIuMTMyODcsNDE5LjUyMTMzIDYzNC4xOTgwNCwyNjEuOTQ2OTYgNTUyLjYzMzgxLDY5LjQ4OTU2NCAzODcuMTgyNywxNC43NjM3NzggMzYxLjI3MDI4LDYuMTkyODE0NCAzMzIuODc4NzIsMC4zNTA2MTc0NCAzMDUuNTI0NzQsMC4wMjQ5MzMyOCAyMjguODU4NTksLTAuODg3NzgyODUgMTU0LjI2NDY3LDIzLjI0MDM4OSA5Ni42OTQ0OTcsNzUuMzAyMjY5IC0yNS42OTA3MjQsMTg1Ljk3Njk5IC0zNC44Njk4NzcsMzkxLjE3ODkxIDg3LjMyOTI1NSw1MDYuNTE3NjggMTM2LjEyMTg2LDU1Mi41NzE3IDE5Mi4zNDAxLDU3Ni4yNzE0OCAyNTcuMzMzMTUsNTg4LjM5NDE2IE0gMjk0LjgxNTUxLDE0Ljc2MjcwMyBjIDYuOTk3MTMsNi4xMjQwNTkgMTMuNDgwMTcsMTIuMjQxOTM5IDE4LjYwNTg2LDIwLjEwMzkwNyAyOC4wMjIxOSw0Mi45ODYxNzUgLTE5LjU4MzEzLDgwLjA1MzcxIC00Ni43MTc3MSwxMDcuMjIwNzYgLTI3LjY2MzI1LDI3LjY5NjUxIC01NS4xNzI2Nyw1NS41NTY1NiAtODIuOTk2NTIsODMuMDkwODUgLTIzLjI0MTc5LDIzLjAwMDIyIC00Ny4zNTYzMSw0NC45MTg4MyAtNTYuMzI5MzQsNzcuNzQwNDQgLTYuMTU5MSwyMi41MjcxNCAtMC4yMDc0OCw0My40MzkxOSAyLjc4MzEyLDY1LjY3Mjc3IC04Ljk1OTcxLC02Ljg2MDc5IC0xNS40NjE0OCwtMTcuMjYyNTUgLTIxLjMzMTUyLC0yNi44MDUxOSAtNDYuNjEzMzEsLTc1Ljc3ODMzIDMyLjMyMTc1LC0xMzkuNzU0MjcgODEuNzk4NTksLTE4Ni42OTgyMSAxMS4zMzU3MiwtMTAuNzU2OTcgMjIuMTk0ODIsLTIyLjA0NzM3IDMzLjIzODcsLTMzLjEwNDQ0IDE0LjYyNjE4LC0xNC42NDM3IDMwLjE2OTMzLC0yOC43NzgxMiA0My45NDI2OCwtNDQuMjI4NjQ2IDkuODc1MzYsLTExLjA3NTkxNCAxOC4xOTM3OCwtMjQuNTc1MDEzIDIyLjQwMjUyLC0zOC44Njc1NDkgMi4yNzk2OCwtNy43NDI2OSAxLjU0NjAzLC0xNi44NDQ5MzIgNC42MDM2MiwtMjQuMTI0NjkyIE0gMzc1LjEzNDgsMzQuODY2NjEgYyA0My44MjYyMiwzMy42NTc5NjMgNy44MjMwOCw4NC42NDU0MSAtMjAuMDc5ODYsMTEyLjU4MTkzIC00MS4yMzczLDQxLjI4NjYyIC04MS44MzMzNCw4My4zOTYzNCAtMTI0LjQ5NDkyLDEyMy4xODQ2MSAtMjkuOTQ3MTMsMjcuOTI4MzYgLTY0LjIyNTk5LDY0Ljk2NjQ2IC02NC4yNTU1LDEwOC42ODAzNSAtMzQuMTMxNjIsLTI4LjMxNTY1IC0xNC45OTAxNSwtODMuNzc5NjQgNi41NTI3OSwtMTEyLjU4MTg0IDE3LjkxNTE2LC0yMy45NTE3NSA0MS41NDUxNywtNDMuNzgzNjYgNjMuMDU3MjUsLTY0LjM4NDczIDE5LjExMzM4LC0xOC4zMDY3MSAzNi44NjkzMywtMzguMDY4ODUgNTYuMjIzNTgsLTU2LjExOTQ1IDI0LjYyOTk1LC0yMi45NjkzNSA1MS4wODg0NiwtNDYuMjk5MjY0IDY5LjA0MTE4LC03NS4xNzM4NCA3LjMwMDk2LC0xMS43NDMzNiA4LjczNzM5LC0yNC4wNzUwOTUgMTMuOTU1NDgsLTM2LjE4NzAzIG0gMzguODIxMDIsNzIuMzc0MDkgYyA0LjU5ODI2LDE0LjM5Njk3IDcuOTg2MzYsMjkuMDA3MjIgNi40NjQyOCw0NC4yMjg2NCAtNC4wOTM1OSw0MC45NzI5OCAtNDQuNTIwOTksNzAuODg0OTIgLTcyLjI5MTQzLDk2LjkzNDI4IC0xOS42NjA4MSwxOC40NDMzIC0zOC4yNzc0LDM4LjEyMTA0IC01Ny4zMjkxNCw1Ny4xOTU2MSAtMzEuNjk0MDMsMzEuNzMxOTYgLTYzLjMzMTg0LDYzLjkyNjM4IC03MS42Njc2MiwxMDkuOTAxMzQgLTMuMDIxMzEsMTYuNjY2MSAtMC4xNDcyLDMwLjUxNjQgMi4wNTc1NCw0Ni45MDkxNCAtNDEuMjg1NDYsLTIzLjk1OTg2IC0zNS4zMjcxOCwtODcuNDI5MjYgLTE2LjU0OTgxLC0xMjMuMzAzOTcgMTMuODg3MjEsLTI2LjUzMDUgMzQuMjc0ODcsLTQ1LjA4OTA1IDU1LjM3MDgxLC02NS42OTI4OSAyMi44NjgyNiwtMjIuMzM0MSA0NS4yMTMwNSwtNDUuMTc3NDYgNjguMjY1OTgsLTY3LjMwNzkyIDIxLjMzNDE4LC0yMC40NzkxOCA0My4zMTc1NywtNDEuMTMzOTMgNjIuMDk4OTUsLTY0LjAxNzU2IDguODMxMTMsLTEwLjc2MDg3IDE0LjUxNjMyLC0yNC43OTc0NSAyMy41ODA0NCwtMzQuODQ2NjcgbSA2Ni45MzI2NiwyOS40ODU3NyBjIDUuMTY3MjYsMTUuOTA0NzQgOS4wOTg5NCwzMi43NTE4MSA2LjA3MDg4LDQ5LjU4OTU1IC02LjE4NzMyLDM0LjQxNzg4IC00MC4xNDIyNiw2MC44MzE3NCAtNjQuMzUwNTQsODMuMjMxNTIgLTIwLjAxNTU1LDE4LjUxOTcgLTM4LjY3OTEzLDM4LjQyNjYxIC01OC4xODMyNSw1Ny40NzU3MiAtMzkuNTU3MzYsMzguNjM1NzIgLTc3LjY0Miw3Ni44ODgwNyAtNzcuNjQyLDEzNS4zODY0NSBoIC0xLjMzODczIGMgLTEyLjA3MTk1LC0xOS41ODUyOSAtMjQuNTQ5NTcsLTM3LjUxMjU3IC0yNC4wNzU3MywtNjEuNjUyMDMgMC42NDI2MiwtMzIuNjYyMTIgMjMuNzQ3NzgsLTU4LjY0MzA2IDQ1LjQ5NDMsLTgwLjQxNTYgMzUuMjUwNzEsLTM1LjI5MzA4IDcxLjQyMTE5LC02OS43MjE2OSAxMDcuMDkyNDEsLTEwNC41NjAzOCAxNi4xNTYyMSwtMTUuNzc4OTQgMzIuMTQ5MDcsLTMxLjg5NDE3IDQ2LjI1MTgxLC00OS41Njk1MiA3LjMxNTc4LC05LjE3MDE3IDEyLjQ5MjM5LC0yMS4zNzQ0NyAyMC42ODA4NSwtMjkuNDg1NzEgbSAtMS4zMzg1OCwxMDcuMjIwNzQgYyAxLjY4NCwyMS4zNTk3NiAzLjk0ODk3LDM5Ljk5MzM5IC01LjE3Mzk5LDYwLjMxMTcxIC05LjQwOTMyLDIwLjk1NzY2IC0yOC40NjM3NSwzNi4zNTg2MyAtNDQuMzU2MjMsNTIuMjcwMTYgLTMxLjg0NTM0LDMxLjg4MzUgLTYzLjY1NTgxLDYxLjI2MDY1IC03Ni4zMDMzOCwxMDUuODgwNjMgLTIxLjY3NDE1LC0xNy45ODA5NyAtMTQuNzg5NDQsLTU0LjAzMTI2IC01LjMzNDUyLC03Ni4zOTQ4NyAxMi42NDQ5NCwtMjkuOTA5MjMgNDAuMTAwNzUsLTUwLjYwMjg2IDYyLjg5NjY3LC03Mi40MjYzNCAyMy4zMzY4MSwtMjIuMzQyMTQgNDQuNjc4OTcsLTQ4LjA1MzcxIDY4LjI3MTQ1LC02OS42NDEyOSBNIDI4OS40NjA4LDY3Mi44MzA1OCBjIDEzLjY3MDQxLDQuMDE5NDcgMTIuMDQ3OTYsMTMuMDE3OTQgMTIuMDQ3OTYsMjUuNDY0OSAwLDI1LjAzNjEzIDQuMzExNzksNTQuNDc3NTggLTAuMzA1MTEsNzkuMDU1MjkgLTEuNDk5MjUsNy45NzQ1OSAtMTAuNDMyMTgsNi44OTgzIC0xMS43NDI3LDE0Ljc2MzAxIGggNDUuNTE0MjkgbCAtMTEuNzQyNjksLTE0Ljc2MzAxIC0wLjMwNTA4LC0zNy41MDcxNCB2IC03Ny43MzUxNCBjIC04LjMwNjM5LDAuNjc5NTQgLTMwLjYzMzc3LDIuMTY5ODQgLTMzLjQ2NjQyLDEwLjcyMjA5IG0gMTE3LjgwMTcsLTUuMzYxMDUgYyAtMTcuMjM1MjEsMCAtMjAuNDEwNDQsMi4zMTMyOCAtMjUuODgwMiwxOC43NjM2MSAtMS4wMzQ3NiwzLjEwOTQ0IC00Ljg5MjgyLDEwLjYwMTUyIC0xLjQyNDMzLDEzLjI4NzM3IDMuNDM3NjMsMi42NjA0MSA3LjExMzYyLC0zLjEwNjcgOC43NjU0NCwtNS4yNzEyMiA2LjUwNTkyLC04LjUyMDA2IDEzLjkyODc0LC0xNy4wNjU1MiAxOC41MzkwOSwtMjYuNzc5NzYgbSAtNTU0LjIwMzEzLDQuMDIwNzcgLTEuMzM4ODIsMzIuMTY2MjkgaCA2LjY5MzMzIGMgMy4xMDU2OSwtMjEuMDU4MTkgMTYuNDYwMDgsLTIyLjc4NDQ0IDM0LjgwNTAzLC0yMi43ODQ0NCB2IDY0LjMzMjUxIGwgLTAuNTgxMDIsMzAuODIwNiAtMTYuODIxNiwxNi4wODg1MiBoIDU3LjU2MjI2OSBsIC0xNi44MjE1MzgsLTE0Ljc2ODM5IC0wLjU4MDk3NSwtMzAuODAwNTMgdiAtNjUuNjcyNzEgYyAxOC45OTI4MzUsMCAzMC40NTg0MjEsMS45Nzk1NCAzNC44MDUwMzIsMjIuNzg0NDQgaCA2LjY5MzI3OCBMIC00My44NjQwNTEsNjcxLjQ5MDMgSCAtMTQ2Ljk0MDY1IG0gNjg4LjA3NTQsMS4wMTU5IGMgLTE0LjU0ODUzLDUuMjI4MzggLTYuMTc2NTgsMjcuNjQ1NiA3Ljk2NjMxLDIxLjc1MTA4IDEzLjI5MDE2LC01LjUzOTI0IDUuNjE3LC0yNi42MzM2MiAtNy45NjYzMSwtMjEuNzUxMDggTSAxMS4wMjA1NTcsNzcwLjY2OTU4IGMgLTUuODk2Nzc3MSwyLjIyMDg2IC0xMS4xMzM1OTI2MSw2LjI4NDUyIC0xNy40MDI1MTk2LDcuNTMyMjkgLTIwLjE5NjI5MzQsNC4wMTgxIC0yNi4xNDc5NDE0LC0xNS42Mjg3OCAtMzAuNzg5MDY4NCwtMzAuMzE2NzEgOC45NDQ4OTgsLTEuNjYxOTYgMTcuODA2NzkzLC0wLjY2MzQyIDI2Ljc3MzExLC0xLjcyMzU4IDYuMDczNDc3LC0wLjcxNzA1IDE3LjM4NjQ0NTcsMC4zMzEzIDIxLjk0OTkyLC00LjQyNjkxIDEwLjQ0MTUxNCwtMTAuODg2ODkgLTkuNjkxODUzLC0yOS43MTg5NCAtMTkuMjcyNjE0OSwtMzIuMDA0MDYgLTM4LjExNjg2MzEsLTkuMDkwOTcgLTYzLjAwNjQ4MTEsNDMuMzA2NTMgLTQwLjc4NjE0NTEsNzEuNjQwOTUgMTAuODkzOTc1LDEzLjg4OTE2IDMxLjIyODE1MSwxNi43NjI2NyA0Ni4xNDA3NjgsOC4yMjI1MSA3LjI5ODM0MjEsLTQuMTgwMjQgMTQuODYxNzQ5LC05Ljg0OTYgMTMuMzg2NTUsLTE4LjkyNDQ5IG0gODAuMzE5MzA3LDAgYyAtOS4wMzQ1NzksMy43NDg2NyAtMTYuMzc4NDQ1LDkuOTc1NTUgLTI2Ljc3MzA5NCw2Ljk4NDEyIC0yMC42MzQwMzUsLTUuOTM4NzMgLTI4Ljg1NjA1MiwtMzcuODA3MzkgLTE0LjIwMzEzMSwtNTMuNjA2NDEgMTMuODYzMSwtMTQuOTQ2NTggMjUuOTAwMjk3LDEwLjM3NDk4IDM2LjY1NTA0NSwyLjg2NjggNy4xMzM2OTksLTQuOTgxNyAyLjgyNzI0MiwtMTMuNzAyODIgLTMuNzMwODIyLC0xNi4zNTc4NyAtNDAuOTI0MDM0LC0xNi41NjE1NCAtODIuNzE5NTIwODEsNDYuMzM1NSAtNDYuNzc5MzE0LDc1LjQ4NzUgMTIuNzk2MjA0LDEwLjM3NzY0IDMwLjQ0MjM2NCwxMS4wMTQzIDQ0LjEyMjA4LDIuMDk0ODQgNi4yOTk3MTEsLTQuMTA3ODcgMTIuNDQxNDYzLC05LjU4OTU5IDEwLjcwOTIzNiwtMTcuNDY4OTggbSA4LjAzMTk0LC01NC45NTA2NiB2IDQuMDIwNzYgbCA5LjEzMDk5Niw1LjY2NjY2IDEuNTc4MjcsMTQuNDM3MjkgLTAuOTkzMjYsNDAuMDYxNzMgLTExLjA1NDY2MSwxMi4yMDg0MiBoIDQyLjgzNzAwMSBjIC0xLjAzNDg3LC01Ljk4ODI4IC02LjQ2NTc2LC02LjgyODYzIC04LjU2MzQ1LC0xMi4xMzYwNSAtMy45NjM2NywtMTAuMDMzMjQgLTAuODA4NTQsLTI2LjcxMjc2IC0wLjgwNzIsLTM3LjQ1MzY2IDAsLTQuMDM4MTcgLTAuODE1MjIsLTkuMzQ1NjIgMS4zNzYxOSwtMTIuOTYxNiA3LjIwNDY4LC0xMS44OTM0NCAyNC4zNTY4OCwtNy40MzE3NiAyNy4zNjA4MSw0LjkyMDA1IDIuNzIwMTMsMTEuMTg1ODggMy4yODkwMiwzMy4xMDk4MSAwLjEzMjQ1LDQ0LjIwMzE4IC0xLjY4Njc1LDUuOTMxOTggLTcuNzQxNCw3LjExMDA3IC04Ljc4OTY5LDEzLjQyODA4IGggNDEuNDk4MzYgYyAtMS4yNDA4NywtNy4xNjEwNiAtOS4zMzcxLC03LjMzNTI4IC0xMC41MTExNiwtMTQuNzQ5NTcgLTMuMzQ1MjIsLTIxLjEzNzI1IDkuOTg5MTIsLTY3Ljg4OTU4IC0yNC4yOTM4NiwtNjguMzIxMSAtMy43MzIxMywtMC4wNTA1IC03LjI3NDIsMC4zMjE2NCAtMTAuNzA5MjksMS44NzM2NSAtNS42OTg1NywyLjU3NDY3IC0xMC44OTY1NCw2LjY3MzE4IC0xNi4wNjM4MywxMC4xNjMyMSB2IC0xMi4wNjIzOSBsIC0zMi4xMjc2OTYsNi43MDEzNCBNIDIzMy4yMzczNCw3MDkuNjQ0OSBjIC01Mi44MDQ2NCw5Ljk3Mjg2IC0zNy43MDcyMyw5NC4wMjcyNSAxNi4wNjM4Niw4NC4zMjM3OCA1NC44MjMyOCwtOS44OTI0NyA0MC4wMTY0NSwtOTQuOTE3MjIgLTE2LjA2Mzg2LC04NC4zMjM3OCBtIDE0MS44OTc0NiwwIGMgLTUyLjk1MDQ5LDEwLjAwMDk3IC0zOC4yMzIwMyw5NC4xMjI0MiAxNi4wNjM4Nyw4NC4zMjM3OCA1NC42MDM2NSwtOS44NTM2IDM5LjcyMTksLTk0Ljg2MDk0IC0xNi4wNjM4NywtODQuMzIzNzggbSA4MC4zMTkzMSw1NC4zMjM0MSBjIC00LjQyNjk2LDMuMjcyOSAtMTMuMDg4MDYsNi45NjUzMyAtMTUuOTcyOTEsMTEuNTc1NzkgLTQuOTE4MjMsNy44NTkzIDcuMTYxODgsMTYuNDQ2MzQgMTMuMjk1NiwxNy45MDk5NCAtNC45MDIxNyw2LjAyODUxIC0xMy44MDY5Niw5Ljg1NjI1IC0xNi41OTUzNiwxNy40MjQ3MSAtNS4yMzgxNiwxNC4yMjAxNCAxMC4wNjI3NCwyNC4zNzUzMyAyMS45NDk5MywyNi40MjA1NiAyMy42MjMzLDQuMDY0OTkgNTguODcwMDYsLTguMzYwNTYgNTguNjU0NTIsLTM3LjE0Mzk4IC0wLjE2MzM3LC0yMi4wMjMyIC0yMi42OTQxOCwtMjEuMzY3NzYgLTM4LjU3NDYyLC0yMS40NDU0OSAtNC41NjM1NCwtMC4wMjAyIC0xOC42MTgwMywtMC4xNjExMiAtMTcuMzIyMjEsLTcuOTAwODggMS4wOTIzNCwtNi41MjU3NiAxNy43Nzk5NSwtNC4xMTg2IDIyLjY3NjgxLC01LjU1ODA1IDIwLjY1ODEzLC02LjA3NTQxIDI2LjI4MDQ4LC0yNC4zMDAyNiAxOC43NDExOSwtNDIuODMwNjggOC41NDMyOSwwLjk3OTY5IDE3LjAxNTYsLTEuOTA5ODggMTYuMDYzODYsLTEyLjA2MjM4IC0yMC43MTcwOSw0Ljk0MDI2IC00Mi4wNjQ2LC02Ljk3NzQxIC02MS41NzgxNywxLjU3MzQ5IC0yMy4xMzg3LDEwLjEzOTA2IC0yNC4xNDgwNiw0MS4xNjM0MSAtMS4zMzg2NCw1Mi4wMzY5NyBtIDY5LjYxMDA1LC00OS41ODk2OCB2IDYuNzAxMzQgYyAxNS4xNjAzLDMuMDk3MjkgMTQuNjE5NDksNDUuMjg0NzIgOS43MTU5OSw1Ny42MDU3MyAtMi41NDIxOSw2LjM4NjMzIC05LjgzOTEzLDYuNDEzMTQgLTExLjA1NDY0LDEzLjQyODA4IDkuNjYzNzksMCA0Mi4wODQ2NCw0Ljk4MzA1IDQ1LjUxNDIyLC01LjM2MTA5IGwgLTExLjYyMjE1LC02Ljc4MDMyIC0xLjc2NDMyLC0yMi43MDU0MSB2IC00OC4yNDkzOCBsIC0zMC43ODkxLDUuMzYxMDUgbSA4OS42ODk5MSwtNC43MzM3MyBjIC0yMS40NTYwMiw0LjA1MDI3IC00MC41NDkyLDIzLjczMTkyIC00MC4wODc0MSw0Ni4yODE4NyAwLjUxODE0LDI1LjI1NDQ4IDI2LjI0NzA0LDQ2LjIyMTUxIDUwLjc5NjY0LDM2LjI3OTQ1IDQuNzM3NDYsLTEuOTE3ODkgMjEuODI5NDcsLTExLjM1NDczIDE4LjM5ODQ5LC0xOC4yODUyIC0yLjI3ODQsLTQuNjAyNDUgLTE0LjcxODUxLDMuOTg1OTggLTE4LjM5ODQ5LDQuNDk5MyAtMTAuMjQ0NywxLjQyODcgLTIwLjMzMTUyLC02LjA2MTk5IC0yNS40Mjc3NywtMTQuNDUyMDEgLTcuNzI4MDksLTEyLjcyNDUgLTYuMzE1NzYsLTQ0LjE0NjgzIDEzLjM3OTg4LC00NS4xODk1NyA4LjI4NjI1LC0wLjQzODIxIDE3LjkzMjY0LDEyLjMzNzEgMjUuMTI5MjEsOC42ODM1MyA2Ljc1MDg2LC0zLjQyNzAxIDMuOTQ2MzgsLTEyLjQ0OTY5IC0xLjExMjQ1LC0xNS43NTIwOSAtNi4wMjM5MiwtMy45MzIyOCAtMTUuODgwNDEsLTMuMzQ5MjcgLTIyLjY3ODEsLTIuMDY1MjggbSA2OS42MTAwNSwwIGMgLTUyLjg1MTUsOS45ODIyIC0zNy45NjI5LDk0LjA3MjgxIDE2LjA2Mzg5LDg0LjMyMzc4IDU0LjcyOTUyLC05Ljg3NTA0IDM5Ljg5MDU2LC05NC44OTMxNSAtMTYuMDYzODksLTg0LjMyMzc4IG0gLTcyMC4xOTY1MTMsMjguODU4MzkgYyAxLjc3NjQsLTguNTk1MDIgNS42MTE2NDYsLTIzLjYwMDU1IDE3LjM4MjQ0MSwtMjIuMTExNTUgNi45NjIzNDgsMC44ODA1NiAxNS44Mzc2MzMyLDEzLjc3NjUxIDkuOTAyMDMzOCwxOS45NjMxOSAtNC44NDMyNTE4LDUuMDQ3NCAtMjAuNzU4NTI4OCwyLjE0ODM2IC0yNy4yODQ0NzQ4LDIuMTQ4MzYgTSAyMzcuMjU4NjgsNzE2LjMwNiBjIDguNTY0NjMsLTIuMjU4NDIgMTUuNzM1ODgsNC4yNTUyNyAxOS4xMzA2OSwxMS40ODA2MyA2LjIxMjcyLDEzLjIyNDMxIDEwLjgzMTA5LDUzLjg3NzExIC04LjQ0Njk5LDU4Ljg1NDg0IC04LjkyNDgyLDIuMzAzOTMgLTE2LjEyOTQsLTQuMzc4NjUgLTE5LjU4NzE0LC0xMS45NTEwOCAtNi4xOTEzNCwtMTMuNTU2NzcgLTEwLjk2NjIzLC01My4xNDkzOSA4LjkwMzQ0LC01OC4zODQzOSBtIDE0MS44OTM0LDAgYyA4LjQyMDE1LC0yLjIwMDc1IDE1LjQ3NzU0LDQuMzgzOTYgMTguODQ2OTMsMTEuNDc1MjUgNi4wNzg4LDEyLjc5NDE2IDEwLjgyMDM3LDUzLjgxOTUyIC04LjE0NDM3LDU4LjU0Mzk0IC05LjgyMzA4LDIuNDQ3MjYgLTE2LjU5Mzk5LC00LjgzODM0IC0yMC4zNDM1NiwtMTIuOTc1MDcgLTYuMzQzOTcsLTEzLjc3MjU3IC0xMC4yNDc0NCwtNTEuODQ5MzIgOS42NDEsLTU3LjA0NDEyIG0gODkuNzQ2MTQsMC4yMjYzOCBjIDE5LjQ4NjgsLTcuMzQ1OTIgMjQuMTA2NDksMzYuNTQ2MjQgNy45NTQyNiw0Mi4zOTkxNiAtMTguNjg0OTIsNi43NzIyOSAtMjMuOTIwNDQsLTM2LjM4MDA4IC03Ljk1NDI2LC00Mi4zOTkxNiBNIDY4OC4zODU0Nyw3MTYuMzA2IGMgMjUuMjI2OTMsLTYuNjQxMDYgMjQuMjQ0MzcsMzguODkwMyAyMi41MDU0NSw1My4wMjMzMyAtMC44MDU4Nyw2LjU0NDQ4IC0zLjYxOTcsMTQuNTY0NjIgLTEwLjUxNjQ1LDE2LjczNDQ3IC0yOS4zODIxMyw5LjI0NzgxIC0zNi4zMjQ0MSwtNjMuMzUyNzMgLTExLjk4OSwtNjkuNzU3OCBtIC0yMjMuNTU1NDYsODAuMzU2NjEgYyA4LjA4ODE3LC0xLjg4MzEgMjMuNzA0OTIsLTIuMzIxMzEgMzAuNDgyNTMsMy4wOTQ2OCAxMS43Mjc5Nyw5LjM2OTczIDAuNzAxNDUsMjQuNDgxMjEgLTEwLjQwODEsMjcuMzMxODcgLTguODU3ODIsMi4yNzQ0NSAtMTkuNzgxMjcsMS4wMjggLTI2LjQ3MTg4LC01Ljc3NjQ5IC04LjA2ODAzLC04LjIwMzcgLTUuMzcwNjMsLTIxLjkwOTI0IDYuMzk3NDUsLTI0LjY1MDA2IG0gLTYyNi40OTU5MSwzNi45OTkyMyB2IDUuMzYxIGMgMTguNzI2MzEsNC4wOTE4NyA5Ljk2ODg4LDIxLjMwMjExIDEzLjM4NjQ1LDM0Ljg0Njc5IC0xOC4yNjQ1OCwwLjk1ODMzIC0zNC40ODk5MiwxLjQ5NDM3IC00Ny45NDM2NSwxNi4xMzY3MiAtMTkuMzgzMzksMjEuMDk3MDcgLTEzLjM1MzU4LDYxLjkyMTQyIDE3LjE1NDU5LDY4LjkzMDk1IDEyLjQxNzQsMi44NTIwOCAxOS45OTgyOCwtNC41ODM3IDMwLjc4OTA2LC04LjY3MjgyIGwgLTEuMzM4NTgsOS4zODE4IGMgNS41NDE5NywtMC40NTI4NiAzMS45NTc3MiwtMy4xNTYzIDMzLjc5ODM2LC04LjQ3NzE0IDEuNTY3NTYsLTQuNTI4NyAtNy45NDg4OSwtNS40NjI4OSAtMTAuMDQ3OSwtOC4wMzA4MyAtMi44Njc0OSwtMy41MDg4IC0yLjMyNTM1LC04Ljc0OTIgLTIuMzMyMSwtMTIuOTc3NzIgLTAuMDU3NSwtMzQuNDAwNDcgMCwtNjguNzk5NiAwLC0xMDMuMjAwMDcgbCAtMzMuNDY2MjMsNi43MDEzMiBtIDE3OC4wNDEwNzksNC4wMjA3OSBjIDEuNzEzNDc4LDEwLjI3NzEgMTYuMjU2NjMzLDYuNjgxMTYgMTcuMDM0Mzg5LDIwLjEwMzg4IDAuODA0NTI2LDEzLjg1MDI3IC0yLjEwNzA1MywyOS4wNzU2MSAtMy40MjAyNzMsNDIuODg4MzYgLTEuMjExNDc0LDEyLjc0NzIyIC0wLjIyNzU2NCwyNi40MTc4NSAtMy44NzI3MTgsMzguODY2MiAtMi44MDg1LDkuNTkyMjQgLTE0LjMxNjkxOCw4Ljk3OTc3IC0xNS4wOTYwMiwxOC43NjQ5OCBoIDQ0LjE3NTYyNCB2IC02LjcwMTMzIGMgLTUuNDQ0MzEzLC0xLjA2MTQ3IC0xMS41NDk5MTgsLTEuNzQ5MDMgLTE0LjgwODIxLC02Ljg0NzM1IC01LjI3NTYzNywtOC4yNTczNSAtMi43MTYxMjgsLTIyLjg2NDgzIC0xLjYzNzE2OCwtMzIuMDIwMTYgMS45NTU3NzUsLTE2LjYwMzE4IDEuNzIwMTczLC0zNC4yMDA3NyAxLjcyMDE3MywtNTAuOTI5OTMgaCAxLjMzODY1MiBjIDguNDk3Nzg0LDI0Ljk5NDU0IDE5LjkyMTg2Niw0OS4xOTU2NCAyOS43MTgxMzgsNzMuNzE0MzEgMS41NzQyNjcsMy45NDE3MSA2LjM1ODYxNiwyMi44NzY5NCAxMi42NTU2NSwxOS44NjgwNSA2LjQwMTQ0OCwtMy4wNTg0NiAxMC4wNjEzMzEsLTE5LjA0NjQ1IDEyLjcxMTg3MiwtMjUuMjI5MDUgbCAyMC4yNTUxODIsLTQ2LjkwOTEzIGMgMy4yODUxMSwtNy42MjQ3MiA1Ljc0MDExLC0xNi44NTc3NSAxMS42NzE3MSwtMjIuNzg0NDIgLTUuMjYzNTUsMTcuODY4MzUgMCw0NC4wODc4OCAwLDYyLjk5MjI0IDAsMTMuNzMwOTggMC45NDY0OSwyNC44NTExIC0xNC43MjUxMywyOC4xNDU0NCB2IDYuNzAxMzMgaCA1Mi4yMDc0NyB2IC02LjcwMTMzIGMgLTYuMzU4NTMsLTEuMjU3MSAtMTIuMjY2MDMsLTIuNjk1MjQgLTE0Ljg2NzA1LC05LjM4ODQ4IC0zLjE5Njc0LC04LjIxOTgxIC0xLjAwMzk5LC0xOS40NTc4OSAtMS4yMTY4MSwtMjguMTM4NzkgLTAuNDY0NTksLTE5LjAwMjE5IC01LjcxMzM4LC00Mi45ODQ4MiAtMC44OTI5LC02MS42MzE4MyAxLjc4NTgxLC02LjkwNjM5IDguMTg3MjIsLTcuOTE0MjcgMTQuMjk5NTEsLTguMDYxNjkgdiAtNi43MDEzIGwgLTM0LjI4MjkyLDEuMzc3NzggLTEyLjU3MDA4LDI0LjA4NzEzIC0yNi43NzMwNjEsNTcuNjMxMjQgLTI2LjIwNTUxMywtNTguOTcxNSAtMTEuNzk4OTA1LC0yMi43NDY4NyAtMzUuNjIxNjEyLC0xLjM3Nzc4IG0gMzQwLjAxODQ0MSw0NS41Njg4MyAxMy4zODY1LDEuMzQwMjYgYyAwLDIxLjAwMDU0IC0xMC43OTM1Miw4MC4wODMyNiAyNC4wOTU4Nyw3NC43NjkxNSA2LjYyODk5LC0xLjAwOTIyIDEyLjYxOTQxLC01LjIwNDI3IDE4Ljc0MTExLC03Ljc1NjE1IGwgLTEuMzM4NjUsLTYuNzAxMjUgYyAtMzAuNjQzMTMsNi45OTIxMyAtMjEuNDE4NDQsLTQwLjY1NDE1IC0yMS40MTg0NCwtNjAuMzExNzUgMi4yMjIxNCwwIDI4LjMyNTk0LC0xLjY1NTE5IDE4LjEwMTI2LC03LjIzMzM5IC01LjAxOTk1LC0yLjczOTQ5IC0xMi45NDg3NiwxLjc1MTc0IC0xNi43MjUxOCwtMy45MTQ5MiAtMy42NDkxNCwtNS40NzQ5NCAtMS4zNzYwOCwtMTcuMzI2ODMgLTEuMzc2MDgsLTIzLjY5ODQzIC02LjU3OTQ2LDEuNTYxMzggLTE2LjUyNTcxLDcuMDEzNTggLTE5LjI3MjcxLDEzLjYzNTc4IC0xLjMyNzkxLDMuMjAzMjUgLTAuMjE4MDIsNy4wNjQ1IC0yLjE4MTkyLDEwLjA2NDAyIC0yLjgwMTc4LDQuMjc5NDMgLTguODAyOTksNS4wNTgxNyAtMTIuMDExNzYsOS44MDY2OCBtIC00NDMuMDk0ODksMjkuNDg1NzUgYyAxMS41ODQ3MjEsMCAyMy4zMTAwMDEsLTAuOTIwNzUgMzQuODA1MDMxLC0yLjI5NzIzIDMuOTQzNjgxLC0wLjQ3MzEzIDkuNDg0Mzc5LDAuMzE2MSAxMi41NzkzNDUsLTIuNzE4MDMgNC4wMzYwNDYsLTMuOTU5MTQgMS42MzA0NzksLTEyLjA4NTE1IC0wLjQyNDM0MSwtMTYuNDI4OTQgLTUuNzg4MzQzLC0xMi4yNDQ2IC0xOC45NDU5ODYsLTE5LjIyMDY3IC0zMi4yMzQ4MTMsLTE2Ljk4NjQgLTM5LjQyNjA1Miw2LjYyNjIzIC01MS41MzY5MTIsNzQuNjMyMzcgLTguMDMxOTMxLDg0LjYzMDY5IDExLjc5MDg3NiwyLjcxMDAzIDI0LjE4ODE1NCwtMC41MjEzMyAzMy4yMzc0NjUsLTguNDMwMjMgMi4zMTg1NTgsLTIuMDI2NDYgOS4wNTczNDcsLTcuNjk3MDkgNi42ODc5MjQsLTExLjQxOTAxIC0xLjkyMDk3MiwtMy4wMTU2IC0xNy4xNDk1MTMsNC43MzM4MSAtMjEuMTg0MjIsNC44Mzk2OCAtMTcuMTEyMDIyLDAuNDQzNzQgLTI1LjMwOTk1MywtMTYuMzAxNjIgLTI1LjQzNDQ0NSwtMzEuMTkwNTMgTSAyMDcuODAyODgsODc0LjQ5MTU0IGMgLTU1Ljc3MzY5LDEwLjA2OTM2IC00MC45MTczMiw5NS4yOTExOCAxNi4wNjM4Myw4NC41Mjc1NCA1MS43NTM3MywtOS43NzQ1NCAzNy4wMDU3NSwtOTQuMTA2NDEgLTE2LjA2MzgzLC04NC41Mjc1NCBtIDU2LjIyMzUzLDYuMDc5NDIgdiA1LjM2MTAzIGMgMTUuNjU4MjYsNC4xMjkzMyAxMy45ODQ4Niw0NC4wMzU2IDEwLjEyODI4LDU3LjYwNzA2IC0xLjE4NDczLDQuMTcyMjUgLTEzLjI5NDI1LDkuNDAxOTQgLTExLjIzMTI5LDEyLjY5NDk3IDEuOTgzODUsMy4xNjcwNCA4LjcxODY1LDIuMDcwNzEgMTEuODEyMjUsMi4wNzIwMyA4LjYyMjI2LDAuMDA0IDI4Ljk2MzA1LDQuMjU0IDMwLjc4OTA5LC02LjcwMTMzIC0xMS43NzYxOCwtMi40MDcxIC04Ljg3NjY3LC0xMi4wNTk2NSAtOS40OTEwNiwtMjEuNDQ1NDUgLTAuOTA2MjQsLTEzLjgzNjg2IC03LjEzNzcyLC00Mi4xNjcyOCAxNC44NDU2NywtNDIuNDkyOTggMTkuNDYwMDMsLTAuMjg4MjUgMTcuNjQyMTQsNDMuNDE2MzggMTMuOTU4MTIsNTUuODc2ODEgLTEuMTY1OTQsMy45NDcwMiAtOS4zNzg1Nyw4LjI5MjE4IC04LjcwOTMzLDExLjgzNDUgMC42MTMxMSwzLjIzOTM4IDUuNzgzMDUsMi44Nzc1NSA4LjEzOTA1LDIuOTIxNzUgNi45MzI5MiwwLjEzMTIgMjUuNzg5MjIsMy4yNTE0NyAzMS4yNDAyNCwtMS4zNDQyNyAxLjQzNDk2LC0xLjIxMTU4IDEuMTk2ODEsLTIuODc4ODcgMTBlLTQsLTQuMTQ0MDkgLTguMjk1NjksLTguNzgxMzggLTkuODI0MzcsLTExLjAzMzA0IC05LjgyNDM3LC0yMy45OTA2NSAwLC0xOS4zMzMyOSA0LjA5ODk4LC02MS4zNDkwOCAtMjguMTExNzMsLTU0LjQyNzk5IC04LjQ2NDM5LDEuODE4NzYgLTE0Ljk2MjIxLDguMjU3MzcgLTIyLjc1NzE0LDExLjUzOTY0IHYgLTEyLjA2MjM2IGwgLTMwLjc4OTEsNi43MDEzMyBtIDE3Mi42ODY1MSwzMi4xNjYyNSBjIDExLjQ5MzYyLDAgMjMuNDE1NjksLTAuNjA5ODMgMzQuODA1MDUsLTIuMTEyMjcgMy44Mjk4NywtMC41MDUwMyA5LjYyMjIzLDAuMjQyNjIgMTIuNTc5MjksLTIuNzE2NyAxNS44MjI5MywtMTUuODQzMjMgLTE4LjExNzMsLTM1LjU2NjQ5IC0zMS4zMjA0NywtMzMuNjM1MTkgLTM5LjEzNTU3LDUuNzI0MjkgLTUyLjczMDk5LDcyLjM1OTMzIC0xMC43MDkyNSw4NC4zMTU4IDEyLjIyMTkzLDMuNDc3OTggMjQuOTg5OTgsLTAuMDE1MSAzNC43OTk2MywtNy42OTMwOSAyLjY4Njc0LC0yLjEwMjg4IDguNzc4OTYsLTYuNzM0OCA3LjQyMDE5LC0xMC44NjgyIC0xLjI5MTgxLC0zLjkyNTU4IC0xOS4wMTAyMSwzLjk1NzgxIC0yMy40Nzg2NSwzLjY2Mjk0IC0xNS43NDM5MSwtMS4wMzczNiAtMjMuNzk1OTEsLTE2Ljg3Mzg0IC0yNC4wOTU3OSwtMzAuOTUzMjkgbSA1Ni4yMjM0NywtMzAuODI2MDEgdiAyLjY4MDUyIGMgMTUuMDA2MzgsOC4zOTI3MyAxNC40NjI5MSw0Mi43ODI0NiAxMC4yODM2LDU4Ljk1MTM4IC0xLjAzMzQ0LDMuOTk1MzIgLTEyLjA5NjEzLDkuNDE5MzUgLTEwLjA0NzkzLDEyLjY5MDkyIDEuOTgyNTYsMy4xNjcwNCA4LjcxODY2LDIuMDcwNzEgMTEuODEyMjgsMi4wNzIwMyBoIDM0LjgwNTA1IHYgLTYuNzAxMzMgYyAtNC41MDU5MiwtMC4yMDkxOSAtOS41MTkxNiwtMC41NDQxMyAtMTIuNTc5MzgsLTQuMzk0NjYgLTcuMDgxNDcsLTguOTA4NzIgLTQuMjA4NzQsLTQ0LjY3NDkzIDQuNjA2MzIsLTUxLjQ0OTk0IDguNDY1NywtNi41MDQyNiAxOS42MDQ2Miw4LjAwNTM4IDI1LjM1ODE1LC01Ljg2NTAxIDMuNjkwNywtOC44OTc5MyAtNC4yMjA3NywtMTcuNDUyODYgLTEzLjM2OTEyLC0xNS40NDM4IC04LjI0NzUsMS44MTIwNCAtMTMuODgxOTEsOS43NjY0OSAtMTcuNDAyNTMsMTYuODQxNyBoIC0xLjMzODY3IHYgLTE3LjQyMzM4IGwgLTMyLjEyNzc3LDguMDQxNTcgbSA3My42MjYxMywtMS4zNDAyNCA4Ljk0NDg1LDEzLjQyODA3IDAuNDIwNDUsNDQuMjAzMTIgLTEwLjQ2ODI3LDE4LjAzMTg3IDExLjgxMjIyLDIuMDcyMDMgaCAzNC44MDUxIHYgLTYuNzAxMzMgYyAtMjAuMDUwMzgsLTAuOTMyODIgLTIxLjU3Nzg0LC00NS4wODM2NiAtNy44OTEzOCwtNTUuNjg5MTUgOC4yODA4NywtNi40MTcxNCAxOC40NDc5OSw3LjE3ODQ3IDI1LjA1NDI3LC00Ljc2MzI3IDUuMDczNDUsLTkuMTcwMDkgLTMuNDI0MjcsLTE4Ljg0NTM4IC0xMy4xNDU2MSwtMTYuNzAwOTkgLTguMzc1OTIsMS44NDgyMyAtMTMuNTAwMzIsMTAuODE1OTMgLTE4Ljc0MjUsMTYuODQxNyB2IC0xNy40MjMzOCBsIC0zMC43ODkwMyw2LjcwMTMzIG0gODcuMDEyNSwzMi4xNjYyNSBjIDEyLjAwMTA5LDAgMjQuMjM3NzUsLTAuODY3MTcgMzYuMTQzNzQsLTIuMjk3MjMgNC4xNTM4MiwtMC40OTk5NyA5LjQ1ODkzLDAuMTkzIDEyLjM3MzIsLTMuNDkwMDEgMTMuMjQzMjksLTE2Ljc0MjU3IC0xOS4xNDY4MSwtMzQuNjIyOTQgLTMyLjQ1MzAzLC0zMi42NzY5MiAtMzkuMDA5NzQsNS43MDU0NyAtNTIuNTkwNDEsNzIuMjYyODQgLTEwLjcwOTIxLDg0LjMxNTggMTIuMDg3OTcsMy40Nzc5OCAyNS4yMzM1OCwwLjIzODU5IDM0Ljc5OTYzLC03LjYxMTM0IDIuNjIzOCwtMi4xNTM4MSA4LjgwMDMyLC02LjgxMzg3IDcuNDIwMiwtMTAuOTM1MjEgLTEuMjE2ODUsLTMuNjMwNzIgLTE5LjE0NTQ1LDMuOTMzNzEgLTIzLjQ3ODY5LDMuNjQ4MiAtMTUuNTk2NjgsLTEuMDI3OTggLTIzLjQ5MDc4LC0xNy4wNjI4NSAtMjQuMDk1ODQsLTMwLjk1MzI5IG0gNTIuMjA3NTksLTM2LjE4NzA0IGMgMS4xODg3Myw2Ljg3OTU2IDguMDA1MTgsNy44MTUwNSAxMS41NzUzMSwxMy40NjE1MyA2LjAyNjY3LDkuNTI5MjcgOS41NDA2NSwyMS41NzE1MSAxMy40MzIwNywzMi4xMDcyOSA0LjMyNTIzLDExLjcwODU1IDE1LjYyNDgyLDMwLjQ4NDI2IDEwLjY2Mzc3LDQyLjg4ODM3IC0zLjcxMDczLDkuMjc0NTcgLTIxLjY3MjgyLDE5LjgwMjM2IC0yMS42NzI4MiwyOC4xOTc3OSAwLDkuNjg4MDUgMTQuMDMwNDUsMTQuMjUzMTUgMTguNTk5MjcsNS4yMjk2MSAxMy41OTI3MSwtMjYuODQ0MDQgMjEuOTg3MzgsLTU3Ljg5Mzg2IDMzLjk1OTAyLC04NS42OTc1NSA1LjI1NDE5LC0xMi4yMDAzOSA4LjgwMDI3LC0yNy4wNzk5OCAyMy4xMzMyOCwtMzAuODI2MDEgdiAtNS4zNjEwMyBoIC0zMy40NjYzNyBjIDAuOTk1OTYsNS43NjQ0NSA2Ljk4NTA4LDYuODM2NjYgOC4xMjcsMTIuMTM2MDUgMi40NTkwOCwxMS40MTA5NiAtOS45MjM0OCwzMS44ODQ4IC0xMy40ODE2Miw0Mi44MTQ2IGggLTEuMzM4NjMgYyAtMy42OTQ3MSwtMTEuMzY2NzMgLTIyLjA3NzExLC00NC4xNzQ5NCAtNi42OTMzMSwtNDkuNTg5NjIgdiAtNS4zNjEwMyBoIC00Mi44MzY5NyBtIC00OTMuOTYzNzcsNC43Mjk3NSBjIDIzLjgyMjc1LC0xLjg3NSAyMi40MTU4MiwzOS44MTY0NiAyMC4wNTk3NSw1NC4yNDE2NyAtMS4yMTQxNSw3LjQzNTc5IC00LjkzMjkxLDE1Ljk1MDQ2IC0xMy4zNjY0MiwxNy4wNjQyMyAtMjQuMTY0MDgsMy4xODg0NyAtMjUuNDQ1MjIsLTQxLjE1NTM3IC0yMS4xODk1OSwtNTUuOTMxNzQgMS45NDY0LC02Ljc2Mjk3IDYuNjkwNTMsLTE0Ljc1ODk0IDE0LjQ5NjI2LC0xNS4zNzQxNiBtIC0zNzguODM5MTQsMS4xNjQ3NCBjIDI0LjQ1NDU3LC01LjI5NDA3IDE3LjQ3MzYxLDMwLjIyNjg1IDE3Ljc5NjE5LDQzLjY5NTEyIDAuMTgwNzYsNy41NTUxIDIuNDAyODksMTcuMzE4ODkgLTcuMTEyMywxOS41NzU5MSAtMzIuNzk4MSw3Ljc3NzQ4IC0zOS4xNjc2NiwtNTcuMTAzMTggLTEwLjY4Mzg5LC02My4yNzEwMyBtIDgwLjMxOTM2NiwyMC45MTA2OCBjIDEuODk1NTM2LC05LjA3MzUxIDcuNDY4MzUyLC0yNS4zNTM2OCAyMC4wMjIyNjIsLTIwLjQ0NDMgNC45ODkxNjksMS45NTE0MSAxMi45MTkzNjUsMTQuMzk3MDYgNy4yNjIyMDUsMTkuMDY2NTQgLTMuNzA4MDY5LDMuMDYxMTUgLTEyLjA4NDAzOCwxLjIwNzU4IC0xNi41NzUyMjIsMS40OTcwNyAtMy44NTM5OTYsMC4yNDgyMSAtNi45Mjg4ODMsMC43MDA5NyAtMTAuNzA5MjQ1LC0wLjExOTU2IG0gNTI0Ljc1MjgzNCwxLjM0MDMxIGMgMC4yMjQ2LC05LjY0NzIgNi43NjgyNSwtMjguMzk2MTEgMjAuMDIwOTEsLTIxLjQwNTMzIDQuNzQ2ODksMi41MDM2MSAxMS43MTcyNywxNC4wNzQxIDUuOTQzNjQsMTguNjg3MjYgLTQuODM1MjEsMy44NjUzIC0xOS42Njc0OCwxLjkyMTk4IC0yNS45NjQ1NSwyLjcxODA3IG0gMjQ0Ljk3MzkyLC0xLjM0MDMxIC0yOC4xMTE3MywxLjM0MDMxIGMgMC42MDkwNSwtMjYuMDYyNzIgMjguMDMxMzgsLTI5LjEyMTIxIDI4LjExMTczLC0xLjM0MDMxIHoiCiAgICAgICBzdHlsZT0iZmlsbDojMDY1OGE2O3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxLjMzOTYzIiAvPgogIDwvZz4KPC9zdmc+Cg==', isWhite: true },
    { name: 'Rotoplas', src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMi4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iQ2FwYV8xIgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgdmlld0JveD0iMCAwIDIwODUuMjQ0NiA3MjAiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InJvdG9wbGFzX2xvZ28uc3ZnIgogICB3aWR0aD0iMjA4NS4yNDQ2IgogICBoZWlnaHQ9IjcyMCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS4xIChjNjhlMjJjMzg3LCAyMDIxLTA1LTIzKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+PGRlZnMKICAgaWQ9ImRlZnM1OSIgLz48c29kaXBvZGk6bmFtZWR2aWV3CiAgIGlkPSJuYW1lZHZpZXc1NyIKICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIgogICBzaG93Z3JpZD0iZmFsc2UiCiAgIGZpdC1tYXJnaW4tdG9wPSIwIgogICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgIGZpdC1tYXJnaW4tcmlnaHQ9IjAiCiAgIGZpdC1tYXJnaW4tYm90dG9tPSIwIgogICBpbmtzY2FwZTp6b29tPSIwLjI4OCIKICAgaW5rc2NhcGU6Y3g9Ijk3Ny40MzA1NSIKICAgaW5rc2NhcGU6Y3k9Ijg1OS4zNzUiCiAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAxNyIKICAgaW5rc2NhcGU6d2luZG93LXg9IjE5MTIiCiAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iQ2FwYV8xIiAvPgo8c3R5bGUKICAgdHlwZT0idGV4dC9jc3MiCiAgIGlkPSJzdHlsZTIiPgoJLnN0MHtmaWxsOiMwMEFERUY7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQoJLnN0MntmaWxsOiM4QkQyRjQ7fQoJLnN0M3tmaWxsOiMwMDgxQzY7fQo8L3N0eWxlPgo8dGl0bGUKICAgaWQ9InRpdGxlNCI+TWVzYSBkZSB0cmFiYWpvIDE8L3RpdGxlPgo8cGF0aAogICBjbGFzcz0ic3QwIgogICBkPSJtIDEyNDAuMDI3OCw1NzYuNjY5MjkgLTAuODY4NywtNDIuOTk5MjEgYyAwLC02Ljk0OTM3IC0wLjQzNDMsLTEyLjU5NTczIC0wLjg2ODYsLTE3LjgwNzc1IGwgOC42ODY3LC0xLjczNzM1IDAuODY4NiwxMS4yOTI3MyBoIDAuNDM0NCBjIDIuNjA2LC04LjI1MjM4IDkuNTU1NCwtMTQuNzY3NDEgMTcuODA3NywtMTYuOTM5MDkgNi45NDk0LC0yLjE3MTY3IDE0LjMzMzEsMi4xNzE2OCAxNi4wNzA0LDguNjg2NzEgMCwwLjQzNDM0IDAuNDM0NCwwLjg2ODY3IDAuNDM0NCwxLjMwMzAxIDIuNjA2LC04LjY4NjcxIDkuNTU1NCwtMTUuNjM2MDggMTguNjc2NCwtMTcuODA3NzYgNy44MTgsLTEuNzM3MzQgMTUuMjAxNywzLjA0MDM1IDE2LjkzOTEsMTAuNDI0MDYgMCwwLjQzNDMzIDAuNDM0MywxLjMwMyAwLjQzNDMsMS43MzczNCAwLjg2ODcsMy40NzQ2OCAwLjg2ODcsNi45NDkzNyAxLjMwMyw5Ljk4OTcxIGwgMC44Njg3LDM2LjA0OTg1IC05Ljk4OTcsMi4xNzE2OCAtMC44Njg3LC0zNS4xODExOCBjIDAsLTIuNjA2MDEgLTAuNDM0MywtNS4yMTIwMiAtMC44Njg3LC03LjgxODA0IC0xLjMwMywtNi4wODA2OSAtNC4zNDMzLC05LjU1NTM4IC0xMC44NTgzLC04LjI1MjM3IC03LjM4MzcsMS43MzczNCAtMTMuODk4OCwxMS43MjcwNiAtMTMuNDY0NCwyNS4xOTE0NiBsIDAuODY4NiwzMS4yNzIxNSAtOS41NTU0LDIuMTcxNjggLTAuODY4NiwtMzUuNjE1NTEgYyAwLC0yLjYwNjAxIC0wLjQzNDQsLTQuNzc3NjkgLTAuODY4NywtNy4zODM3IC0wLjg2ODcsLTQuNzc3NjkgLTMuNDc0NywtOS41NTUzOCAtMTAuODU4NCwtOC4yNTIzOCAtNy4zODM3LDEuMzAzMDEgLTE0LjMzMzEsMTMuMDMwMDcgLTEzLjg5ODcsMjYuMDYwMTMgbCAwLjg2ODcsMzAuNDAzNDkgeiIKICAgaWQ9InBhdGg2IgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDAiCiAgIGQ9Im0gMTM3Ni40MDkxLDU0Ny4xMzQ0OCBjIC0wLjg2ODYsLTUuMjEyMDIgLTEuNzM3MywtMTAuNDI0MDUgLTIuMTcxNiwtMTUuNjM2MDggdiAwIGMgLTMuOTA5MSwxMy40NjQ0IC0xMC44NTg0LDE5LjU0NTEgLTE5LjExMDgsMjEuMjgyNDQgLTEwLjQyNCwyLjE3MTY4IC0xOC42NzY0LC00Ljc3NzY5IC0yMC44NDgxLC0xNS42MzYwNyAtNS4yMTIsLTIyLjU4NTQ1IDguNjg2NywtNDUuMTcwODkgMzAuODM3OCwtNTAuMzgyOTIgMC40MzQ0LDAgMC40MzQ0LDAgMC44Njg3LDAgNS4yMTIsLTEuMzAzMDEgMTAuODU4NCwtMS4zMDMwMSAxNi4wNzA0LC0wLjg2ODY3IGwgMC40MzQzLDMxLjcwNjQ5IGMgMCw5LjEyMTA0IDEuMzAzLDE4LjY3NjQyIDMuNDc0NywyNy43OTc0NyB6IG0gLTQuMzQzMywtNTIuMTIwMjYgYyAtMi42MDYsMCAtNC43Nzc3LDAgLTYuOTQ5NCwwLjQzNDM0IC0xNS4yMDE3LDMuNDc0NjggLTIzLjg4ODQsMjEuNzE2NzcgLTIwLjg0ODEsMzcuNzg3MTkgMS4zMDMsNi41MTUwMyA1LjIxMiwxMi41OTU3MiAxMi41OTU3LDEwLjg1ODM4IDcuMzgzNywtMS43MzczNCAxNi4wNzA1LC0xNC43Njc0IDE1LjYzNjEsLTMwLjgzNzgyIHogbSA0LjM0MzMsLTM0LjMxMjUgLTEyLjU5NTcsMjAuODQ4MSAtNy44MTgsMS43MzczNSA4LjI1MjMsLTE5Ljk3OTQ0IHoiCiAgIGlkPSJwYXRoOCIKICAgc3R5bGU9InN0cm9rZS13aWR0aDo0LjM0MzM1IiAvPgo8cGF0aAogICBjbGFzcz0ic3QwIgogICBkPSJtIDEzOTguOTk0Niw1MzEuOTMyNzQgYyA0LjM0MzMsMS4zMDMwMSA5LjEyMSwxLjczNzM0IDEzLjQ2NDQsMC44Njg2NyA1LjY0NjMsLTAuNDM0MzQgOS41NTU0LC01LjY0NjM2IDkuMTIxLC0xMS4yOTI3MiB2IC0wLjQzNDM0IGMgLTAuODY4NiwtNC43Nzc2OSAtMy40NzQ3LC02Ljk0OTM3IC0xMC40MjQsLTkuMTIxMDQgLTYuNTE1MSwtMS4zMDMwMSAtMTEuNzI3MSwtNi4wODA3IC0xMy40NjQ0LC0xMi41OTU3MyAtMi4xNzE3LC0xMC40MjQwNSA0Ljc3NzcsLTE5Ljk3OTQzIDE3LjM3MzQsLTIyLjU4NTQ1IDQuMzQzNCwtMC44Njg2NyA4LjY4NjcsLTAuODY4NjcgMTMuMDMwMSwwLjQzNDM0IGwgLTEuMzAzLDguMjUyMzcgYyAtMy40NzQ3LC0wLjg2ODY3IC02Ljk0OTQsLTEuMzAzIC0xMC44NTg0LC0wLjQzNDMzIC01LjIxMjEsMC40MzQzMyAtOS4xMjExLDUuMjEyMDIgLTguNjg2NywxMC40MjQwNSB2IDAuNDM0MzMgYyAwLjg2ODYsNC4zNDMzNiA0LjM0MzMsNi41MTUwNCA5Ljk4OTcsOC4yNTIzOCA3LjM4MzcsMi4xNzE2OCAxMy4wMyw2LjUxNTAzIDE0LjMzMywxMy4wMzAwNiAyLjYwNjEsMTIuMTYxNCAtNi4wODA2LDIxLjI4MjQ0IC0xOC4yNDIsMjQuMzIyNzkgLTUuMjEyMSwxLjMwMzAxIC0xMC40MjQxLDAuODY4NjcgLTE1LjIwMTgsLTAuODY4NjcgeiIKICAgaWQ9InBhdGgxMCIKICAgc3R5bGU9InN0cm9rZS13aWR0aDo0LjM0MzM1IiAvPgo8cGF0aAogICBjbGFzcz0ic3QwIgogICBkPSJtIDE0NjguNDg4Myw0NjYuNzgyNDIgMTIuNTk1NywzMC40MDM0OCBjIDIuNjA2LDYuNTE1MDMgNC4zNDMzLDEwLjQyNDA1IDYuMDgwNywxNC43Njc0MSBoIDAuNDM0MyBjIDAuODY4NywtMy45MDkwMiAxLjczNzQsLTguNjg2NzEgMy4wNDA0LC0xNS42MzYwOCBsIDcuODE4LC0zNS42MTU1MSAxMC44NTg0LC0yLjE3MTY4IC0xMi41OTU3LDQ5LjA3OTkxIGMgLTIuNjA2LDEyLjE2MTQgLTYuOTQ5NCwyNC4zMjI3OSAtMTMuNDY0NCwzNS4xODExOCAtMy40NzQ3LDYuMDgwNjkgLTguNjg2NywxMC44NTgzOCAtMTQuNzY3NCwxMy44OTg3MyBsIC00LjM0MzQsLTguMjUyMzcgYyAzLjQ3NDcsLTIuMTcxNjggNi45NDk0LC00Ljc3NzY5IDkuNTU1NCwtNy44MTgwNCAzLjkwOSwtNC43Nzc2OSA2LjUxNSwtOS45ODk3MiA4LjI1MjQsLTE1LjYzNjA4IDAuNDM0MywtMC44Njg2NyAwLjQzNDMsLTEuNzM3MzQgMCwtMi42MDYwMSBsIC0yMy40NTQyLC01Mi41NTQ1OSB6IgogICBpZD0icGF0aDEyIgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDAiCiAgIGQ9Im0gMTU0My42MjgzLDUxMS41MTg5NyAtMC44Njg3LC00Mi45OTkyMSBjIDAsLTYuOTQ5MzcgLTAuNDM0MywtMTIuNTk1NzMgLTAuODY4NiwtMTcuMzczNDIgbCA4LjY4NjcsLTEuNzM3MzQgMC44Njg2LDExLjI5MjcyIGggMC40MzQ0IGMgMi42MDYsLTguMjUyMzcgOS41NTU0LC0xNC43Njc0MSAxNy44MDc3LC0xNi41MDQ3NSA2Ljk0OTQsLTIuMTcxNjggMTQuMzMzMSwyLjE3MTY4IDE2LjA3MDQsOC42ODY3MSAwLDAuNDM0MzQgMC40MzQ0LDAuODY4NjcgMC40MzQ0LDEuMzAzMDEgMi42MDYsLTguNjg2NzEgOS41NTU0LC0xNS42MzYwOCAxOC42NzY0LC0xNy44MDc3NiA3LjgxOCwtMS43MzczNCAxNS4yMDE3LDMuMDQwMzUgMTYuOTM5MSwxMC40MjQwNSAwLDAuNDM0MzQgMC40MzQzLDEuMzAzMDEgMC40MzQzLDEuNzM3MzUgMC44Njg3LDMuNDc0NjggMS4zMDMsNi41MTUwMyAxLjMwMyw5Ljk4OTcxIGwgMC44Njg3LDM2LjA0OTg1IC05Ljk4OTcsMi4xNzE2OCAtMC44Njg3LC0zNS4xODExOCBjIDAsLTIuNjA2MDEgLTAuNDM0MywtNS4yMTIwMiAtMC44Njg3LC03LjgxODA0IC0xLjMwMywtNi4wODA2OSAtNC4zNDMzLC05LjU1NTM4IC0xMC44NTgzLC04LjI1MjM3IC03LjM4MzcsMS4zMDMgLTEzLjg5ODgsMTEuNzI3MDYgLTEzLjQ2NDQsMjUuMTkxNDYgbCAwLjg2ODYsMzEuMjcyMTUgLTkuNTU1NCwyLjE3MTY4IC0wLjg2ODYsLTM1LjYxNTUxIGMgMCwtMi42MDYwMSAtMC40MzQ0LC00Ljc3NzY5IC0wLjg2ODcsLTcuMzgzNyAtMC44Njg3LC00Ljc3NzY5IC0zLjQ3NDcsLTkuOTg5NzIgLTEwLjg1ODQsLTguMjUyMzggLTcuMzgzNywxLjczNzM0IC0xNC4zMzMxLDEzLjAzMDA3IC0xMy44OTg3LDI2LjA2MDEzIGwgMC44Njg3LDMwLjQwMzQ4IHoiCiAgIGlkPSJwYXRoMTQiCiAgIHN0eWxlPSJzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MCIKICAgZD0ibSAxNjgyLjYxNTcsNDc4LjUwOTQ4IGMgLTUuMjEyMSw0LjM0MzM1IC0xMS43MjcxLDcuMzgzNyAtMTguMjQyMSw4LjY4NjcgLTE1LjYzNjEsMy40NzQ2OSAtMjQuMzIyOCwtNS42NDYzNiAtMjcuMzYzMiwtMTguNjc2NDIgLTMuOTA5LC0xNy44MDc3NiA1LjIxMjEsLTQwLjM5MzIgMjMuODg4NSwtNDQuMzAyMjIgMTEuMjkyNywtMi4xNzE2OCAxOC42NzY0LDMuMDQwMzUgMjAuNDEzOCwxMS4yOTI3MiAzLjQ3NDYsMTUuMjAxNzQgLTEzLjAzMDEsMjMuMDE5NzggLTM0Ljc0NjksMjcuMzYzMTQgMC40MzQzLDMuOTA5MDIgMS4zMDMsNy4zODM3IDMuNDc0NywxMC44NTgzOCAzLjQ3NDcsNC43Nzc3IDkuMTIxLDYuNTE1MDQgMTQuNzY3NCw1LjIxMjAzIDUuNjQ2NCwtMS4zMDMwMSAxMC40MjQxLC0zLjkwOTAyIDE0Ljc2NzQsLTcuMzgzNyB6IG0gLTEwLjg1ODQsLTQwLjgyNzU0IGMgLTAuODY4NywtNC43Nzc2OSAtNS4yMTIxLC02LjUxNTAzIC0xMC40MjQxLC01LjY0NjM2IC05LjU1NTQsMi4xNzE2OCAtMTQuNzY3NCwxMy4wMzAwNiAtMTUuMjAxNywyMi41ODU0NCAxNS42MzYxLC0zLjA0MDM0IDI3LjM2MzEsLTcuODE4MDQgMjUuNjI1OCwtMTYuOTM5MDggeiIKICAgaWQ9InBhdGgxNiIKICAgc3R5bGU9InN0cm9rZS13aWR0aDo0LjM0MzM1IiAvPgo8cGF0aAogICBjbGFzcz0ic3QwIgogICBkPSJtIDE3MDUuMjAxMSw0MTUuOTY1MTcgMS4zMDMsNjAuMzcyNjMgYyAwLjQzNDMsOS45ODk3MSAtMC40MzQzLDE2LjkzOTA4IC0zLjA0MDMsMjEuMjgyNDQgLTIuNjA2MSw0LjM0MzM1IC02Ljk0OTQsNy44MTgwMyAtMTIuMTYxNCw4LjY4NjcxIC0yLjE3MTcsMC40MzQzMyAtNC4zNDM0LDAuODY4NjcgLTYuOTQ5NCwwLjg2ODY3IGwgLTAuNDM0MywtOC4yNTIzOCBjIDEuNzM3MywwIDMuMDQwMywwIDQuNzc3NywtMC40MzQzMyA1LjIxMiwtMS4zMDMwMSA4LjI1MjMsLTUuMjEyMDMgOC4yNTIzLC0xNy44MDc3NiBsIC0xLjczNzMsLTYyLjU0NDMxIHogbSAtNS4yMTIsLTkuMTIxMDUgYyAtMy4wNDA0LDAuODY4NjcgLTYuMDgwNywtMS4zMDMwMSAtNi45NDk0LC00LjM0MzM1IHYgLTAuNDM0MzQgYyAtMC44Njg3LC0zLjkwOTAyIDEuNzM3NCwtNy4zODM3IDUuMjEyLC04LjI1MjM3IDMuMDQwNCwtMC44Njg2NyA2LjUxNTEsMS4zMDMgNy4zODM3LDQuNzc3NjkgdiAwLjQzNDMzIGMgMC44Njg3LDMuMDQwMzUgLTEuNzM3Myw2Ljk0OTM3IC01LjY0NjMsNy44MTgwNCAwLjQzNDMsMCAwLjQzNDMsMCAwLDAgeiIKICAgaWQ9InBhdGgxOCIKICAgc3R5bGU9InN0cm9rZS13aWR0aDo0LjM0MzM1IiAvPgo8cGF0aAogICBjbGFzcz0ic3QwIgogICBkPSJtIDE3NzIuMDg4OCw0MjUuOTU0ODggYyAzLjkwOSwxNy44MDc3NiAtNC43Nzc3LDM5LjUyNDUzIC0yNC43NTcyLDQzLjQzMzU1IC0xNC43Njc0LDMuMDQwMzUgLTI1LjE5MTQsLTYuMDgwNyAtMjguMjMxOCwtMTkuMTEwNzYgLTMuOTA5LC0xOS4xMTA3NiA1LjY0NjQsLTM5Ljk1ODg3IDI0LjMyMjgsLTQzLjg2Nzg4IDE2LjUwNDgsLTMuNDc0NjkgMjYuMDYwMiw2Ljk0OTM2IDI4LjY2NjIsMTkuNTQ1MDkgbSAtNDIuMTMwNiwyMS43MTY3OCBjIDIuMTcxNyw5LjU1NTM4IDguNjg2NywxNS4yMDE3NCAxNy4zNzM0LDEzLjQ2NDQgMTEuNzI3MSwtMi42MDYwMiAxNy44MDc4LC0xOS41NDUxIDE0Ljc2NzQsLTMzLjQ0Mzg0IC0xLjMwMywtNi45NDkzNiAtNi41MTUsLTE1LjYzNjA3IC0xNy4zNzM0LC0xMy40NjQ0IC0xMi41OTU3LDMuMDQwMzUgLTE3LjgwNzcsMTkuOTc5NDQgLTE0Ljc2NzQsMzMuNDQzODQiCiAgIGlkPSJwYXRoMjAiCiAgIHN0eWxlPSJzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MCIKICAgZD0ibSAxNzg2LjQyMTgsNDU5LjgzMzA1IC0wLjg2ODYsLTM5LjA5MDE5IGMgMCwtNy44MTgwNCAtMC44Njg3LC0xNi4wNzA0MiAtMS4zMDMsLTIxLjI4MjQ0IGwgOC42ODY3LC0xLjczNzM0IGMgMC40MzQzLDQuMzQzMzUgMC44Njg2LDguMjUyMzcgMS4zMDMsMTMuMDMwMDYgaCAwLjQzNDMgYyAyLjE3MTcsLTguNjg2NzEgNi45NDk0LC0xNi4wNzA0MSAxNC43Njc0LC0xNy44MDc3NSAwLjg2ODcsMCAxLjczNzQsLTAuNDM0MzQgMi42MDYsLTAuNDM0MzQgdiAxMC40MjQwNSBjIC0wLjg2ODYsMCAtMS43MzczLDAgLTIuNjA2LDAuNDM0MzQgLTguNjg2NywxLjczNzM0IC0xNC4zMzMxLDEzLjg5ODczIC0xMy44OTg3LDI4LjIzMTggbCAwLjQzNDMsMjYuOTI4OCB6IgogICBpZD0icGF0aDIyIgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDAiCiAgIGQ9Im0gMTg4NS44ODQ3LDQzOC45ODQ5NSBjIC0wLjg2ODcsLTUuMjEyMDMgLTEuNzM3NCwtMTAuNDI0MDYgLTEuNzM3NCwtMTUuMjAxNzUgaCAtMC40MzQzIGMgLTMuOTA5LDEzLjQ2NDQgLTEwLjg1ODQsMTkuNTQ1MSAtMTkuMTEwOCwyMS4yODI0NCAtMTAuNDI0LDIuMTcxNjggLTE4LjY3NjQsLTQuNzc3NjkgLTIwLjg0ODEsLTE1LjYzNjA3IC01LjIxMiwtMjIuNTg1NDUgOC42ODY3LC00NS4xNzA4OSAzMS4yNzIyLC01MC4zODI5MiBoIDAuNDM0MyBjIDUuMjEyLC0xLjMwMzAxIDEwLjg1ODQsLTEuMzAzMDEgMTYuMDcwNCwtMC44Njg2NyBsIDAuNDM0NCwzMS43MDY0OSBjIDAsOS4xMjEwNCAxLjMwMywxOC42NzY0MiAzLjQ3NDYsMjcuNzk3NDcgeiBtIC00LjM0MzQsLTUyLjU1NDYgYyAtMi42MDYsMCAtNC43Nzc3LDAgLTcuMzgzNywwLjg2ODY3IC0xNS4yMDE3LDMuMDQwMzUgLTIzLjg4ODQsMjEuNzE2NzggLTIwLjg0ODEsMzcuNzg3MTkgMS4zMDMsNi41MTUwMyA1LjIxMiwxMi4xNjEzOSAxMi41OTU3LDEwLjg1ODM5IDcuMzgzNywtMS4zMDMwMSAxNi4wNzA0LC0xNC43Njc0MSAxNS42MzYxLC0zMC44Mzc4MiB6IgogICBpZD0icGF0aDI0IgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDAiCiAgIGQ9Im0gMTkxMy42ODIxLDQ0Ni44MDI5OCBjIDUuMjEyMSwxLjczNzM1IDEwLjg1ODQsMS43MzczNSAxNi41MDQ4LDAuNDM0MzQgOS45ODk3LC0yLjE3MTY4IDE2LjUwNDcsLTguNjg2NzEgMTYuNTA0NywtMjUuMTkxNDYgdiAtOS4xMjEwNCBoIC0wLjQzNDMgYyAtMi42MDYsOC4yNTIzNyAtOS4xMjExLDE0Ljc2NzQgLTE3LjgwNzgsMTYuNTA0NzUgLTExLjcyNywyLjYwNjAxIC0xOS45Nzk0LC02LjA4MDcgLTIyLjE1MTEsLTE2LjUwNDc1IC00LjM0MzMsLTE5Ljk3OTQzIDYuMDgwNywtNDIuNTY0ODggMjguNjY2MiwtNDcuMzQyNTcgNi41MTUsLTEuMzAzMDEgMTMuMDMsLTEuMzAzMDEgMTkuNTQ1MSwwIGwgMS4zMDMsNTAuMzgyOTIgYyAwLDEyLjU5NTcyIC0xLjMwMywyMi4xNTExMSAtNi41MTUxLDI4LjY2NjE0IC00Ljc3NzYsNS42NDYzNiAtMTEuNzI3LDkuNTU1MzggLTE5LjExMDcsMTAuODU4MzggLTYuMDgwNywxLjMwMzAxIC0xMi41OTU3LDEuMzAzMDEgLTE4LjI0MjEsLTAuNDM0MzMgeiBtIDMxLjI3MjIsLTcyLjUzNDAyIGMgLTMuNDc0NywtMC44Njg2NyAtNi45NDk0LC0wLjg2ODY3IC05Ljk4OTcsMCAtMTQuNzY3NCwzLjA0MDM1IC0yMS4yODI1LDIwLjQxMzc3IC0xOC42NzY1LDM1LjE4MTE3IDEuMzAzMSw2LjUxNTA0IDUuMjEyMSwxMy40NjQ0IDE0LjMzMzEsMTEuNzI3MDYgOS4xMjExLC0xLjczNzM0IDE1LjIwMTgsLTE0LjMzMzA3IDE0Ljc2NzQsLTI2LjQ5NDQ2IHoiCiAgIGlkPSJwYXRoMjYiCiAgIHN0eWxlPSJzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MCIKICAgZD0ibSAyMDE4LjM1NywzNDkuNTExODQgMC44Njg3LDQyLjk5OTIxIGMgMCw2Ljk0OTM3IDAuNDM0MywxMi41OTU3MyAwLjg2ODYsMTcuODA3NzUgbCAtOS4xMjEsMS43MzczNSAtMC44Njg3LC0xMS4yOTI3MyBoIC0wLjQzNDMgYyAtMy4wNDA0LDguMjUyMzggLTkuNTU1NCwxNC4zMzMwNyAtMTcuODA3OCwxNi41MDQ3NSAtNy4zODM3LDEuNzM3MzQgLTE2LjA3MDQsLTAuNDM0MzMgLTE5LjExMDcsLTEzLjQ2NDQgLTAuNDM0NCwtMy40NzQ2OCAtMC44Njg3LC02LjUxNTAzIC0wLjg2ODcsLTkuOTg5NzEgbCAtMC44Njg3LC0zNC4zMTI1MSA5Ljk4OTcsLTIuMTcxNjcgMC44Njg3LDMzLjg3ODE2IGMgMCwzLjA0MDM1IDAsNS42NDYzNiAwLjg2ODcsOC42ODY3MSAxLjMwMyw2LjA4MDcgNC43Nzc3LDkuNTU1MzggMTEuNzI3LDguMjUyMzggNi45NDk0LC0xLjMwMzAxIDE0Ljc2NzQsLTEyLjE2MTQgMTQuMzMzMSwtMjUuMTkxNDYgbCAtMC44Njg3LC0zMS4yNzIxNiB6IgogICBpZD0icGF0aDI4IgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDAiCiAgIGQ9Im0gMjA3NS42ODkzLDM5OC4xNTc0MSBjIC0wLjg2ODcsLTUuMjEyMDIgLTEuNzM3NCwtMTAuNDI0MDUgLTEuNzM3NCwtMTUuNjM2MDggaCAtMC40MzQzIGMgLTMuOTA5LDEzLjQ2NDQgLTEwLjg1ODQsMTkuNTQ1MSAtMTkuMTEwOCwyMS4yODI0NCAtMTAuNDI0LDIuMTcxNjggLTE4LjY3NjQsLTQuNzc3NjkgLTIwLjg0ODEsLTE1LjYzNjA4IC01LjIxMiwtMjIuNTg1NDQgOC42ODY3LC00NC43MzY1NSAzMS4yNzIyLC00OS45NDg1OCBoIDAuNDM0MyBjIDUuMjEyLC0xLjMwMyAxMC44NTg0LC0xLjczNzM0IDE2LjA3MDQsLTEuMzAzIGwgMC40MzQ0LDMxLjcwNjQ5IGMgMCw5LjEyMTA0IDEuMzAzLDE4LjY3NjQyIDMuNDc0NiwyNy43OTc0NyB6IG0gLTQuMzQzNCwtNTIuMTIwMjYgYyAtMi42MDYsMCAtNC43Nzc3LDAgLTcuMzgzNywwLjg2ODY3IC0xNS4yMDE3LDMuNDc0NjkgLTIzLjg4ODQsMjEuNzE2NzggLTIwLjg0ODEsMzcuNzg3MTkgMS4zMDMsNi41MTUwMyA1LjIxMiwxMi4xNjEzOSAxMi41OTU3LDEwLjg1ODM5IDcuMzgzNywtMS4zMDMwMSAxNi4wNzA0LC0xNC43Njc0MSAxNS42MzYxLC0zMC44Mzc4MiB6IgogICBpZD0icGF0aDMwIgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDEiCiAgIGQ9Im0gMTg5MS45NjU0LDI2OC4yOTExIGMgNS4yMTIsMCA5Ljk4OTcsMS4zMDMwMSAxNC4zMzMsMy45MDkwMiA0Ljc3NzcsMi42MDYwMSA4LjY4NjcsNi4wODA3IDEwLjg1ODQsMTAuODU4MzkgMi42MDYsNC4zNDMzNSAzLjkwOSw5LjU1NTM4IDMuOTA5LDE0Ljc2NzQgMCw1LjIxMjAzIC0xLjMwMyw5Ljk4OTcyIC0zLjkwOSwxNC4zMzMwOCAtMi42MDYsNC43Nzc2OSAtNi4wODA3LDguMjUyMzcgLTEwLjg1ODQsMTAuODU4MzggLTkuMTIxLDUuMjEyMDMgLTE5Ljk3OTQsNS4yMTIwMyAtMjkuMTAwNCwwIC00Ljc3NzcsLTIuNjA2MDEgLTguMjUyNCwtNi4wODA2OSAtMTAuODU4NCwtMTAuODU4MzggLTIuNjA2LC00LjM0MzM2IC0zLjkwOTEsLTkuNTU1MzkgLTMuOTA5MSwtMTQuMzMzMDggMCwtNS4yMTIwMiAxLjMwMzEsLTEwLjQyNDA1IDMuOTA5MSwtMTQuNzY3NCAyLjYwNiwtNC43Nzc2OSA2LjUxNSwtOC4yNTIzOCAxMC44NTg0LC0xMC44NTgzOSA0Ljc3NzYsLTIuNjA2MDEgOS41NTUzLC0zLjkwOTAyIDE0Ljc2NzQsLTMuOTA5MDIgbSAwLDQuNzc3NjkgYyAtNC4zNDM0LDAgLTguMjUyNCwxLjMwMzAxIC0xMi4xNjE0LDMuMDQwMzUgLTMuOTA5MSwyLjE3MTY4IC02Ljk0OTQsNS4yMTIwMyAtOS4xMjExLDkuMTIxMDUgLTIuMTcxNywzLjkwOTAyIC0zLjQ3NDcsNy44MTgwMyAtMy40NzQ3LDEyLjE2MTM5IDAsNC4zNDMzNSAxLjMwMyw4LjI1MjM3IDMuNDc0NywxMi4xNjEzOSAyLjE3MTcsMy45MDkwMiA1LjIxMiw2Ljk0OTM3IDkuMTIxMSw5LjEyMTA1IDMuNDc0NiwyLjE3MTY4IDcuODE4LDMuNDc0NjggMTIuMTYxNCwzLjQ3NDY4IDQuMzQzMywwIDguMjUyMywtMS4zMDMgMTIuMTYxNCwtMy40NzQ2OCAzLjkwOSwtMi4xNzE2OCA2Ljk0OTMsLTUuMjEyMDMgOS4xMjEsLTkuMTIxMDUgMi4xNzE3LC0zLjQ3NDY4IDMuMDQwMywtNy44MTgwNCAzLjA0MDMsLTEyLjE2MTM5IDAsLTQuMzQzMzYgLTEuMzAzLC04LjY4NjcxIC0zLjQ3NDYsLTEyLjE2MTM5IC0yLjE3MTcsLTMuOTA5MDIgLTUuMjEyMSwtNi45NDkzNyAtOS4xMjExLC05LjEyMTA1IC0zLjQ3NDcsLTEuNzM3MzQgLTcuMzgzNywtMy4wNDAzNSAtMTEuNzI3LC0zLjA0MDM1IG0gLTEzLjAzMDEsNDAuMzkzMiBWIDI4MS43NTU1IGggMTAuODU4NCBjIDIuNjA2LDAgNS4yMTIsMCA4LjI1MjQsMC44Njg2NyAxLjczNzMsMC40MzQzNCAzLjA0MDMsMS43MzczNCAzLjkwOSwzLjA0MDM1IDAuODY4NiwxLjMwMzAxIDEuMzAzLDMuMDQwMzUgMS43MzczLDQuNzc3NjkgMCwyLjE3MTY4IC0wLjg2ODcsNC4zNDMzNiAtMi42MDYsNi4wODA3IC0xLjczNzMsMS43MzczNCAtMy45MDksMi42MDYwMSAtNi41MTUsMy4wNDAzNSAwLjg2ODYsMC40MzQzMyAxLjczNzMsMC44Njg2NyAyLjYwNiwxLjczNzM0IDEuNzM3MywxLjczNzM0IDMuNDc0NywzLjkwOTAyIDQuNzc3Nyw2LjA4MDcgbCAzLjkwOSw2LjA4MDY5IGggLTYuMDgwNyBsIC0zLjA0MDQsLTUuMjEyMDIgYyAtMS4zMDMsLTIuNjA2MDIgLTMuMDQwMywtNS4yMTIwMyAtNS4yMTIsLTcuMzgzNzEgLTEuMzAzLC0wLjg2ODY3IC0yLjYwNiwtMS4zMDMgLTQuMzQzMywtMS4zMDMgaCAtMy4wNDA0IHYgMTMuNDY0NCB6IG0gNS4yMTIsLTE3LjM3MzQyIGggNi4wODA3IGMgMi4xNzE3LDAuNDM0MzQgNC4zNDM0LDAgNi4wODA3LC0xLjMwMyAwLjg2ODcsLTAuODY4NjcgMS43Mzc0LC0yLjE3MTY4IDEuNzM3NCwtMy40NzQ2OSAwLC0wLjg2ODY3IC0wLjQzNDQsLTEuNzM3MzQgLTAuODY4NywtMi42MDYwMSAtMC40MzQ0LC0wLjg2ODY3IC0xLjMwMywtMS4zMDMwMSAtMi4xNzE3LC0xLjczNzM0IC0xLjczNzMsLTAuNDM0MzQgLTMuNDc0NywtMC40MzQzNCAtNS4yMTIsLTAuNDM0MzQgaCAtNS42NDY0IHoiCiAgIGlkPSJwYXRoMzIiCiAgIHN0eWxlPSJzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MSIKICAgZD0ibSAxNjI3Ljg4OTQsMzEwLjg1NTk4IHYgLTgxLjIyMDc0IGMgMCwtMjIuNTg1NDQgLTQuNzc3NywtMzkuOTU4ODYgLTEzLjg5ODcsLTUyLjEyMDI1IC04LjI1MjQsLTExLjcyNzA2IC0yMC44NDgyLC0yMC40MTM3NyAtMzQuNzQ2OSwtMjMuODg4NDYgLTE2LjA3MDQsLTMuNDc0NjggLTMyLjE0MDgsLTMuNDc0NjggLTQ4LjIxMTIsMC40MzQzNCAtMjQuNzU3MSw1LjIxMjAzIC01MS4yNTE2LDE3LjM3MzQyIC03OC42MTQ3LDM2LjA0OTg1IHYgNjQuMjgxNjUgYyAxOS41NDUsLTE5LjU0NTEgMzkuMDkwMSwtMzEuNzA2NDkgNTcuNzY2NiwtMzcuMzUyODUgMTMuNDY0NCwtMy45MDkwMiAyNi45Mjg4LC02LjA4MDcgMzMuNDQzOCwtMy4wNDAzNSAxMC40MjQxLDQuNzc3NjkgOS45ODk3LDEyLjU5NTczIDkuOTg5NywyMi4xNTExMSAtODMuMzkyNCwyOC4yMzE4IC0xMjUuMDg4Niw2Ni40NTMzMiAtMTI1LjA4ODYsMTE0LjY2NDU2IDAsMjEuMjgyNDQgNy4zODM3LDM4LjIyMTUzIDIyLjE1MTEsNDkuOTQ4NTggMTMuODk4NywxMS43MjcwNiAzMi41NzUyLDE2LjA3MDQyIDUwLjM4MjksMTEuNzI3MDYgOS45ODk3LC0yLjE3MTY4IDE5LjU0NTEsLTYuNTE1MDMgMjcuNzk3NSwtMTMuMDMwMDYgOS41NTU0LC03LjM4MzcxIDE4LjI0MjEsLTE2LjUwNDc1IDI1LjE5MTUsLTI2LjQ5NDQ3IDAsMjIuMTUxMTEgMTEuNzI3LDIwLjg0ODExIDE2LjkzOSwxOS41NDUxIDUuMjEyMSwtMS4zMDMwMSA3MS42NjU0LC0xNS4yMDE3NCA3MS42NjU0LC0xNS4yMDE3NCAtOS41NTU0LC0zLjA0MDM1IC0xNi45MzkxLC0xMi41OTU3MyAtMTQuNzY3NCwtNjYuNDUzMzMgbSAtNzMuODM3LC0zLjQ3NDY4IGMgMC40MzQzLDkuNTU1MzggLTIuMTcxNywxOS4xMTA3NiAtNi41MTUxLDI3Ljc5NzQ3IC0zLjkwOSw3LjM4MzcgLTEwLjQyNCwxMi41OTU3MyAtMTguNjc2NCwxNC4zMzMwNyAtNi41MTUsMS43MzczNCAtMTMuNDY0NCwtMC40MzQzNCAtMTguMjQyMSwtNC43Nzc2OSAtNS4yMTIsLTUuMjEyMDMgLTguMjUyNCwtMTIuMTYxNCAtNy44MTgsLTE5LjExMDc2IDAsLTIyLjE1MTExIDE2LjkzOTEsLTM4LjY1NTg2IDUwLjgxNzIsLTQ4LjY0NTU4IHoiCiAgIGlkPSJwYXRoMzQiCiAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDEiCiAgIGQ9Im0gODQzLjQ3OTUxLDM2Mi41NDE5IC0zNi40ODQxOCw3LjgxODA0IHYgOTkuMDI4NDkgYyAwLDE1LjIwMTc0IDYuMDgwNjksMjEuNzE2NzcgMTguMjQyMDksMTkuMTEwNzYgNi45NDkzNiwtMS43MzczNCAxMy40NjQ0LC01LjY0NjM2IDE4LjI0MjA5LC0xMC40MjQwNSB2IDY1LjU4NDY2IGMgLTE0LjMzMzA4LDguMjUyMzcgLTI5LjUzNDgyLDEzLjg5ODczIC00NS42MDUyMywxNy4zNzM0MiAtMjUuMTkxNDYsNS4yMTIwMiAtNDMuNDMzNTUsMy4wNDAzNSAtNTUuMTYwNjEsLTYuMDgwNyAtMTEuNzI3MDUsLTkuMTIxMDUgLTE3LjgwNzc1LC0yNi45Mjg4IC0xNy44MDc3NSwtNTEuNjg1OTIgViAzODguNjAyMDMgbCAtMjkuNTM0ODEsNi4wODA3IHYgLTYwLjgwNjk3IGMgMCwwIDI0LjMyMjc4LC01LjIxMjAzIDI5LjUzNDgxLC02LjA4MDcgLTMuMDQwMzUsLTU3Ljc2NjYyIDEyLjE2MTM5LC02Mi41NDQzMSAyOS41MzQ4MSwtNjYuNDUzMzMgbCA0OC42NDU1OCwtOS4xMjEwNCB2IDU5LjUwMzk2IGwgMzkuOTU4ODYsLTguMjUyMzcgeiIKICAgaWQ9InBhdGgzNiIKICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MSIKICAgZD0ibSAxMzY4LjE1NjgsMTE0LjUzNjM0IGMgLTcuMzgzNywyLjE3MTY4IC0zNi40ODQyLDEzLjg5ODc0IC0zNi45MTg1LDY0LjcxNTk5IHYgMjYzLjY0MTY0IGwgNDMuODY3OCwtOS4xMjEwNSBjIDcuODE4MSwtMi4xNzE2OCAzNi40ODQyLC0xMy44OTg3MyAzNi45MTg2LC02NC4yODE2NSBWIDEwNS40MTUzIFoiCiAgIGlkPSJwYXRoMzgiCiAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDEiCiAgIGQ9Im0gMTI5MC40MTA3LDI0MS4zNjIzIGMgLTE1LjIwMTcsLTIwLjg0ODEgLTM1LjYxNTUsLTI5LjEwMDQ4IC02MS4yNDEzLC0yMy40NTQxMSAtMTAuODU4NCwyLjE3MTY3IC0yMS4yODI0LDcuMzgzNyAtMjkuOTY5MSwxNC4zMzMwNyAtOC42ODY3LDYuOTQ5MzYgLTE2LjA3MDQsMTUuNjM2MDcgLTIxLjcxNjgsMjUuMTkxNDUgMCwtMTEuMjkyNzIgMS4zMDMsLTIyLjU4NTQ0IC0xMC44NTg0LC0yMC44NDgxIC0xMy4wMzAxLDIuNjA2MDEgLTcyLjk2ODQsMTUuNjM2MDggLTcyLjk2ODQsMTUuNjM2MDggMi4xNzE3LDMuMDQwMzUgMy45MDkxLDYuOTQ5MzcgMy45MDkxLDEwLjg1ODM5IDAuNDM0Myw2Ljk0OTM2IDAsMzQyLjY5MDY5IDAsMzQyLjY5MDY5IGwgNDkuNTE0MiwtMTAuNDI0MDUgYyAxNy44MDc4LC00Ljc3NzY5IDMxLjcwNjUsLTcuMzgzNyAzMS43MDY1LC00OC4yMTEyNCB2IC04NC42OTU0MiBjIDYuNTE1LDQuNzc3NjkgMTMuODk4Nyw3LjgxODA0IDIxLjcxNjgsOS45ODk3MiA3LjgxOCwxLjczNzM0IDE2LjA3MDQsMS43MzczNCAyMy44ODg0LDAgMTcuODA3OCwtMy45MDkwMiAzMy44NzgyLC0xMy40NjQ0IDQ1LjYwNTIsLTI3LjM2MzE0IDEzLjg5ODgsLTE1LjYzNjA3IDI0Ljc1NzIsLTMzLjg3ODE2IDMxLjcwNjUsLTUzLjQyMzI2IDcuODE4MSwtMjEuNzE2NzggMTEuNzI3MSwtNDUuMTcwODkgMTEuNzI3MSwtNjguMTkwNjcgMCwtMzMuNDQzODMgLTcuODE4LC02MC44MDY5NyAtMjMuMDE5OCwtODIuMDg5NDEgbSAtNjcuNzU2MywxNDYuMzcxMDYgYyAtNS4yMTIsMTEuNzI3MDYgLTEzLjAzMDEsMTguMjQyMDkgLTIyLjU4NTUsMjAuNDEzNzcgLTMuOTA5LDAuODY4NjcgLTguMjUyMywwLjg2ODY3IC0xMi4xNjE0LC0wLjg2ODY3IC0zLjkwOSwtMS43MzczNSAtNy4zODM3LC00LjM0MzM2IC0xMC40MjQsLTcuODE4MDQgdiAtNTguNjM1MjkgYyAtMC40MzQzLC0xMS43MjcwNiAxLjczNzMsLTIzLjAxOTc4IDYuNTE1LC0zMy44NzgxNyAzLjQ3NDcsLTcuMzgzNyAxMC40MjQxLC0xMy4wMzAwNiAxOC42NzY0LC0xNC43Njc0MSA4LjY4NjgsLTEuNzM3MzQgMTUuMjAxOCwxLjczNzM1IDIwLjQxMzgsMTAuNDI0MDUgNS4yMTIsOC42ODY3MSA3LjgxODEsMjIuMTUxMTEgNy44MTgxLDQwLjgyNzU0IDAuNDM0MywxNS4yMDE3NCAtMi4xNzE3LDMwLjQwMzQ4IC04LjI1MjQsNDQuMzAyMjIiCiAgIGlkPSJwYXRoNDAiCiAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDEiCiAgIGQ9Im0gMTgwNS41MzI2LDMyNi40OTIwNiBjIC0xOS4xMTA4LDIwLjQxMzc2IC00NC4zMDIyLDMzLjg3ODE2IC03Mi4wOTk3LDM5LjA5MDE5IC0yNi40OTQ1LDUuMjEyMDMgLTUzLjg1NzYsMy40NzQ2OCAtNzkuNDgzNCwtNC4zNDMzNSB2IC03My44MzcwNCBjIDI1LjYyNTgsMTYuMDcwNDIgNDguMjExMywyMS43MTY3OCA2Ni44ODc3LDE3LjgwNzc2IDYuOTQ5MywtMS4zMDMwMSAxMy40NjQ0LC00Ljc3NzY5IDE4LjY3NjQsLTkuNTU1MzggNC43Nzc3LC00LjM0MzM2IDcuODE4LC0xMC40MjQwNSA3LjgxOCwtMTYuOTM5MDkgMCwtNC4zNDMzNSAtMi4xNzE2LC04LjY4NjcxIC02LjA4MDcsLTEwLjg1ODM4IC03LjM4MzcsLTMuNDc0NjkgLTE1LjIwMTcsLTUuNjQ2MzYgLTIzLjAxOTcsLTYuNTE1MDQgLTI2LjkyODgsLTQuNzc3NjkgLTQ0LjMwMjMsLTEyLjU5NTcyIC01Mi41NTQ2LC0yMy4wMTk3OCAtNy4zODM3LC05Ljk4OTcxIC0xMS43MjcxLC0yMS43MTY3NyAtMTEuNzI3MSwtMzQuMzEyNSAwLC0yMi41ODU0NCA5LjEyMTEsLTQyLjU2NDg4IDI3Ljc5NzUsLTU5LjkzODMgMTguNjc2NCwtMTcuODA3NzUgNDIuMTMwNSwtMjkuNTM0ODEgNjcuMzIyLC0zNC43NDY4MyAyMi41ODU0LC00Ljc3NzY5IDQ2LjAzOTUsLTQuMzQzMzYgNjguMTkwNywxLjczNzM0IHYgNzEuNjY1MzUgYyAtMTguNjc2NSwtMTIuMTYxMzkgLTM2LjQ4NDIsLTE2LjUwNDc1IC01My44NTc2LC0xMy4wMzAwNiAtNi41MTUxLDAuODY4NjcgLTEyLjE2MTQsMy40NzQ2OCAtMTcuMzczNSw3LjM4MzcgLTMuOTA5LDMuMDQwMzUgLTYuMDgwNyw3LjgxODA0IC01LjY0NjMsMTMuMDMwMDcgMCw3LjM4MzcgOC4yNTIzLDExLjcyNzA1IDI1LjE5MTQsMTMuNDY0NCA0NS4xNzA5LDUuNjQ2MzYgNjcuNzU2NCwyNC43NTcxMiA2OC4xOTA3LDU4LjIwMDk1IDAsMjIuNTg1NDQgLTkuMTIxLDQ0LjMwMjIyIC0yOC4yMzE4LDY0LjcxNTk5IgogICBpZD0icGF0aDQyIgogICBzdHlsZT0iZmlsbDojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjM0MzM1IiAvPgo8cGF0aAogICBjbGFzcz0ic3QxIgogICBkPSJtIDY2MS45MjcyNywzNjguNjIyNiBjIC0yMS4yODI0MywtMTcuMzczNDIgLTQ4LjY0NTU3LC0yMy4wMTk3OCAtODIuMDg5NCwtMTUuNjM2MDggLTMyLjU3NTE2LDYuNTE1MDMgLTYxLjY3NTY0LDI1LjE5MTQ2IC04MS4yMjA3NCw1Mi41NTQ1OSAtMjAuODQ4MSwyOC42NjYxNSAtMzEuNzA2NDksNjMuNDEyOTggLTMwLjgzNzgyLDk4LjU5NDE2IDAsMzYuNDg0MTggOS45ODk3Miw2NC4yODE2NSAyOS41MzQ4Miw4My44MjY3NSAxOS41NDUwOSwxOS41NDUwOSA0Ni45MDgyMywyNS42MjU3OSA4Mi4wODk0LDE3LjgwNzc1IDMzLjg3ODE3LC02LjUxNTAzIDYzLjQxMjk4LC0yNS42MjU3OSA4My4zOTI0MiwtNTMuNDIzMjYgMjAuODQ4MSwtMjguNjY2MTQgMzEuNzA2NDksLTYyLjk3ODY1IDMwLjgzNzgxLC05OC41OTQxNiAwLC0zOS4wOTAxOSAtMTAuNDI0MDUsLTY3Ljc1NjMzIC0zMS43MDY0OSwtODUuMTI5NzUgbSAtNTkuMDY5NjIsMTUzLjc1NDc2IGMgLTQuNzc3NjksMTEuNzI3MDYgLTEyLjU5NTczLDE4LjY3NjQyIC0yMi41ODU0NSwyMC44NDgxIC05LjEyMTA0LDIuNjA2MDEgLTE4LjY3NjQyLC0yLjE3MTY4IC0yMi4xNTExMSwtMTEuMjkyNzIgLTUuMjEyMDIsLTkuNTU1MzggLTcuMzgzNywtMjUuMTkxNDYgLTcuMzgzNywtNDYuNDczOSAwLC0yMS4yODI0NCAyLjYwNjAxLC0zOC4yMjE1MiA3LjM4MzcsLTQ5Ljk0ODU4IDQuNzc3NjksLTExLjcyNzA2IDEyLjU5NTczLC0xOC42NzY0MiAyMi41ODU0NSwtMjAuODQ4MSA5Ljk4OTcyLC0yLjE3MTY4IDE3LjM3MzQyLDEuNzM3MzQgMjIuNTg1NDQsMTEuMjkyNzIgNS4yMTIwMyw5LjU1NTM4IDcuMzgzNzEsMjUuMTkxNDYgNy4zODM3MSw0Ni45MDgyMyAtMC40MzQzNCwyMS43MTY3OCAtMy4wNDAzNSwzNy43ODcxOSAtNy44MTgwNCw0OS41MTQyNSIKICAgaWQ9InBhdGg0NCIKICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MSIKICAgZD0ibSAxMDQ4LjkyMDIsMjg4LjcwNDg3IGMgLTIxLjI4MjQsLTE3LjM3MzQyIC00OC42NDU2LC0yMi41ODU0NSAtODIuMDg5NDIsLTE1LjYzNjA4IC0zMy4wMDk0OSw2LjUxNTAzIC02Mi4xMDk5NywyNS4xOTE0NiAtODEuMjIwNzMsNTIuNTU0NiAtMjAuODQ4MTEsMjguNjY2MTQgLTMxLjcwNjQ5LDYzLjQxMjk4IC0zMC44Mzc4Miw5OS4wMjg0OSAwLDM2LjQ4NDE4IDkuOTg5NzEsNjQuMjgxNjUgMjkuNTM0ODEsODMuODI2NzQgMTkuNTQ1MSwxOS41NDUxIDQ2LjkwODIzLDI1LjE5MTQ2IDgyLjA4OTQxLDE4LjI0MjA5IDMzLjQ0Mzg1LC02LjUxNTAzIDYzLjQxMjk1LC0yNS42MjU3OSA4My4zOTI0NSwtNTMuNDIzMjYgMjAuODQ4MSwtMjguNjY2MTQgMzEuMjcyMSwtNjIuOTc4NjUgMzAuODM3OCwtOTguNTk0MTYgMC40MzQzLC0zOS45NTg4NiAtMTAuNDI0MSwtNjguNjI1IC0zMS43MDY1LC04NS45OTg0MiBtIC01OS4wNjk2NCwxNTMuNzU0NzYgYyAtNC43Nzc2OSwxMS43MjcwNiAtMTIuNTk1NzMsMTguNjc2NDMgLTIyLjU4NTQ0LDIwLjg0ODEgLTkuMTIxMDUsMi42MDYwMiAtMTguNjc2NDMsLTIuNjA2MDEgLTIyLjE1MTExLC0xMS4yOTI3MiAtNS4yMTIwMywtOS41NTUzOCAtNy4zODM3LC0yNS4xOTE0NiAtNy4zODM3LC00Ni4wMzk1NiAwLC0yMC44NDgxIDIuNjA2MDEsLTM4LjIyMTUyIDcuMzgzNywtNDkuOTQ4NTggNC43Nzc2OSwtMTEuNzI3MDYgMTIuNTk1NzMsLTE4LjY3NjQzIDIyLjU4NTQ0LC0yMC44NDgxIDkuOTg5NzIsLTIuMTcxNjggMTcuMzczNDIsMS43MzczNCAyMi41ODU0NSwxMS4yOTI3MiA1LjIxMiw5LjU1NTM4IDcuMzgzNywyNS4xOTE0NiA3LjM4MzcsNDYuOTA4MjMgMCwyMS43MTY3NyAtMi42MDYsMzcuMzUyODUgLTcuODE4MDQsNDkuMDc5OTEiCiAgIGlkPSJwYXRoNDYiCiAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDEiCiAgIGQ9Im0gNDQ2LjQ5Njg4LDUyNC45ODMzNyBjIC00LjM0MzM2LC0xOS41NDUxIC0xNi41MDQ3NSwtMzcuNzg3MTkgLTMzLjg3ODE3LC00Mi45OTkyMSAyOS45NjkxNSwtMTYuMDcwNDEgNTQuMjkxOTMsLTQyLjk5OTIxIDU0LjI5MTkzLC05NC4yNTA4IDAsLTI1LjE5MTQ2IC0xMS4yOTI3MiwtNTIuMTIwMjYgLTI3Ljc5NzQ3LC02Mi41NDQzMSAtMTYuNTA0NzUsLTEwLjQyNDA1IC0zNS42MTU1MSwtMTIuMTYxMzkgLTcxLjIzMTAyLC0zLjkwOTAyIDAsMCAtOTIuNTEzNDUsMTkuOTc5NDMgLTEyNS41MjI5NSwyNS42MjU3OSA2Ljk0OTM3LDAuODY4NjggOC42ODY3MSw0Ljc3NzY5IDkuMTIxMDQsMTIuNTk1NzMgMC40MzQzNCw3LjgxODA0IDAsMzA3LjUwOTUyIDAsMzA3LjUwOTUyIGwgNDQuMzAyMjIsLTguNjg2NzEgYyAyMC40MTM3NywtNC43Nzc2OSAzNi4wNDk4NSwtMTIuMTYxMzkgMzYuOTE4NTIsLTQ2LjkwODIzIGwgLTAuNDM0MzQsLTkzLjgxNjQ2IDcuMzgzNzEsLTEuNzM3MzQgYyAxMC40MjQwNSwtMi4xNzE2OCAyNi4wNjAxMywtMy4wNDAzNSAzMy40NDM4MywyMC40MTM3NiAzLjQ3NDY4LDEyLjE2MTQgOS4xMjEwNCw0OS45NDg1OCAxMi41OTU3Myw3My44MzcwNCAzLjQ3NDY4LDIzLjg4ODQ1IDE5Ljk3OTQzLDI1LjE5MTQ1IDMyLjE0MDgyLDIzLjAxOTc4IDEyLjE2MTQsLTIuMTcxNjggNTkuNTAzOTYsLTExLjcyNzA2IDYzLjg0NzMyLC0xMy4wMzAwNyAtMjEuNzE2NzcsLTQuNzc3NjkgLTI5LjUzNDgxLC02OC4xOTA2NyAtMzUuMTgxMTcsLTk1LjExOTQ3IG0gLTY5LjkyODAyLC04NS41NjQwOSBjIC02Ljk0OTM2LDguNjg2NzEgLTE2LjUwNDc1LDE0LjMzMzA3IC0yNy4zNjMxMywxNi4wNzA0MSBsIC0xNi41MDQ3NSwzLjQ3NDY5IDAuNDM0MzMsLTY5LjQ5MzY4IDIwLjQxMzc3LC0zLjkwOTAyIGMgMTEuMjkyNzIsLTIuMTcxNjggMTkuNTQ1MSwtMS4zMDMgMjQuNzU3MTIsMy4wNDAzNSA1LjIxMjAzLDQuMzQzMzYgOC4yNTIzOCwxMS43MjcwNiA4LjI1MjM4LDIyLjU4NTQ1IC0wLjQzNDM0LDkuOTg5NzEgLTMuOTA5MDIsMTkuOTc5NDMgLTkuOTg5NzIsMjguMjMxOCIKICAgaWQ9InBhdGg0OCIKICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MiIKICAgZD0ibSA0ODMuNDE1MzksMTk0Ljg4ODQxIHYgMCBjIC0wLjQzNDMzLC0wLjQzNDM0IC0wLjg2ODY3LC0wLjg2ODY4IC0wLjg2ODY3LC0wLjg2ODY4IEMgNDY4LjY0Nzk4LDE4MC45ODk2NyA0NDYuNDk2ODgsMTgwLjEyMSA0NDYuNDk2ODgsMTgwLjEyMSA0MzIuNTk4MTQsMTc4LjgxNzk5IDQxOC4yNjUwNywxNzguODE3OTkgNDA0LjM2NjMzLDE4MC45ODk2NyAxODguMDY3MjYsMjAwLjk2OTEgMCwzOTEuNjQyMzggMCw2MjAuOTcxNTEgMCw2NDguMzM0NjUgNS4yMTIwMjYsNjk1LjY3NzIyIDguNjg2NzEsNzIwIGwgNS4yMTIwMjUsLTEuMzAzIGMgLTEuNzM3MzQyLC0xMy44OTg3NCAtMy45MDkwMTksLTQ0LjczNjU2IC0zLjkwOTAxOSwtNTkuMDY5NjMgMCwtMjE3LjE2Nzc0IDE3OC4wNzc1NDQsLTM5NC44MTA5NSAzOTEuNzcwNjA0LC0zOTQuODEwOTUgMTQuMzMzMDcsMCA0My40MzM1NSwyLjE3MTY4IDUzLjQyMzI2LDEuNzM3MzQgaCAwLjQzNDM0IGMgMjIuNTg1NDUsLTAuODY4NjcgNDAuMzkzMiwtMTkuMTEwNzYgNDAuMzkzMiwtNDEuNjk2MjEgMC40MzQzNCwtMTEuMjkyNzIgLTMuOTA5MDIsLTIyLjE1MTExIC0xMi41OTU3MywtMjkuOTY5MTQgMC40MzQzNCwwIDAsMCAwLDAiCiAgIGlkPSJwYXRoNTAiCiAgIHN0eWxlPSJzdHJva2Utd2lkdGg6NC4zNDMzNSIgLz4KPHBhdGgKICAgY2xhc3M9InN0MCIKICAgZD0ibSA1NDkuODY4NzIsODIuODI5ODQ4IGMgLTEzLjQ2NDQsLTQuMzQzMzU1IC0zOC4yMjE1MiwtNi41MTUwMzIgLTU0LjI5MTk0LC02LjUxNTAzMiAtMTU2LjM2MDc3LDAgLTI5Ny41MTk4LDY5LjQ5MzY4NCAtMzg5LjE2NDU5LDE3Ny42NDMyMTQgLTMyLjU3NTE1OCwzOC42NTU4NiAtNTkuNTAzOTU4LDgyLjk1ODA4IC04My4zOTI0MDksMTQ1LjA2ODA1IGwgOC42ODY3MDksLTIuMTcxNjggYyAyMS4yODI0MzksLTQyLjk5OTIxIDQ5Ljk0ODU4MSwtODIuMDg5NCA4NC4yNjEwOCwtMTE1LjUzMzIzIDg0LjI2MTA5LC04MC43ODY0IDE5Ny4xODgzMSwtMTI1LjA4ODYyIDMxNC4wMjQ1NiwtMTIzLjM1MTI4IDIxLjI4MjQ0LDAuODY4NjcgNDIuMTMwNTQsMi42MDYwMSA2Mi45Nzg2NCw1LjY0NjM2IDE3LjM3MzQyLDIuMTcxNjggMzMuMDA5NSw1LjIxMjAzIDQxLjI2MTg3LDUuNjQ2MzYgdiAwIGMgMC44Njg2NywwIDEuNzM3MzQsMCAyLjYwNjAyLDAgMjQuMzIyNzgsMCA0NC4zMDIyMSwtMTkuNTQ1MDkgNDQuMzAyMjEsLTQ0LjMwMjIyIDAsLTE5LjExMDc2IC0xMi41OTU3MiwtMzYuNDg0MTgzIC0zMS4yNzIxNSwtNDIuMTMwNTQyIgogICBpZD0icGF0aDUyIgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxwYXRoCiAgIGNsYXNzPSJzdDMiCiAgIGQ9Im0gMzE0LjAyNDU1LDgxLjUyNjg0MiBjIDI1LjE5MTQ2LC02Ljk0OTM2OCA2My40MTI5OCwtMTIuMTYxMzk0IDgzLjM5MjQyLC0xNi4wNzA0MTMgMTcuODA3NzUsLTMuMDQwMzQ4IDI5Ljk2OTE0LC0xOS45Nzk0MzIgMjYuOTI4OCwtMzcuNzg3MTg3IEMgNDIxLjczOTc1LDEyLjkwMTgzNiA0MDkuNTc4MzYsMi4wNDM0NDg4IDM5NC44MTA5NSwwLjMwNjEwNjc5IDM4My41MTgyMywtMC45OTY5MDAyMSAzNjcuMDEzNDgsMi4wNDM0NDg4IDM1MC4wNzQ0LDUuOTUyNDY3OCAzMjAuOTczOTIsMTIuOTAxODM2IDI5My4xNzY0NSwyNC4xOTQ1NTggMjY3LjU1MDY2LDM4Ljk2MTk2NCAxODAuMjQ5MjIsOTEuMDgyMjI3IDE0NC42MzM3MiwxNTEuODg5MTkgMTIwLjc0NTI2LDE5NC44ODg0MSBsIDguMjUyMzgsLTAuNDM0MzQgYyA1MS42ODU5MiwtNTMuODU3NiAxMDkuMDE4MiwtOTEuNjQ0NzkgMTg1LjAyNjkxLC0xMTIuOTI3MjI4IgogICBpZD0icGF0aDU0IgogICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjQuMzQzMzUiIC8+CjxtZXRhZGF0YQogICBpZD0ibWV0YWRhdGE4NzYiPjxyZGY6UkRGPjxjYzpXb3JrCiAgICAgICByZGY6YWJvdXQ9IiI+PGRjOnRpdGxlPk1lc2EgZGUgdHJhYmFqbyAxPC9kYzp0aXRsZT48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PC9zdmc+Cg==', isWhite: true },
    { name: 'Coca-Cola', src: 'https://cdn.simpleicons.org/cocacola', isWhite: true },
    { name: 'Adidas', src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNzI1IiBoZWlnaHQ9IjUwMCI+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNjAsLTQzMCkiIHN0eWxlPSJmaWxsOiMwMDAiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0iTSA1MzMuOTQzNSw3NTYuNzA0NjUgMzg2LjQzMzE4LDUwMC4zNDM3NyA0OTIuNDA0ODMsNDM5LjQ3NTEgbCAxODMuNDI4MywzMTcuMjI5NTUgLTE0MS44ODk2MywwIiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAxNDEuMDM5NTgsNzIwLjc4NjczIDEwNS45NzE2NSwtNjEuMjc5ODUgNTYuMDcwMzcsOTcuMTk3NzcgLTE0MS40NzgzMSwwIC0yMC41NjM3MSwtMzUuOTE3OTIiIC8+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDM0OS4wMDcyNCw5MjAuMjU0NjMgMzAuMTYwMDYsMCAwLC0xMjIuMDExMjUgLTMwLjE2MDA2LDAgMCwxMjIuMDExMjUgeiIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gNzI2Ljk2ODI1LDkyMy4xMzM2NCBjIC0zMy43MjQ1MiwwIC01NC4wMTQxMywtMTcuNDEwNiAtNTUuMTEwODEsLTQxLjk1MDAxIGwgMzEuODA1MjksMCBjIDAsNy42NzcxNSA0Ljc5ODE5LDE4LjkxODYxIDI1LjM2MTkyLDE5LjMyOTk0IDEzLjcwOTEzLDAgMjAuMTUyMzksLTguMDg4NDkgMjAuMTUyMzksLTE0LjEyMDQ3IC0wLjgyMjYxLC05LjU5NjM5IC0xMi44ODY2OCwtMTAuNDE5IC0yNS43NzMyLC0xMi40NzUzNCAtMTIuODg2NTIsLTIuMDU2NCAtMjMuODUzODYsLTQuMzg2OTIgLTMxLjgwNTE4LC04LjQ5OTY2IC0xMC4xNDQ4OCwtNS4yMDk0OCAtMTYuOTk5NDIsLTE2LjQ1MDkzIC0xNi45OTk0MiwtMjkuMzM3NDUgMCwtMjEuNzk3NjcgMTguOTE4NjEsLTM5LjA3MTA1IDUwLjQ0OTY3LC0zOS4wNzEwNSAzMC41NzEzOSwwIDQ5LjkwMTMzLDE2LjAzOTY0IDUxLjk1NzczLDM5Ljg5MzUgbCAtMzAuNzA4NjEsMCBjIC0wLjI3NDEyLC02LjQ0MzI2IC0xLjUwNzksLTE2LjU4Nzk4IC0xOS42MDQwNSwtMTYuNTg3OTggLTEyLjIwMTEzLDAgLTIwLjI4OTQ2LDIuNDY3NTIgLTIwLjk3NTAxLDEwLjk2NzMzIDAsMTIuNDc1MTkgMjUuMzYyMDIsMTEuNjUyNzQgNDUuMTAzMTQsMTYuODYyMTEgMTguOTE4Niw0Ljc5ODMgMzAuOTgyNjcsMTYuNTg4MTQgMzAuOTgyNjcsMzMuMDM5MDcgMCwzMC4yOTcyNyAtMjQuNTM5NDEsNDEuOTUwMDEgLTU0LjgzNjUzLDQxLjk1MDAxIiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAyNjUuMjQ0MzgsNjExLjkzNjIyIDEwNS45NzE2NSwtNjEuMTQyNzggMTE4Ljg1ODIzLDIwNS45MTEyMSAtMTEwLjkwNjk2LDAgMCwzMC4xNjAwNiAtMzAuMTYwMDYsMCAwLC0zMC4yOTcxMiAtODMuNzYyODYsLTE0NC42MzEzNyIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMjY3Ljk4NjIzLDkyMy4xMzM2NCBjIC0zNS4wOTU0MiwwIC02My42MTA0MywtMjguNjUyMjEgLTYzLjYxMDQzLC02My4zMzYxOSAwLC0zNS4wOTU0NyAyOC41MTUwMSwtNjIuNzg3ODUgNjMuNjEwNDMsLTYyLjc4Nzg1IDEzLjI5Nzg2LDAgMjUuMzYxODcsMy41NjQyNSAzNS45MTc5MywxMC44MzAxMiBsIDAsLTUxLjEzNTA3IDMwLjE2MDExLDAgMCwxNjMuNTQ5OTggLTMwLjE2MDExLDAgMCwtOC4wODgzMyBjIC0xMC41NTYwNiw2Ljg1NDU5IC0yMi42MjAwNywxMC45NjczNCAtMzUuOTE3OTMsMTAuOTY3MzQgeiBtIC0zNC42ODQxNCwtNjMuMzM2MTkgYyAwLDE4LjkxODUgMTYuMTc2NzgsMzQuNjgzOTggMzUuNTA2NjUsMzQuNjgzOTggMTguOTE4NjEsMCAzNS4wOTU0MiwtMTUuNzY1NDggMzUuMDk1NDIsLTM0LjY4Mzk4IDAsLTE4LjkxODY2IC0xNi4xNzY4MSwtMzUuMDk1NDcgLTM1LjA5NTQyLC0zNS4wOTU0NyAtMTkuMzI5ODcsMCAtMzUuNTA2NjUsMTYuMTc2ODEgLTM1LjUwNjY1LDM1LjA5NTQ3IiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSA0OTAuODk2ODIsNzU2LjcwNDY1IDI5Ljc0ODgzLDAgMCwxNjMuNTQ5OTggLTI5Ljc0ODgzLDAgMCwtOC4wODgzMyBjIC0xMC4xNDQ3OCw2Ljg1NDU5IC0yMi42MjAwNywxMC45NjczNCAtMzYuMzI5MjEsMTAuOTY3MzQgLTM0LjY4NDE0LDAgLTYzLjE5OTEzLC0yOC42NTIyMSAtNjMuMTk5MTMsLTYzLjMzNjE5IDAsLTM1LjA5NTQ3IDI4LjUxNDk5LC02Mi43ODc4NSA2My4xOTkxMywtNjIuNzg3ODUgMTMuNzA5MTQsMCAyNS43NzMxNSwzLjU2NDI1IDM2LjMyOTIxLDEwLjgzMDEyIGwgMCwtNTEuMTM1MDcgeiBtIC03MC4xOTA3OSwxMDMuMDkyOCBjIDAsMTguOTE4NSAxNi4xNzY3NiwzNC42ODM5OCAzNC42ODQxNCwzNC42ODM5OCAxOS4zMjk4OSwwIDM1LjUwNjY1LC0xNS43NjU0OCAzNS41MDY2NSwtMzQuNjgzOTggMCwtMTguOTE4NjYgLTE2LjE3Njc2LC0zNS4wOTU0NyAtMzUuNTA2NjUsLTM1LjA5NTQ3IC0xOC41MDczOCwwIC0zNC42ODQxNCwxNi4xNzY4MSAtMzQuNjg0MTQsMzUuMDk1NDciIC8+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDU5My45ODk1Niw5MjMuMTMzNjQgYyAtMzQuNTQ3MDMsMCAtNjMuMTk5MTMsLTI4LjY1MjIxIC02My4xOTkxMywtNjMuMzM2MTkgMCwtMzUuMDk1NDcgMjguNjUyMSwtNjIuNzg3ODUgNjMuMTk5MTMsLTYyLjc4Nzg1IDEzLjI5NzkxLDAgMjUuNzczMSwzLjU2NDI1IDM1LjkxNzk4LDEwLjgzMDEyIGwgMCwtOS43MzM0IDMwLjE2MDA2LDAgMCwxMjIuMTQ4MzEgLTMwLjE2MDA2LDAgMCwtOC4wODgzMyBjIC0xMC4xNDQ4OCw2Ljg1NDU5IC0yMi4yMDg3OSwxMC45NjczNCAtMzUuOTE3OTgsMTAuOTY3MzQgeiBtIC0zMy44NjE1OCwtNjMuMzM2MTkgYyAwLDE4LjkxODUgMTYuMTc2NzYsMzQuNjgzOTggMzUuMDk1MzcsMzQuNjgzOTggMTguOTE4NjYsMCAzNC42ODQxOSwtMTUuNzY1NDggMzQuNjg0MTksLTM0LjY4Mzk4IDAsLTE4LjkxODY2IC0xNS43NjU1MywtMzUuMDk1NDcgLTM0LjY4NDE5LC0zNS4wOTU0NyAtMTguOTE4NjEsMCAtMzUuMDk1MzcsMTYuMTc2ODEgLTM1LjA5NTM3LDM1LjA5NTQ3IiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSA5My40Njg4NjYsODU5Ljc5NzQ1IGMgMCwxOC45MTg1IDE2LjE3Njc4NCwzNC42ODM5OCAzNS4wOTU0MDQsMzQuNjgzOTggMTkuMzI5ODcsMCAzNS41MDY2NiwtMTUuNzY1NDggMzUuNTA2NjYsLTM0LjY4Mzk4IDAsLTE4LjkxODY2IC0xNi4xNzY3OSwtMzUuMDk1NDcgLTM1LjUwNjY2LC0zNS4wOTU0NyAtMTguOTE4NjIsMCAtMzUuMDk1NDA0LDE2LjE3NjgxIC0zNS4wOTU0MDQsMzUuMDk1NDcgeiBtIDM0LjI3Mjg0NCw2My4zMzYxOSBjIC0zNC42ODQxMjQsMCAtNjMuMzM2MjE4LC0yOC42NTIyMSAtNjMuMzM2MjE4LC02My4zMzYxOSAwLC0zNS4wOTU0NyAyOC42NTIwOTQsLTYyLjc4Nzg1IDYzLjMzNjIxOCwtNjIuNzg3ODUgMTMuMjk3ODcsMCAyNS43NzMxOSwzLjU2NDI1IDM2LjMyOTIyLDEwLjgzMDEyIGwgMCwtOS43MzM0IDI5Ljc0ODgzLDAgMCwxMjIuMTQ4MzEgLTI5Ljc0ODgzLDAgMCwtOC4wODgzMyBjIC0xMC4xNDQ3NSw2Ljg1NDU5IC0yMi42MjAwOCwxMC45NjczNCAtMzYuMzI5MjIsMTAuOTY3MzQiIC8+CiAgPC9nPgo8L3N2Zz4=', isWhite: true },
    { name: 'BBVA', src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsKCTwhRU5USVRZIG5zX2V4dGVuZCAiaHR0cDovL25zLmFkb2JlLmNvbS9FeHRlbnNpYmlsaXR5LzEuMC8iPgoJPCFFTlRJVFkgbnNfYWkgImh0dHA6Ly9ucy5hZG9iZS5jb20vQWRvYmVJbGx1c3RyYXRvci8xMC4wLyI+Cgk8IUVOVElUWSBuc19ncmFwaHMgImh0dHA6Ly9ucy5hZG9iZS5jb20vR3JhcGhzLzEuMC8iPgoJPCFFTlRJVFkgbnNfdmFycyAiaHR0cDovL25zLmFkb2JlLmNvbS9WYXJpYWJsZXMvMS4wLyI+Cgk8IUVOVElUWSBuc19pbXJlcCAiaHR0cDovL25zLmFkb2JlLmNvbS9JbWFnZVJlcGxhY2VtZW50LzEuMC8iPgoJPCFFTlRJVFkgbnNfc2Z3ICJodHRwOi8vbnMuYWRvYmUuY29tL1NhdmVGb3JXZWIvMS4wLyI+Cgk8IUVOVElUWSBuc19jdXN0b20gImh0dHA6Ly9ucy5hZG9iZS5jb20vR2VuZXJpY0N1c3RvbU5hbWVzcGFjZS8xLjAvIj4KCTwhRU5USVRZIG5zX2Fkb2JlX3hwYXRoICJodHRwOi8vbnMuYWRvYmUuY29tL1hQYXRoLzEuMC8iPgpdPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxpdmVsbG9fMSIgeG1sbnM6eD0iJm5zX2V4dGVuZDsiIHhtbG5zOmk9IiZuc19haTsiIHhtbG5zOmdyYXBoPSImbnNfZ3JhcGhzOyIKCSB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDM1NDMuMiAxMDU5LjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU0My4yIDEwNTkuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiMwMDQ1ODA7fQo8L3N0eWxlPgo8bWV0YWRhdGE+Cgk8c2Z3ICB4bWxucz0iJm5zX3NmdzsiPgoJCTxzbGljZXM+PC9zbGljZXM+CgkJPHNsaWNlU291cmNlQm91bmRzICBib3R0b21MZWZ0T3JpZ2luPSJ0cnVlIiBoZWlnaHQ9IjEwNTkuNSIgd2lkdGg9IjM1NDMuMiIgeD0iLTY4My43IiB5PSItMTExOS4yIj48L3NsaWNlU291cmNlQm91bmRzPgoJPC9zZnc+CjwvbWV0YWRhdGE+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02NDIuNiw1NjEuNmMxMS42LDMuOSwyNS4xLDkuNyw0MC41LDE3LjRjMjcsMTUuNSw1MC4xLDM2LjcsNjkuNSw2My43YzIzLjIsMzguNiwzNC43LDg0LjksMzQuNywxMzguOQoJYzAsMTg1LjMtMTEyLDI3Ny45LTMzNS44LDI3Ny45SDE3LjRjLTExLjYsMC0xNy40LTUuOC0xNy40LTE3LjRWMTUwLjVjMC0xMS42LDUuOC0xNy40LDE3LjQtMTcuNGg0NTcuNAoJYzgxLjEsMCwxNDYuNiwyMi4zLDE5Ni44LDY2LjZjNTAuMSw0NC40LDc1LjMsMTAzLjMsNzUuMywxNzYuNmMwLDQyLjUtOS43LDgwLjEtMjguOSwxMTIuOUM2OTguNiw1MjIuMSw2NzMuNSw1NDYuMiw2NDIuNiw1NjEuNnoKCSBNNDQ1LjgsOTI2LjNjNjUuNiwwLDExMy44LTEwLjYsMTQ0LjctMzEuOGMzMC44LTIxLjIsNDYuMy01Ny45LDQ2LjMtMTEwYzAtNTIuMS0xNS41LTg4LjctNDYuMy0xMTAKCWMtMzAuOS0yMS4yLTc5LjItMzEuOC0xNDQuNy0zMS44SDE3My43Yy0xNS41LDAtMjMuMiw1LjgtMjMuMiwxNy40djI0OWMwLDExLjYsNy43LDE3LjQsMjMuMiwxNy40SDQ0NS44eiBNMTczLjcsMjY2LjMKCWMtMTEuNiwwLTE3LjQsNS44LTE3LjQsMTcuNHYyMDguNGMwLDExLjYsNS44LDE3LjQsMTcuNCwxNy40SDQ0MGMxMDAuMywwLDE1MC41LTQwLjUsMTUwLjUtMTIxLjZjMC04MS4xLTUwLjItMTIxLjYtMTUwLjUtMTIxLjYKCUgxNzMuN3ogTTE1ODAuNiw1NjEuNmMxMS42LDMuOSwyMy4yLDkuNywzNC43LDE3LjRjMzAuOCwxNS41LDU0LDM2LjcsNjkuNSw2My43YzI3LDM4LjYsNDAuNSw4NC45LDQwLjUsMTM4LjkKCWMwLDE4NS4zLTExMiwyNzcuOS0zMzUuOCwyNzcuOUg5NTUuM2MtMTEuNiwwLTE3LjQtNS44LTE3LjQtMTcuNFYxNTAuNWMwLTExLjYsNS44LTE3LjQsMTcuNC0xNy40aDQ1Ny40CgljNzcuMiwwLDE0MS44LDIyLjMsMTk0LDY2LjZjNTIuMSw0NC40LDc4LjIsMTAzLjMsNzguMiwxNzYuNmMwLDQyLjUtOS43LDgwLjEtMjguOSwxMTIuOUMxNjM2LjUsNTIyLjEsMTYxMS40LDU0Ni4yLDE1ODAuNiw1NjEuNnoKCSBNMTEwNS44LDI2Ni4zYy0xMS42LDAtMTcuNCw1LjgtMTcuNCwxNy40djIwOC40YzAsMTEuNiw1LjgsMTcuNCwxNy40LDE3LjRoMjcyLjFjMTAwLjMsMCwxNTAuNS00MC41LDE1MC41LTEyMS42CgljMC04MS4xLTUwLjItMTIxLjYtMTUwLjUtMTIxLjZIMTEwNS44eiBNMTM4My43LDkyNi4zYzY1LjYsMCwxMTMuOC0xMC42LDE0NC43LTMxLjhjMzAuOC0yMS4yLDQ2LjMtNTcuOSw0Ni4zLTExMAoJYzAtNTIuMS0xNS41LTg4LjctNDYuMy0xMTBjLTMwLjktMjEuMi03OS4yLTMxLjgtMTQ0LjctMzEuOGgtMjc3LjljLTExLjYsMC0xNy40LDUuOC0xNy40LDE3LjR2MjQ5YzAsMTEuNiw1LjgsMTcuNCwxNy40LDE3LjQKCUgxMzgzLjd6IE0yNTUzLjIsMTQ0LjdjMy44LTcuNyw3LjctMTEuNiwxMS42LTExLjZoMTUwLjVjMy44LDAsNy43LDIsMTEuNiw1LjhjMy44LDMuOSwzLjgsNy44LDAsMTEuNmwtNDgwLjUsOTAzLjIKCWMtMy45LDMuOS04LjcsNS44LTE0LjUsNS44Yy01LjgsMC0xMC43LTEuOS0xNC41LTUuOGwtNDgwLjUtOTAzLjJjLTMuOS0zLjgtNC45LTcuNy0yLjktMTEuNmMxLjktMy44LDYuNy01LjgsMTQuNS01LjhoMTQ0LjcKCWM3LjcsMCwxMy41LDMuOSwxNy40LDExLjZsMzA2LjgsNTc5YzAsMy45LDMuOCw1LjgsMTEuNiw1LjhjNy43LDAsMTMuNS0xLjksMTcuNC01LjhMMjU1My4yLDE0NC43eiBNMjcyNi45LDkxNC44CgljLTMuOSw3LjgtOS43LDExLjYtMTcuNCwxMS42SDI1NTljLTMuOSwwLTYuOC0xLjktOC43LTUuOGMtMi0zLjgtMi45LTcuNy0yLjktMTEuNkwzMDI4LDUuOGMzLjgtMy44LDkuNi01LjgsMTcuNC01LjgKCWM3LjcsMCwxMy41LDIsMTcuNCw1LjhMMzU0My4yLDkwOWMwLDMuOS0xLDcuOC0yLjksMTEuNmMtMiwzLjktNC45LDUuOC04LjcsNS44aC0xNTAuNWMtNy44LDAtMTMuNi0zLjgtMTcuNC0xMS42bC0zMDEuMS01NzkKCWMtMy45LTcuNy05LjctMTEuNi0xNy40LTExLjZjLTcuOCwwLTEzLjYsMy45LTE3LjQsMTEuNkwyNzI2LjksOTE0Ljh6Ii8+Cjwvc3ZnPgo=', isWhite: true },
  ];

  return (
    <section className="py-16 bg-[#050505] relative z-10 flex flex-col items-center">
      <p className="text-white/40 text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-12 text-center px-4">
        Organizaciones que confían en nosotros
      </p>
      
      <div className="w-full relative flex overflow-hidden">
        {/* Fade masks */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex whitespace-nowrap gap-20 md:gap-32 items-center pl-20 md:pl-32 will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        >
          {[...clients, ...clients, ...clients, ...clients].map((client, i) => (
            <div key={i} className="flex-shrink-0 flex items-center justify-center transition-all duration-500 cursor-pointer group hover:scale-105 mx-6 w-24 md:w-36 h-16 md:h-20">
              <img 
                src={client.src} 
                alt={client.name} 
                className={`w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity ${client.name === 'Coca-Cola' ? 'scale-150 md:scale-[1.7]' : ''}`}
                style={{ filter: "brightness(0) invert(1)" }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-sm md:text-base text-center">${client.name}</span>`;
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// --- Innogyzer Fluid Background (For content below Hero) ---
const FluidBlueBackground = () => {
  const logoColors = {
    pink: '#ec4899',
    yellow: '#eab308',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6'
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-[-1] bg-[#030305] overflow-clip">
      <div className="sticky top-0 w-full h-screen">
        
        {/* Glow 1 (Top Left) */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
            backgroundColor: [logoColors.pink, logoColors.yellow, logoColors.green, logoColors.blue, logoColors.purple, logoColors.pink],
            x: [0, 50, -50, 0],
            y: [0, 50, -50, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20vh] -left-[10vw] w-[60vw] h-[60vh] rounded-full blur-[150px] mix-blend-screen"
        />

        {/* Glow 2 (Top Right) */}
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.2, 0.05],
            backgroundColor: [logoColors.yellow, logoColors.green, logoColors.blue, logoColors.purple, logoColors.pink, logoColors.yellow],
            x: [0, -60, 60, 0],
            y: [0, 60, -60, 0]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10vh] -right-[10vw] w-[50vw] h-[50vh] rounded-full blur-[160px] mix-blend-screen"
        />

        {/* Glow 3 (Bottom Left) */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
            backgroundColor: [logoColors.green, logoColors.blue, logoColors.purple, logoColors.pink, logoColors.yellow, logoColors.green],
            x: [0, 80, -80, 0],
            y: [0, -80, 80, 0]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20vh] -left-[10vw] w-[70vw] h-[70vh] rounded-full blur-[180px] mix-blend-screen"
        />

        {/* Glow 4 (Bottom Right) */}
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.3, 0.1],
            backgroundColor: [logoColors.blue, logoColors.purple, logoColors.pink, logoColors.yellow, logoColors.green, logoColors.blue],
            x: [0, -100, 100, 0],
            y: [0, -50, 50, 0]
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10vh] -right-[20vw] w-[80vw] h-[80vh] rounded-full blur-[200px] mix-blend-screen"
        />

        {/* Prominent Stardust (Layer 1) */}
        <motion.div 
          animate={{ y: [0, -1000] }} 
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-[200%]" 
          style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px, #a5f3fc, rgba(0,0,0,0)), radial-gradient(2px 2px at 80px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 150px 60px, #a5f3fc, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 220px 200px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 300px 90px, #a5f3fc, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '400px 400px', opacity: 0.5 }} 
        />

        {/* Prominent Stardust (Layer 2 - Slower) */}
        <motion.div 
          animate={{ y: [0, -500] }} 
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-[200%]" 
          style={{ backgroundImage: 'radial-gradient(1px 1px at 50px 50px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 180px 250px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 350px 150px, #a5f3fc, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '500px 500px', opacity: 0.3 }} 
        />
      </div>
    </div>
  );
};

// --- Home Route ---
const Home = () => {
  // Handle hash scrolling when returning to home from another route
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <>
      <main className="relative z-10">
        <Hero />
      </main>
      <div className="relative z-20">
        <FluidBlueBackground />
        
        {/* Soft transition gradient to blend Hero into the colorful background */}
        <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none z-[1]" />
        
        <Manifesto />
        <About />
        <Pillars />
        <Services />
        <ServicesAI />
        <PartnersMarquee />
        <ClientsMarquee />
        <Team />
        <Testimonials />
      </div>
    </>
  );
};

// --- Service Detail Route ---
const ServicePage = () => {
  const { id } = useParams();
  
  // A mock database of services to display dynamic content
  const serviceData: Record<string, any> = {
    'investigacion-y-insights': { title: 'Investigación & Insights', subtitle: 'Conoce profundamente a tu cliente', details: 'Descubrimos lo que realmente impulsa las decisiones de tus clientes para identificar oportunidades de innovación ocultas que tu competencia no está viendo.' },
    'designing-strategy': { title: 'Designing Strategy', subtitle: 'Alineación de objetivos y capacidades', details: 'Diseñamos estrategias ganadoras para tu organización alineando objetivos, recursos y capacidades para asegurar un crecimiento a largo plazo.' },
    'design-sprints': { title: 'Design Sprints', subtitle: 'Innovación en 5 días', details: 'Resolvemos grandes desafíos e impulsamos la innovación probando soluciones reales con usuarios reales en solo 5 días de trabajo intensivo y focalizado.' },
    'coolture-sprint': { title: 'Coolture Sprint', subtitle: 'Transforma el ADN de tu equipo', details: 'Transformamos tu organización para que la innovación sea parte del ADN de tu equipo. Fomentamos un entorno de colaboración y experimentación.' },
    'business-design': { title: 'Business Design', subtitle: 'Modelos de negocio sostenibles', details: 'Diseñamos modelos de negocio y propuestas de valor innovadoras y sostenibles que generan valor a largo plazo y rentabilidad medible.' },
    'experimentacion': { title: 'Experimentación', subtitle: 'Aprende rápido, falla barato', details: 'Validamos tus ideas de negocio de manera ágil y efectiva reduciendo la incertidumbre mediante pilotos y pruebas MVP iterativas.' },
    'ai-consulting': { title: 'Consultoría IA', subtitle: 'Implementa IA en tus procesos', details: '¿Necesitas transformar tus procesos con IA? Nuestro equipo de expertos diseña soluciones a medida que se integran perfectamente con los flujos de trabajo de tu industria.' },
    'business-automation': { title: 'Automatización Empresarial', subtitle: 'El futuro del trabajo', details: 'Dale un respiro a tu equipo. Permite que la IA gestione las tareas repetitivas y minimice los errores, mientras tu empresa se enfoca en estrategias de alto impacto.' },
    'ai-training': { title: 'Capacitación IA', subtitle: 'Potencia las habilidades de tu equipo', details: 'Ofrecemos programas de capacitación y talleres prácticos para dominar las herramientas de Inteligencia Artificial que transformarán la manera en la que trabajan.' },
  };

  const service = serviceData[id as string] || { title: 'Servicio no encontrado', subtitle: '', details: 'Lo sentimos, la información solicitada no está disponible.' };

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when loading a new page
  }, [id]);

  return (
    <div className="relative z-10 min-h-screen pt-40 pb-32">
      <FluidBlueBackground />
      <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-12 md:p-20 rounded-[40px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ArrowRightIcon className="w-4 h-4 rotate-180" />
            Volver al inicio
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">{service.title}</h1>
          <h2 className="text-2xl text-primary font-medium mb-12">{service.subtitle}</h2>
          
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light text-left mb-16">
            {service.details}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 text-left mb-16">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4 p-6 bg-black/20 rounded-2xl border border-white/5">
                <CheckCircleIcon className="w-6 h-6 text-primary shrink-0" />
                <p className="text-white/80">Beneficio clave estructurado y garantizado para el éxito empresarial.</p>
              </div>
            ))}
          </div>

          <Magnetic>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} className="btn-shine px-10 py-5 bg-primary text-black font-bold rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(220,234,34,0.3)] text-lg hover:scale-105">
              Hablar con un experto en {service.title}
            </button>
          </Magnetic>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main App Wrapper ---
const AppContent = () => {
  const location = useLocation();
  const isBlogPost = location.pathname.startsWith('/blog/') && location.pathname.length > 6;

  return (
    <div className="min-h-screen bg-[#030305] text-white relative flex flex-col">
      <AnimatedBackground showParticles={!isBlogPost} />
      <Navbar />
      <ContactModal />
      
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios/:id" element={<ServicePage />} />
          <Route path="/aviso-privacidad" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
};

const PartnersMarquee = () => {
  return (
    <section className="py-16 relative z-10 bg-black/40">
      <div className="container mx-auto px-6 relative z-20">
        <div className="glass-panel rounded-[2.5rem] border border-white/10 py-6 md:py-8 relative overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">
          <h3 className="text-center text-[#dcea22] text-xs font-bold tracking-[0.3em] uppercase mb-2">Partners</h3>
          <p className="text-center text-[#dcea22] text-xs font-bold tracking-[0.3em] uppercase mb-6 md:mb-8">Estas empresas nos respaldan:</p>

          {/* Infinite Marquee */}
          <div className="overflow-hidden w-full">
            <div className="flex animate-marquee whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity duration-700 will-change-transform">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="inline-flex items-center justify-center mx-16 gap-32">
                  
                  {/* Google for Startups Logo */}
                  <div className="flex-shrink-0 flex items-center justify-center w-[200px] md:w-[300px] h-[100px] md:h-[120px]">
                    <img 
                      src="/assets/Logo_for_Google_for_Startups_page.png" 
                      alt="Google for Startups" 
                      className="w-full h-full object-contain scale-110 md:scale-125 hover:scale-125 md:hover:scale-150 transition-all duration-300 brightness-0 invert opacity-80 hover:opacity-100"
                    />
                  </div>

                  <div className="w-1.5 h-1.5 rounded-full bg-[#dcea22]/30"></div>

                  {/* Claude Partner Network Logo */}
                  <div className="flex-shrink-0 flex items-center justify-center w-[200px] md:w-[300px] h-[100px] md:h-[120px]">
                    <img 
                      src="/assets/partenr.svg" 
                      alt="Claude Partner Network" 
                      className="w-full h-full object-contain scale-110 md:scale-125 hover:scale-125 md:hover:scale-150 transition-all duration-300 brightness-0 invert opacity-80 hover:opacity-100"
                    />
                  </div>

                  <div className="w-1.5 h-1.5 rounded-full bg-[#dcea22]/30"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function App() {
  useSmoothScroll(); // Initialize Lenis

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
