import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Capability } from '../../types.ts';
import { trackSectionView, trackAction } from '../../utils/analyticsTracker.ts';

interface CapabilitiesSectionProps {
  capabilities: Capability[];
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackSectionView('capabilities');
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const published = capabilities
    .filter((c) => c.published !== false)
    .sort((a, b) => a.order - b.order);

  const handleCapabilityClick = (cap: Capability) => {
    trackAction('section_view', {
      section: 'capabilities',
      details: `Explored capability item: ${cap.title}`,
    });
  };

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/14 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-white/14 pb-6"
        >
          <div className="flex items-center gap-4">
            <span className="font-sans text-xs sm:text-sm font-semibold text-[#E8746A] tracking-wider">
              03
            </span>
            <div className="h-px w-8 bg-[#E8746A]" />
            <h2 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/70">
              Creative & Design Capabilities
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-white/60 font-normal max-w-sm">
            Intentional visual solutions crafted for visionary brands and digital products.
          </div>
        </motion.div>

        {/* Numbered List-Style Layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="divide-y divide-white/14"
        >
          {published.map((cap, idx) => {
            const isHovered = hoveredId === cap.id;
            return (
              <motion.div
                key={cap.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                }}
                onMouseEnter={() => setHoveredId(cap.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleCapabilityClick(cap)}
                className="group py-8 sm:py-10 transition-colors duration-300 relative cursor-pointer px-4 rounded-sm hover:bg-black/35"
              >
                {/* Hover Accent Line Reveal on Left Edge */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-[#E8746A] transition-all duration-300 ${
                    isHovered ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  }`}
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center pl-2 sm:pl-4">
                  {/* Number */}
                  <div className="md:col-span-2 font-sans text-sm sm:text-base text-white/40 group-hover:text-[#E8746A] transition-colors flex items-center gap-3">
                    <span>{cap.number || `0${idx + 1}`}</span>
                    <span className="h-px w-6 bg-white/14 group-hover:bg-[#E8746A] transition-colors" />
                  </div>

                  {/* Title & Skills */}
                  <div className="md:col-span-5">
                    <h3 className="font-display font-medium text-xl sm:text-2xl md:text-3xl text-white group-hover:text-white transition-colors tracking-tight flex items-center gap-3">
                      <span>{cap.title}</span>
                      <ArrowUpRight
                        className={`w-5 h-5 text-[#E8746A] transition-transform duration-300 ${
                          isHovered ? 'translate-x-1 -translate-y-1 opacity-100' : 'opacity-0'
                        }`}
                      />
                    </h3>

                    {/* Skill Tags */}
                    {cap.skills && cap.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cap.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-sans tracking-wider uppercase px-2.5 py-0.5 rounded-full glass-surface text-white/70 group-hover:border-[#E8746A]/50 group-hover:text-white transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* One-Line Strategic Description */}
                  <div className="md:col-span-5">
                    <p className="text-sm sm:text-base text-white/80 group-hover:text-white leading-relaxed transition-colors font-normal">
                      {cap.description}
                    </p>
                  </div>
                </div>

                {/* Subtle animated bottom accent line on active item */}
                <div
                  className={`h-px w-full bg-gradient-to-r from-[#8B1E1E] via-[#E8746A] to-transparent mt-6 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
