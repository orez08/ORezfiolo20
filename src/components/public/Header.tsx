import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Shield, FileText, Download, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackAction } from '../../utils/analyticsTracker.ts';
import { CvItem } from '../../types.ts';

interface HeaderProps {
  wordmark: string;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  cvItems?: CvItem[];
}

export const Header: React.FC<HeaderProps> = ({
  wordmark = 'ORez STUdio',
  onOpenAdmin,
  isAdminLoggedIn,
  cvItems = [],
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Work', href: '#work' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  const publishedCvs = cvItems.filter((cv) => cv.published !== false);
  const categories = ['All', ...Array.from(new Set(publishedCvs.map((cv) => cv.category || 'General')))];

  const filteredCvs = selectedCategory === 'All'
    ? publishedCvs
    : publishedCvs.filter((cv) => cv.category === selectedCategory);

  const handleNavClick = (href: string, label: string) => {
    setMobileMenuOpen(false);
    trackAction('section_view', {
      section: href.replace('#', ''),
      details: `Navigated via header link: ${label}`,
    });
  };

  const handleCtaClick = () => {
    trackAction('cta_click', {
      section: 'header',
      details: 'Clicked "Let\'s Work Together" in floating header',
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none"
      >
        <div
          id="floating-nav-bar"
          className="pointer-events-auto transition-all duration-300 w-full max-w-5xl rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl glass-surface"
        >
          {/* Brand Wordmark */}
          <a
            id="nav-brand-logo"
            href="#hero"
            onClick={() => handleNavClick('#hero', 'Logo')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8746A] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_#E8746A]" />
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
              {wordmark}
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav id="desktop-navigation" className="hidden md:flex items-center gap-5 lg:gap-7 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => handleNavClick(link.href, link.label)}
                className="text-white/80 hover:text-[#E8746A] transition-colors relative py-1 text-[13px] font-medium tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}

            {/* CV Button */}
            <button
              onClick={() => {
                setCvModalOpen(true);
                trackAction('cta_click', { section: 'header', details: 'Opened CV & Resume Modal' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8746A]/15 border border-[#E8746A]/40 text-[#E8746A] hover:bg-[#E8746A] hover:text-black transition-all text-[12px] font-sans uppercase tracking-wider group"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CV</span>
            </button>

          </nav>

          {/* Right CTA & Admin Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Glassmorphic Hire Me Button */}
            <a
              id="header-hire-me-glass-button"
              href="https://wa.me/2348165462205"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAction('cta_click', { section: 'header', details: 'Clicked Hire Me' })}
              style={{ fontFamily: "'Poppins', sans-serif" }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8B1E1E]/20 hover:bg-[#8B1E1E]/40 border border-[#E8746A]/30 hover:border-[#E8746A] text-white transition-all text-xs font-sans uppercase font-semibold tracking-wider backdrop-blur-md shadow-md group hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.152 4.208 4.298-1.127.398.243z"/>
              </svg>
              <span>Hire Me</span>
            </a>

            <button
              id="header-admin-portal-button"
              onClick={onOpenAdmin}
              title={isAdminLoggedIn ? 'Open Admin Dashboard' : 'Owner / Admin Login'}
              className={`p-2 rounded-full transition-all border glass-surface ${
                isAdminLoggedIn
                  ? 'text-[#E8746A] border-[#E8746A]/40 bg-black/40 hover:bg-black/60'
                  : 'text-white/60 border-white/14 hover:text-white hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <Shield className="w-4 h-4" />
            </button>

            <a
              id="nav-cta-work-together"
              href="#contact"
              onClick={handleCtaClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide bg-white text-black hover:bg-[#E8746A] hover:text-white transition-all duration-200 uppercase shadow-md group"
            >
              <span>Let's Work Together</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Mobile Menu Trigger */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Fullscreen Overlay */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-overlay"
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl pointer-events-auto flex flex-col justify-between p-8 pt-24 md:hidden border-b border-white/14"
          >
            <div className="flex flex-col space-y-6">
              <div className="text-xs uppercase tracking-widest text-[#E8746A] font-semibold border-b border-white/14 pb-3 flex items-center justify-between">
                <span>Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navLinks.map((link, idx) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => handleNavClick(link.href, link.label)}
                  className="text-2xl font-display font-medium text-white hover:text-[#E8746A] transition-colors flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <span className="text-xs font-sans text-white/40 group-hover:text-[#E8746A]">
                    0{idx + 1}
                  </span>
                </a>
              ))}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCvModalOpen(true);
                }}
                className="text-2xl font-display font-medium text-[#E8746A] hover:text-white transition-colors flex items-center justify-between group text-left"
              >
                <span>CV & Resume</span>
                <FileText className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/14">
              <a
                href="#contact"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCtaClick();
                }}
                className="w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-wider bg-white text-black hover:bg-[#E8746A] hover:text-white transition-colors block"
              >
                Let's Work Together
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-3 rounded-full text-center text-xs tracking-wider border border-white/20 text-white/70 hover:text-white flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-[#E8746A]" />
                <span>{isAdminLoggedIn ? 'Open Admin Control' : 'Admin / Owner Portal'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* CV Download & Categories Modal */}
      {cvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#141414] border border-[#F5F1EA]/15 w-full max-w-2xl rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setCvModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-[#E8746A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 border-b border-[#F5F1EA]/10 pb-5">
              <div className="flex items-center gap-2 text-xs font-sans text-[#E8746A] uppercase tracking-widest">
                <FileText className="w-4 h-4" />
                <span>Professional Qualifications</span>
              </div>
              <h2 className="font-display font-medium text-2xl text-white">
                Download Curated CVs & Resumes
              </h2>
              <p className="text-xs text-white/60 font-sans">
                Select a professional discipline category and download the official CV document instantly.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#E8746A] text-black font-semibold'
                      : 'bg-[#1C1C1C] border border-[#F5F1EA]/10 text-white/70 hover:text-white hover:border-[#E8746A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* CV Items List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredCvs.length === 0 ? (
                <div className="p-8 text-center rounded-sm bg-[#181818] border border-[#F5F1EA]/10">
                  <p className="text-xs font-sans text-white/50">No CV documents found in this category.</p>
                </div>
              ) : (
                filteredCvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="p-4 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 hover:border-[#E8746A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#8B1E1E]/50 text-[#E8746A] border border-[#8B1E1E]">
                          {cv.category}
                        </span>
                        <span className="text-[10px] font-sans text-white/40">
                          {cv.fileSize || '1.5 MB'}
                        </span>
                      </div>
                      <div className="font-display font-medium text-sm text-white">
                        {cv.title}
                      </div>
                      <div className="text-[11px] font-sans text-white/50">
                        File: {cv.fileName || 'Resume.pdf'} • Updated {cv.updatedAt}
                      </div>
                    </div>

                    <a
                      href={cv.fileUrl || '#'}
                      download={cv.fileName || 'Resume.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackAction('cta_click', { section: 'cv_modal', details: `Downloaded CV: ${cv.title}` });
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-white text-black text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-white transition-colors shrink-0 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CV</span>
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#F5F1EA]/10 flex items-center justify-between text-[11px] font-sans text-white/40">
              <span>Awotimiro Moses Oreoluwa (ORez)</span>
              <span>Secure PDF Download</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
