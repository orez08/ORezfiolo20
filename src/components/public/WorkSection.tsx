import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, PlusCircle, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkProject } from '../../types.ts';
import { ProjectModal } from './ProjectModal.tsx';
import { trackSectionView, trackAction } from '../../utils/analyticsTracker.ts';

interface WorkSectionProps {
  projects: WorkProject[];
  onOpenAdmin: () => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({ projects, onOpenAdmin }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<WorkProject | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackSectionView('work');
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const published = projects
    .filter((p) => p.published !== false)
    .sort((a, b) => a.order - b.order);

  // Extract categories
  const categories = ['All', ...Array.from(new Set(published.map((p) => p.category)))];

  const filtered =
    selectedCategory === 'All'
      ? published
      : published.filter((p) => p.category === selectedCategory);

  const handleProjectClick = (proj: WorkProject) => {
    setActiveProject(proj);
    trackAction('project_click', {
      section: 'work',
      projectTitle: proj.title,
      details: `Viewed project: ${proj.title} (${proj.category})`,
    });
  };

  return (
    <section
      id="work"
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
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/14 pb-6"
        >
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-sans text-xs sm:text-sm font-semibold text-[#E8746A] tracking-wider">
                04
              </span>
              <div className="h-px w-8 bg-[#E8746A]" />
              <h2 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/70">
                Work Showcase / Selected Portfolio
              </h2>
            </div>
            <p className="font-display font-medium text-2xl sm:text-3xl md:text-4xl text-white">
              Designed for visual distinction and lasting brand impact.
            </p>
          </div>

          {/* Category Filter Chips */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 self-start md:self-end">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'glass-surface text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/20 rounded-md p-8 glass-surface">
            <Layers className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
              Projects will appear here dynamically as soon as they are published via the admin panel.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#E8746A] hover:text-white transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Projects in Admin</span>
            </button>
          </div>
        ) : (
          /* Editorial Grid with Hover Image Reveal */
          <motion.div
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((proj) => (
                <motion.div
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  id={`project-card-${proj.id}`}
                  onClick={() => handleProjectClick(proj)}
                  className="group relative cursor-pointer flex flex-col glass-surface hover:border-[#E8746A]/70 transition-all duration-500 rounded-sm overflow-hidden hud-frame"
                >
                  {/* Image Container with Editorial Mask & Zoom */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center filter contrast-[1.05] group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop';
                      }}
                    />

                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Bar inside Card */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/14 text-[10px] font-sans tracking-widest text-white uppercase">
                        {proj.category}
                      </span>
                      <span className="font-sans text-xs text-white/80 px-2.5 py-0.5 rounded-full bg-black/80 border border-white/14">
                        {proj.year}
                      </span>
                    </div>

                    {/* Hover Floating Action */}
                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:bg-[#E8746A] group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Meta Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-medium text-2xl text-white group-hover:text-[#E8746A] transition-colors mb-2 tracking-tight">
                        {proj.title}
                      </h3>
                      <p className="text-sm text-white/75 font-normal line-clamp-2 leading-relaxed mb-4">
                        {proj.description}
                      </p>
                    </div>

                    {/* Discipline Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                        {proj.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Project Case Study Detail Modal */}
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      </div>
    </section>
  );
};
