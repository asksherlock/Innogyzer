import { motion } from 'framer-motion';

export const SvgRings = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}
    animate={{ rotate: [0, 180, 360] }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  >
    <motion.circle 
      cx="40" cy="50" r="20" 
      animate={{ cx: [40, 30, 40, 50, 40] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle 
      cx="60" cy="50" r="20" 
      animate={{ cx: [60, 70, 60, 50, 60] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.line 
      x1="10" y1="50" x2="90" y2="50" 
      animate={{ scaleX: [1, 0.5, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: 'center' }}
    />
  </motion.svg>
);

export const SvgArrows = ({ className }: { className?: string }) => (
  <motion.svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    {[30, 50, 70].map((x, i) => (
      <motion.g 
        key={x}
        animate={{ y: [0, -10, 0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
      >
        <path d={`M${x} 80 L${x} 30 L${x-10} 40 M${x} 30 L${x+10} 40`} />
      </motion.g>
    ))}
    <line x1="10" y1="90" x2="90" y2="90" />
  </motion.svg>
);

export const SvgFaceCursor = ({ className }: { className?: string }) => (
  <motion.svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    <motion.circle 
      cx="45" cy="45" r="25" 
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: '45px 45px' }}
    />
    <motion.path 
      d="M35 50 Q45 60 55 50" 
      animate={{ d: ["M35 50 Q45 60 55 50", "M35 48 Q45 65 55 48", "M35 50 Q45 60 55 50"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path 
      d="M60 60 L85 85 L75 85 L85 100 L75 105 L65 90 L55 100 Z" 
      fill="currentColor" stroke="none"
      animate={{ x: [0, 5, -5, 0], y: [0, 5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.svg>
);

export const SvgAsterisk = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}
    animate={{ rotate: 360 }}
    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
  >
    {[0, 45, 90, 135].map((angle, i) => (
      <motion.line 
        key={angle}
        x1="50" y1="10" x2="50" y2="90" 
        style={{ transformOrigin: 'center', rotate: angle }}
        animate={{ scaleY: [1, 0.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
      />
    ))}
  </motion.svg>
);

export const SvgVenn = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}
    animate={{ rotate: -360 }}
    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
  >
    <motion.circle 
      cx="50" cy="40" r="25" 
      animate={{ cx: [50, 40, 60, 50], cy: [40, 50, 50, 40] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    <motion.circle 
      cx="40" cy="60" r="25" 
      animate={{ cx: [40, 60, 50, 40], cy: [60, 50, 40, 60] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    <motion.circle 
      cx="60" cy="60" r="25" 
      animate={{ cx: [60, 50, 40, 60], cy: [60, 40, 50, 60] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
  </motion.svg>
);

export const SvgFlower = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}
    animate={{ rotate: 360 }}
    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
  >
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const angle = (i * Math.PI) / 4;
      const x = 50 + Math.cos(angle) * 20;
      const y = 50 + Math.sin(angle) * 20;
      return (
        <motion.circle 
          key={i} cx={50} cy={50} r={20}
          animate={{ cx: [50, x, 50], cy: [50, y, 50] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      );
    })}
  </motion.svg>
);

export const SvgStarburst = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className={className}
    animate={{ rotate: -360 }}
    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
  >
    {[...Array(16)].map((_, i) => {
      const angle = (i * Math.PI) / 8;
      const x1 = 50 + Math.cos(angle) * 5;
      const y1 = 50 + Math.sin(angle) * 5;
      const x2 = 50 + Math.cos(angle) * 45;
      const y2 = 50 + Math.sin(angle) * 45;
      return (
        <motion.line 
          key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
          animate={{ 
            x1: [50, x1, 50], y1: [50, y1, 50],
            x2: [50, x2, 50], y2: [50, y2, 50]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      );
    })}
    <motion.circle 
      cx="50" cy="50" r="2" fill="currentColor" 
      animate={{ r: [2, 10, 2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.svg>
);
