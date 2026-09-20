import React, { useState } from 'react';
import { X, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkProject } from '../../types.ts';
import { trackAction } from '../../utils/analyticsTracker.ts';

interface ProjectModalProps {
  project: WorkProject | null;
  onClose: () => void;
  onInquireSimilarWork?: (category: string, projectTitle: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onInquireSimilarWork }) => {
  if (!project) return null;

  const allImages = [project.coverImage, ...(project.gallery || [])].filter(Boolean);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleContactAboutProject = () => {
    trackAction('cta_click', {
      section: 'project_modal',
      projectTitle: project.title,
      details: `Inquired about project from modal: ${project.title} (${project.category})`,
    });
    if (onInquireSimilarWork) {
      onInquireSimilarWork(project.category, project.title);
    } else {
      onClose();
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="project-detail-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl bg-black/90 border border-white/14 rounded-md overflow-hidden shadow-2xl my-auto text-left hud-frame"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/14 bg-black/95">
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-[#E8746A] tracking-wider uppercase">
              {project.category}
            </span>
            <span className="text-white/20">•</span>
            <span className="font-sans text-xs text-white/60">{project.year}</span>
          </div>

          <button
            id="close-project-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery / Image Showcase */}
        <div className="relative aspect-[16/9] bg-black/80 overflow-hidden group">
          <img
            src={allImages[activeImageIdx]}
            alt={project.title}
            className="w-full h-full object-cover object-center transition-all duration-300"
          />

          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 text-white hover:bg-[#E8746A] transition-colors backdrop-blur-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 text-white hover:bg-[#E8746A] transition-colors backdrop-blur-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-sans text-white/80 border border-white/14">
                {activeImageIdx + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        {/* Image Thumbnails if multiple */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-black/90 border-b border-white/14 overflow-x-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-20 h-14 rounded-sm overflow-hidden flex-shrink-0 border transition-all ${
                  activeImageIdx === idx
                    ? 'border-[#E8746A] ring-1 ring-[#E8746A]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Project Content & Metadata */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight">
                {project.title}
              </h2>
              {project.client && (
                <p className="text-sm font-sans text-white/60 mt-1">
                  Client: {project.client}
                </p>
              )}
            </div>

            <button
              onClick={handleContactAboutProject}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#E8746A] hover:text-white transition-colors flex-shrink-0"
            >
              <span>Discuss Similar Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-white/14 pt-6">
            <h4 className="text-xs uppercase tracking-widest text-[#E8746A] font-semibold font-sans mb-3">
              Case Brief & Execution
            </h4>
            <p className="text-base text-white/80 font-normal leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Metrics Highlight */}
          {project.metrics && (
            <div className="p-4 rounded-sm glass-surface border-l-2 border-[#E8746A]">
              <div className="text-[11px] uppercase tracking-wider text-[#E8746A] font-sans font-semibold mb-1">
                Design Deliverables & Outcome
              </div>
              <div className="text-sm font-medium text-white">
                {project.metrics}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/14 text-xs">
            <div>
              <span className="text-white/40 uppercase tracking-wider font-sans block mb-1">
                Role
              </span>
              <span className="text-white/90 font-medium">{project.role}</span>
            </div>
            <div>
              <span className="text-white/40 uppercase tracking-wider font-sans block mb-1">
                Year
              </span>
              <span className="text-white/90 font-medium">{project.year}</span>
            </div>
            <div>
              <span className="text-white/40 uppercase tracking-wider font-sans block mb-1">
                Deliverables
              </span>
              <div className="flex flex-wrap gap-1">
                {project.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full glass-surface text-[10px] text-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inquire Similar Work Action Card */}
          <div className="p-5 sm:p-6 rounded-sm glass-surface border border-[#E8746A]/30 bg-[#140608]/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[#E8746A] font-semibold font-sans flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Project Discipline: {project.category}</span>
                </div>
                <h4 className="font-display font-medium text-lg text-white">
                  Inquire Similar Work in {project.category}
                </h4>
                <p className="text-xs text-white/60 font-sans">
                  Looking for bespoke visual design, brand identity, or creative execution in this category?
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-shrink-0">
                <a
                  id="modal-inquire-whatsapp-btn"
                  href={`https://wa.me/2348165462205?text=${encodeURIComponent(
                    `Hello ORez, I saw your project "${project.title}" and would like to inquire about similar work in the "${project.category}" discipline.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackAction('cta_click', {
                      section: 'project_modal',
                      projectTitle: project.title,
                      details: `Inquired similar work via WhatsApp: ${project.category}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#8B1E1E]/20 hover:bg-[#8B1E1E]/40 border border-[#E8746A]/30 hover:border-[#E8746A] text-white font-semibold text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-md group"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.152 4.208 4.298-1.127.398.243z"/>
                  </svg>
                  <span>WhatsApp Inquire</span>
                </a>

                <button
                  id="modal-inquire-category-btn"
                  onClick={handleContactAboutProject}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#E8746A] hover:text-white transition-all shadow-md cursor-pointer"
                >
                  <span>Inquire Similar Work</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
  );
};
