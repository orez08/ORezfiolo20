import React from 'react';
import { ArrowUp, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContactContent } from '../../types.ts';
import { trackAction } from '../../utils/analyticsTracker.ts';

interface FooterProps {
  contact: ContactContent;
  wordmark: string;
}

export const Footer: React.FC<FooterProps> = ({ contact, wordmark }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackAction('section_view', {
      section: 'top',
      details: 'Clicked back to top button',
    });
  };

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Work', href: '#work' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 text-white border-t border-white/14 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/14">
          {/* Brand Wordmark & Tagline */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8746A]" />
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                {wordmark || 'ORez STUdio'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-white/60 uppercase tracking-wider max-w-md">
              {contact.footerNote || 'Crafted with intentional typography, refined aesthetics, and strategic design precision.'}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-sans uppercase tracking-widest text-white/70">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#E8746A] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Details, Socials, Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-sans text-white/50">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {contact.socials?.instagram && (
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={contact.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full glass-surface border border-white/14 flex items-center justify-center text-white hover:border-[#E8746A] hover:text-[#E8746A] hover:shadow-[0_0_12px_rgba(232,116,106,0.4)] transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
            )}
            {contact.socials?.linkedin && (
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={contact.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full glass-surface border border-white/14 flex items-center justify-center text-white hover:border-[#E8746A] hover:text-[#E8746A] hover:shadow-[0_0_12px_rgba(232,116,106,0.4)] transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
            )}
            {contact.socials?.facebook && (
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={contact.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full glass-surface border border-white/14 flex items-center justify-center text-white hover:border-[#E8746A] hover:text-[#E8746A] hover:shadow-[0_0_12px_rgba(232,116,106,0.4)] transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
              </motion.a>
            )}
            {contact.socials?.twitter && (
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={contact.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-full glass-surface border border-white/14 flex items-center justify-center text-white hover:border-[#E8746A] hover:text-[#E8746A] hover:shadow-[0_0_12px_rgba(232,116,106,0.4)] transition-all cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
            )}
          </div>

          {/* Copyright */}
          <div>
            {contact.copyrightText || `© ${new Date().getFullYear()} ORez STUdio. Awotimiro Moses Oreoluwa.`}
          </div>

          {/* Back to top button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="footer-back-to-top-button"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white/70 hover:text-[#E8746A] transition-colors group cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-[#E8746A]" />
          </motion.button>
        </div>
      </motion.div>
    </footer>
  );
};
