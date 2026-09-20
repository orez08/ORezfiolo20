import React from 'react';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { HeroContent } from '../../types.ts';
import { trackAction } from '../../utils/analyticsTracker.ts';

interface HeroProps {
  hero: HeroContent;
}

export const Hero: React.FC<HeroProps> = ({ hero }) => {
  const handlePrimaryClick = () => {
    trackAction('cta_click', {
      section: 'hero',
      details: 'Clicked primary CTA: "Let\'s Work Together"',
    });
  };

  const handleSecondaryClick = () => {
    trackAction('cta_click', {
      section: 'hero',
      details: 'Clicked secondary CTA: "View Selected Work"',
    });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[95vh] flex flex-col justify-center items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#100103] via-[#0A0405] to-[#140608]"
    >
      {/* Background ambient red neon glow circles */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E8746A]/20 rounded-full blur-[130px] pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center text-center relative z-10"
      >
        {/* Discipline / Title Tagline */}
        <motion.div
          id="hero-discipline-tag"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-surface-glow text-[#F5F1EA] text-xs sm:text-[13px] font-medium tracking-wide uppercase mb-10 shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-[#E8746A]" />
          <span>{hero.tagline || 'Creative • Brand Designer • Visual Designer'}</span>
        </motion.div>

        {/* Oversized Core Statement Headline */}
        <motion.h1
          id="hero-statement-headline"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
          }}
          className="font-display font-medium text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.05] tracking-tight text-white max-w-4xl mx-auto mb-8"
        >
          {hero.statementPrefix}{' '}
          <span className="relative inline-block text-[#E8746A] font-semibold underline decoration-[#8B1E1E] underline-offset-8">
            {hero.statementHighlight}
          </span>
          {hero.statementSuffix}
        </motion.h1>

        {/* Subtitle / Voice: ONE highly capable individual */}
        <motion.p
          id="hero-subtext-description"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-normal leading-relaxed mb-12"
        >
          {hero.subtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
        >
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            id="hero-primary-cta"
            href="#contact"
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#E8746A] text-black font-semibold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_24px_rgba(232,116,106,0.5)] group"
          >
            <Sparkles className="w-4 h-4" />
            <span>{hero.ctaPrimaryText || "Let's Work Together"}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            id="hero-whatsapp-cta"
            href="https://wa.me/2348165462205"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAction('cta_click', { section: 'hero', details: 'Clicked Hire Me' })}
            style={{ fontFamily: "'Poppins', sans-serif" }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#8B1E1E]/20 hover:bg-[#8B1E1E]/40 border border-[#E8746A]/30 hover:border-[#E8746A] text-white font-semibold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg group backdrop-blur-md"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.152 4.208 4.298-1.127.398.243z"/>
            </svg>
            <span>Hire Me</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            id="hero-secondary-cta"
            href="#work"
            onClick={handleSecondaryClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass-surface text-white font-medium text-sm uppercase tracking-wider hover:border-[#E8746A] hover:text-[#E8746A] transition-all duration-300"
          >
            <span>{hero.ctaSecondaryText || 'View Selected Work'}</span>
            <ArrowDown className="w-4 h-4" />
          </motion.a>
        </motion.div>

        {/* Floating / Reference Badges Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, staggerChildren: 0.1 },
            },
          }}
          id="hero-floating-badges"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-6 border-t border-white/10"
        >
          {hero.floatingBadges?.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-4 rounded-xl glass-surface hover:border-[#E8746A] hover:shadow-[0_0_20px_rgba(232,116,106,0.35)] transition-all duration-300 text-left group hud-frame"
            >
              <div className="text-[11px] uppercase tracking-wider text-[#E8746A] font-semibold mb-1 flex items-center justify-between">
                <span>{badge.label}</span>
                <span className="w-2 h-2 rounded-full bg-[#E8746A] shadow-[0_0_8px_#E8746A]" />
              </div>
              <div className="text-xs sm:text-sm font-medium text-white/90">
                {badge.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Animated Minimal Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-16 flex flex-col items-center gap-2 text-white/40 hover:text-white/80 transition-colors"
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-[11px] uppercase tracking-widest font-medium"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#E8746A]" />
        </a>
      </motion.div>
    </section>
  );
};
