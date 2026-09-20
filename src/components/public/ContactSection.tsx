import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, ArrowUpRight, Sparkles, Instagram, Linkedin, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { ContactContent } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  trackSectionView,
  trackAction,
  getOrCreateVisitorId,
  saveVisitorIdentity,
} from '../../utils/analyticsTracker.ts';

interface ContactSectionProps {
  contact: ContactContent;
  prefilledInquiry?: {
    category: string;
    projectTitle: string;
  } | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contact, prefilledInquiry }) => {
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Brand Identity',
    budget: '$5,000 - $10,000',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (prefilledInquiry && prefilledInquiry.category) {
      setFormData((prev) => ({
        ...prev,
        projectType: prefilledInquiry.category,
        message: `Hello ORez, I am inquiring about similar work in the "${prefilledInquiry.category}" discipline (Reference project: "${prefilledInquiry.projectTitle}"). Please share your process, deliverables, and availability.`,
      }));
    }
  }, [prefilledInquiry]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackSectionView('contact');
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleEmailClick = () => {
    trackAction('contact_click', {
      section: 'contact',
      details: `Clicked email mailto link (${contact.email})`,
    });
  };

  const handlePhoneClick = () => {
    trackAction('contact_click', {
      section: 'contact',
      details: `Clicked phone tel link (${contact.phone})`,
    });
  };

  const handleWhatsAppClick = () => {
    trackAction('contact_click', {
      section: 'contact',
      details: `Clicked WhatsApp direct link (${contact.phone})`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please provide your name, email, and brief project details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const visitorId = getOrCreateVisitorId();
      saveVisitorIdentity(formData.name, formData.email);

      await api.submitMessage({
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        budget: formData.budget,
        message: formData.message,
        visitorId,
      });

      trackAction('form_submission', {
        section: 'contact',
        details: `Contact form submitted by ${formData.name} (${formData.projectType})`,
      });

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        projectType: 'Brand Identity',
        budget: '$5,000 - $10,000',
        message: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to transmit message. Please email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
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
          className="flex items-center gap-4 mb-16 border-b border-white/14 pb-6"
        >
          <span className="font-sans text-xs sm:text-sm font-semibold text-[#E8746A] tracking-wider">
            {contact.sectionNumber || '06'}
          </span>
          <div className="h-px w-8 bg-[#E8746A]" />
          <h2 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/70">
            {contact.title || "Let's Work Together"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Inquiries, Statement, Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <h3 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-[1.12] mb-6">
                {contact.headline}
              </h3>
              <p className="text-base sm:text-lg text-white/80 font-normal leading-relaxed">
                {contact.subtext}
              </p>
            </div>

            {/* Direct Clickable Contact Cards */}
            <div className="space-y-3 pt-2">
              {/* Email */}
              <a
                id="contact-link-email"
                href={`mailto:${contact.email}`}
                onClick={handleEmailClick}
                className="group p-4 rounded-sm glass-surface border border-white/14 hover:border-[#E8746A] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full glass-surface flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-black transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-white/50">
                      Direct Email
                    </div>
                    <div className="text-sm font-medium text-white font-sans">
                      {contact.email}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#E8746A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* Phone */}
              <a
                id="contact-link-phone"
                href={`tel:+234${contact.phone.replace(/^0/, '')}`}
                onClick={handlePhoneClick}
                className="group p-4 rounded-sm glass-surface border border-white/14 hover:border-[#E8746A] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full glass-surface flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-black transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-white/50">
                      Direct Telephone
                    </div>
                    <div className="text-sm font-medium text-white font-sans">
                      {contact.phone}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#E8746A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* WhatsApp Button */}
              <a
                id="contact-link-whatsapp"
                href={
                  contact.whatsappUrl ||
                  'https://wa.me/2348165462205'
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="group p-4 rounded-sm bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/20 backdrop-blur-md border border-[#E8746A]/30 hover:border-[#E8746A] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#E8746A]/20 border border-[#E8746A]/40 flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-white transition-colors shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.152 4.208 4.298-1.127.398.243z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-[#E8746A] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8746A] animate-pulse" />
                      Instant WhatsApp Chat
                    </div>
                    <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
                      Chat on WhatsApp (+234 816 546 2205)
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* Instagram */}
              {contact.socials?.instagram && (
                <a
                  id="contact-link-instagram"
                  href={contact.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-sm glass-surface border border-white/14 hover:border-[#E8746A] flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full glass-surface flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-black transition-colors">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-sans uppercase tracking-widest text-white/50">
                        Instagram Profile
                      </div>
                      <div className="text-sm font-medium text-white">
                        @orezstudio08
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#E8746A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              )}

              {/* LinkedIn */}
              {contact.socials?.linkedin && (
                <a
                  id="contact-link-linkedin"
                  href={contact.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-sm glass-surface border border-white/14 hover:border-[#E8746A] flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full glass-surface flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-black transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-sans uppercase tracking-widest text-white/50">
                        LinkedIn Network
                      </div>
                      <div className="text-sm font-medium text-white">
                        Awotimiro Moses
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#E8746A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              )}

              {/* Facebook */}
              {contact.socials?.facebook && (
                <a
                  id="contact-link-facebook"
                  href={contact.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-sm glass-surface border border-white/14 hover:border-[#E8746A] flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full glass-surface flex items-center justify-center text-[#E8746A] group-hover:bg-[#E8746A] group-hover:text-black transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-sans uppercase tracking-widest text-white/50">
                        Facebook Profile
                      </div>
                      <div className="text-sm font-medium text-white">
                        canvaguy
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#E8746A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              )}
            </div>

            {/* Location & Operating Status */}
            <div className="pt-4 border-t border-white/14">
              <div className="text-xs font-sans text-white/50 uppercase tracking-wider mb-1">
                {contact.location}
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#E8746A]">
                <span className="w-2 h-2 rounded-full bg-[#E8746A] animate-pulse" />
                <span>{contact.availability}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Brief Submission Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 glass-surface border border-white/14 rounded-sm p-6 sm:p-10 hud-frame"
          >
            {submitSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E8746A]/20 border border-[#E8746A] text-[#E8746A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display font-medium text-2xl text-white">
                  Inquiry Received
                </h4>
                <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. I review all project proposals personally and will respond within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-6 px-6 py-2.5 rounded-full border border-white/20 text-xs font-sans uppercase tracking-wider text-white hover:border-[#E8746A] hover:text-[#E8746A] transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="font-display font-medium text-xl text-white mb-1">
                    Send a Project Brief
                  </h4>
                  <p className="text-xs text-white/50 font-sans">
                    All inquiries are routed directly to my personal desk.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-sm bg-red-900/30 border border-[#E8746A] text-xs text-[#E8746A]">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-widest text-white/70 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Henderson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm glass-input text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E8746A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-widest text-white/70 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm glass-input text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E8746A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-widest text-white/70 mb-2">
                      Project Discipline
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm glass-input text-white text-sm focus:outline-none focus:border-[#E8746A] transition-colors [&>option]:bg-[#140608] [&>option]:text-white"
                    >
                      {(contact.projectBriefCategories || [
                        'Brand Identity & Positioning',
                        'Visual Design & Art Direction',
                        'UI/UX & Digital Experience',
                        'Social Media & Content Strategy',
                        'Product Design & Systems',
                        'Comprehensive Brand Partnership',
                      ]).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-widest text-white/70 mb-2">
                      Estimated Investment
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm glass-input text-white text-sm focus:outline-none focus:border-[#E8746A] transition-colors [&>option]:bg-[#140608] [&>option]:text-white"
                    >
                      {(contact.projectBudgetCategories || [
                        '$5,000 – $10,000',
                        '$10,000 – $25,000',
                        '$25,000 – $50,000',
                        '$50,000+',
                        'Project Based (Custom)',
                      ]).map((bud) => (
                        <option key={bud} value={bud}>
                          {bud}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-widest text-white/70 mb-2">
                    Project Overview & Objectives *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about your brand, primary challenges, desired timeline, and the growth outcome you wish to unlock..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-sm glass-input text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E8746A] transition-colors resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-white text-black font-semibold text-xs sm:text-sm uppercase tracking-widest hover:bg-[#E8746A] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Transmitting Project Brief...</span>
                  ) : (
                    <>
                      <span>Transmit Project Brief</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
