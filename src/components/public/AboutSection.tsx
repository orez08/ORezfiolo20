import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AboutContent } from '../../types.ts';
import { trackSectionView } from '../../utils/analyticsTracker.ts';

interface CountUpProps {
  value: string;
}

const CountUpNumber: React.FC<CountUpProps> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(value);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;

    // Match numbers in strings like "20+", "100%", "$50K", "5+ Years", "4.8"
    const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const rawNumStr = match[2].replace(/,/g, '');
    const targetNum = parseFloat(rawNumStr);
    const suffix = match[3] || '';

    if (isNaN(targetNum) || targetNum === 0) {
      setDisplayValue(value);
      return;
    }

    const hasDecimals = rawNumStr.includes('.');
    const decimalPlaces = hasDecimals ? rawNumStr.split('.')[1].length : 0;

    // Scale duration proportionally to target number for fast snappy cadence (600ms - 1400ms)
    const duration = Math.min(Math.max(targetNum * 25, 600), 1400);

    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Smooth Ease-Out Quadratic formula
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const currentNum = easeOut * targetNum;

      const formattedVal = hasDecimals
        ? currentNum.toFixed(decimalPlaces)
        : Math.round(currentNum).toString();

      setDisplayValue(`${prefix}${formattedVal}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasAnimated, value]);

  return <span ref={ref}>{displayValue}</span>;
};

interface AboutSectionProps {
  about: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackSectionView('about');
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/14 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16 border-b border-white/14 pb-6"
        >
          <span className="font-sans text-xs sm:text-sm font-semibold text-[#E8746A] tracking-wider">
            {about.sectionNumber || '02'}
          </span>
          <div className="h-px w-8 bg-[#E8746A]" />
          <h2 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/70">
            {about.title || 'About ORez'}
          </h2>
        </motion.div>

        {/* Editorial Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Portrait with Offset Frame & Architectural Image Mask */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative group"
          >
            {/* Offset Decorative Thin Line Frame */}
            <div className="absolute -inset-3 sm:-inset-4 border border-[#8B1E1E]/50 rounded-sm pointer-events-none transition-transform duration-500 group-hover:scale-[1.01] group-hover:border-[#E8746A]/60" />
            
            <div className="relative rounded-sm overflow-hidden glass-surface">
              {/* Image with subtle zoom on hover */}
              <div className="aspect-[4/5] overflow-hidden bg-black/40 relative">
                <img
                  src={about.portraitUrl || '/src/assets/images/orez_portrait_1789901819865.jpg'}
                  alt="Awotimiro Moses Oreoluwa (ORez)"
                  className="w-full h-full object-cover object-center filter grayscale contrast-[1.08] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to high-res editorial portrait if local image fails
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                
                {/* Subtle dark gradient overlay on bottom of image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/14 text-[11px] font-sans tracking-wider text-white uppercase">
                    {about.portraitBadge || 'Creative & Visual Director'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#E8746A] shadow-[0_0_8px_#E8746A]" />
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 border-t border-white/14 bg-black/40 text-left">
                <p className="font-sans text-xs text-white/70 uppercase tracking-wide">
                  {about.portraitCaption || 'Awotimiro Moses Oreoluwa — Lead Designer & Brand Architect'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Bio with heavier readability backing */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col justify-between bg-black/40 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-sm border border-white/14"
          >
            <div>
              {/* Editorial Intro Headline */}
              <h3 className="font-display font-medium text-2xl sm:text-3xl md:text-4xl text-white leading-[1.2] tracking-tight mb-8">
                {about.introHeading || 'Strategic visual thinking that translates directly into commercial momentum.'}
              </h3>

              {/* Strict First-Person Copy as requested */}
              <div className="space-y-6 text-base sm:text-lg text-white/85 font-normal leading-relaxed mb-10">
                <p className="border-l-2 border-[#E8746A] pl-4 text-white font-medium">
                  {about.mainBio}
                </p>
                <p className="text-white/80 text-base leading-relaxed">
                  {about.secondaryBio}
                </p>
              </div>

              {/* Discipline / Skill Chips */}
              <div className="mb-8">
                <div className="text-xs uppercase tracking-widest text-[#E8746A] font-semibold mb-3 font-sans">
                  Core Disciplines & Specialties
                </div>
                <div className="flex flex-wrap gap-2">
                  {about.disciplineChips?.map((chip) => (
                    <motion.span
                      key={chip}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="px-3 py-1.5 rounded-full glass-surface text-white text-xs sm:text-[13px] font-medium hover:border-[#E8746A] hover:text-[#E8746A] transition-colors cursor-default"
                    >
                      {chip}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Accent Separator Line */}
            <div className="w-full h-px bg-gradient-to-r from-[#8B1E1E] via-[#E8746A]/50 to-transparent my-4" />
          </motion.div>
        </div>

        {/* Stats Row (Large numbers with small captions) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 },
            },
          }}
          id="about-stats-row"
          className="mt-16 pt-12 border-t border-white/14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
        >
          {about.stats?.map((stat) => (
            <motion.div
              key={stat.id}
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-4 sm:p-6 rounded-sm glass-surface hover:border-[#E8746A]/60 transition-all duration-300 group"
            >
              <div className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-white group-hover:text-[#E8746A] transition-colors mb-2">
                <CountUpNumber value={stat.value} />
              </div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#E8746A] mb-1">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-xs text-white/70 font-normal leading-normal">
                  {stat.description}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
