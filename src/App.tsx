import React, { useState, useEffect } from 'react';
import { PortfolioData, AdminUser } from './types.ts';
import { initialPortfolioData } from './data/initialData.ts';
import { api } from './services/api.ts';
import { trackVisitorSession } from './utils/analyticsTracker.ts';

// Public components
import { Header } from './components/public/Header.tsx';
import { Hero } from './components/public/Hero.tsx';
import { ClientMarquee } from './components/public/ClientMarquee.tsx';
import { AboutSection } from './components/public/AboutSection.tsx';
import { CapabilitiesSection } from './components/public/CapabilitiesSection.tsx';
import { WorkSection } from './components/public/WorkSection.tsx';
import { TestimonialsSection } from './components/public/TestimonialsSection.tsx';
import { ContactSection } from './components/public/ContactSection.tsx';
import { Footer } from './components/public/Footer.tsx';

// Admin components
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(initialPortfolioData);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inquiryDiscipline, setInquiryDiscipline] = useState<{ category: string; projectTitle: string } | null>(null);

  const handleInquireSimilarWork = (category: string, projectTitle: string) => {
    setInquiryDiscipline({ category, projectTitle });
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check URL routes for admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin') {
        setIsAdminRoute(true);
      } else {
        setIsAdminRoute(false);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Fetch single source of truth portfolio data from backend database
  const loadPortfolioData = async () => {
    try {
      const data = await api.getPortfolio();
      if (data && data.hero) {
        setPortfolio(data);
      }
    } catch (err) {
      console.warn('Using local initialized data state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();

    const handlePortfolioEvent = (e: any) => {
      if (e.detail) {
        setPortfolio(e.detail);
      }
    };
    window.addEventListener('orez_portfolio_updated', handlePortfolioEvent);

    // Check existing stored admin session
    const stored = api.getStoredUser();
    if (stored) {
      setAdminUser(stored);
    }

    // Track public visitor entry
    trackVisitorSession();

    return () => {
      window.removeEventListener('orez_portfolio_updated', handlePortfolioEvent);
    };
  }, []);

  const handleUpdatePortfolio = async (updatedFields: Partial<PortfolioData>) => {
    try {
      const saved = await api.updatePortfolio(updatedFields);
      setPortfolio(saved);
    } catch (err: any) {
      alert(err.message || 'Failed to update portfolio data');
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setAdminUser(null);
  };

  const navigateToAdmin = () => {
    setIsAdminRoute(true);
    window.location.hash = '#admin';
  };

  const navigateToSite = () => {
    setIsAdminRoute(false);
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  // If in Admin Route
  if (isAdminRoute) {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToSite={navigateToSite}
        />
      );
    }

    return (
      <AdminLayout
        user={adminUser}
        portfolio={portfolio}
        onUpdatePortfolio={handleUpdatePortfolio}
        onRefreshData={loadPortfolioData}
        onLogout={handleLogout}
        onBackToSite={navigateToSite}
      />
    );
  }

  // Public View
  return (
    <div className="min-h-screen site-bg-mesh text-white selection:bg-[#8B1E1E] selection:text-white relative font-sans">
      {/* Subtle site-wide dark overlay (black at 25-40% opacity) for high legibility */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-0" />
      {/* Subtle white grid lines at 6-8% opacity */}
      <div className="fixed inset-0 bg-subtle-grid pointer-events-none z-0 opacity-80" />

      {/* Main interactive layer */}
      <div className="relative z-10">
        {/* Floating Header */}
        <Header
          wordmark={portfolio.settings.brandWordmark || 'ORez STUdio'}
          onOpenAdmin={navigateToAdmin}
          isAdminLoggedIn={Boolean(adminUser)}
          cvItems={portfolio.cvItems || []}
        />

        {/* Main Sections */}
        <main>
          {/* 01 — Hero */}
          <Hero hero={portfolio.hero} />

          {/* Marquee strip of brands */}
          <ClientMarquee clients={portfolio.hero.marqueeClients} />

          {/* 02 — About */}
          <AboutSection about={portfolio.about} />

          {/* 03 — Capabilities & Production Software */}
          <CapabilitiesSection
            capabilities={portfolio.capabilities}
            productionSoftware={portfolio.productionSoftware || []}
          />

          {/* 04 — Work & Portfolio */}
          <WorkSection
            projects={portfolio.projects}
            onOpenAdmin={navigateToAdmin}
            onInquireSimilarWork={handleInquireSimilarWork}
          />

          {/* Testimonials & Endorsements */}
          <TestimonialsSection
            testimonials={portfolio.testimonials}
            onOpenAdmin={navigateToAdmin}
          />

          {/* 05 — Contact */}
          <ContactSection
            contact={portfolio.contact}
            prefilledInquiry={inquiryDiscipline}
          />
        </main>

        {/* Footer */}
        <Footer
          contact={portfolio.contact}
          wordmark={portfolio.settings.brandWordmark || 'ORez STUdio'}
        />
      </div>
    </div>
  );
}
