import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, MessageSquare, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../../types.ts';
import { trackSectionView } from '../../utils/analyticsTracker.ts';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  onOpenAdmin: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onOpenAdmin,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackSectionView('testimonials');
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const published = testimonials
    .filter((t) => t.published !== false)
    .sort((a, b) => a.order - b.order);

  const handleNext = () => {
    if (published.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % published.length);
  };

  const handlePrev = () => {
    if (published.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + published.length) % published.length);
  };

  return (
    <section
      id="testimonials"
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
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-sans text-xs sm:text-sm font-semibold text-[#E8746A] tracking-wider">
                05
              </span>
              <div className="h-px w-8 bg-[#E8746A]" />
              <h2 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/70">
                Client Feedback & Endorsements
              </h2>
            </div>
            <p className="font-display font-medium text-2xl sm:text-3xl md:text-4xl text-white">
              Tested trust and proven brand transformation.
            </p>
          </div>

          {/* Slider Controls */}
          {published.length > 1 && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="p-3 rounded-full border border-white/14 glass-surface text-white hover:border-[#E8746A] hover:text-[#E8746A] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="font-sans text-xs text-white/50 px-2">
                0{activeIdx + 1} / 0{published.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleNext}
                aria-label="Next testimonial"
                className="p-3 rounded-full border border-white/14 glass-surface text-white hover:border-[#E8746A] hover:text-[#E8746A] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {published.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/20 rounded-md p-8 glass-surface">
            <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">
              No Client Testimonials Yet
            </h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
              Client quotes or feedback screenshot images uploaded via the admin panel will appear here immediately.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#E8746A] hover:text-white transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Testimonials in Admin</span>
            </button>
          </div>
        ) : (
          /* Staggered / Refined Featured Card Showcase */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Primary Spotlight Card */}
            <div className="lg:col-span-8 glass-surface p-8 sm:p-12 rounded-sm relative flex flex-col justify-between overflow-hidden hud-frame">
              <Quote className="w-12 h-12 text-[#E8746A]/40 mb-6" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={published[activeIdx].id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <blockquote className="font-display text-xl sm:text-2xl md:text-3xl text-white leading-[1.35] tracking-tight mb-10 font-normal">
                    "{published[activeIdx].feedbackText}"
                  </blockquote>

                  <div className="pt-6 border-t border-white/14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {published[activeIdx].avatarUrl ? (
                        <img
                          src={published[activeIdx].avatarUrl}
                          alt={published[activeIdx].authorName}
                          className="w-12 h-12 rounded-full object-cover filter grayscale border border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full glass-surface flex items-center justify-center font-display font-bold text-[#E8746A]">
                          {published[activeIdx].authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-display font-medium text-base text-white">
                          {published[activeIdx].authorName}
                        </div>
                        <div className="text-xs font-sans text-white/60 uppercase tracking-wider">
                          {published[activeIdx].authorRole} • {published[activeIdx].company}
                        </div>
                      </div>
                    </div>

                    <span className="hidden sm:inline-block font-sans text-[11px] text-[#E8746A] uppercase tracking-widest px-3 py-1 rounded-full glass-surface border border-[#E8746A]/40">
                      Verified Partner
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Other Endorsements Quick List */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {published.map((t, idx) => (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={() => setActiveIdx(idx)}
                  className={`p-5 rounded-sm border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    activeIdx === idx
                      ? 'bg-black/80 border-[#E8746A] shadow-[0_0_16px_rgba(232,116,106,0.3)]'
                      : 'glass-surface border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="text-xs text-white/90 line-clamp-2 mb-3 italic">
                    "{t.feedbackText}"
                  </div>
                  <div className="text-[11px] font-sans font-medium text-[#E8746A] uppercase tracking-wider">
                    {t.authorName} — {t.company}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
