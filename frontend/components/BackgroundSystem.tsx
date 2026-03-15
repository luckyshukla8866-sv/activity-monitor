'use client';
import { motion } from 'framer-motion';

export default function BackgroundSystem() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#070714]">
      {/* Top glow */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.15), transparent 65%)'
        }}
      />
      {/* Grid */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px'
        }}
      />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      {/* Orbs */}
      <div 
        className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent)', animation: 'orbFloat 22s ease-in-out infinite alternate', '--ox': '40px', '--oy': '30px' } as React.CSSProperties}
      />
      <div 
        className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.14), transparent)', animation: 'orbFloat 18s ease-in-out infinite alternate-reverse', '--ox': '-30px', '--oy': '40px' } as React.CSSProperties}
      />
      <div 
        className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent)', animation: 'orbFloat 26s ease-in-out infinite alternate', '--ox': '20px', '--oy': '-40px' } as React.CSSProperties}
      />
      <div 
        className="absolute top-[20%] right-[40%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.10), transparent)', animation: 'orbFloat 24s ease-in-out infinite alternate-reverse', '--ox': '-40px', '--oy': '-20px' } as React.CSSProperties}
      />
    </div>
  );
}
