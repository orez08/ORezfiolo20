import React from 'react';
import { motion } from 'framer-motion';

interface ClientMarqueeProps {
  clients?: string[];
}

export const ClientMarquee: React.FC<ClientMarqueeProps> = ({
  clients = [
    'KINETIX LABS',
    'VANGUARD VENTURES',
    'AURA SYSTEMS',
    'NOVA CAPITAL',
    'MONOLITH STUDIOS',
    'SYNAPSE TECH',
    'LUMINA LIVING',
  ],
}) => {
  // Repeat items for seamless continuous looping
  const repeated = [...clients, ...clients, ...clients, ...clients];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      id="client-marquee-banner"
      className="w-full py-4 border-b border-white/14 bg-black/40 backdrop-blur-sm overflow-hidden relative select-none"
    >
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {repeated.map((client, idx) => (
          <div
            key={`${client}-${idx}`}
            className="flex items-center gap-12 text-white/50 hover:text-white transition-colors"
          >
            <span className="font-display text-xs sm:text-sm font-semibold tracking-widest uppercase">
              {client}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8746A]/70" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};
