import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  User,
  Layers,
  Cpu,
  Briefcase,
  Quote,
  Mail,
  Settings,
  Users,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  FileText,
} from 'lucide-react';
import { AdminUser, PortfolioData } from '../../types.ts';
import { AdminDashboard } from './AdminDashboard.tsx';
import { HeroEditor } from './sections/HeroEditor.tsx';
import { AboutEditor } from './sections/AboutEditor.tsx';
import { CapabilitiesManager } from './sections/CapabilitiesManager.tsx';
import { ProductionSoftwareManager } from './sections/ProductionSoftwareManager.tsx';
import { WorkManager } from './sections/WorkManager.tsx';
import { TestimonialsManager } from './sections/TestimonialsManager.tsx';
import { ContactFooterEditor } from './sections/ContactFooterEditor.tsx';
import { SiteSettingsEditor } from './sections/SiteSettingsEditor.tsx';
import { VisitorsTracker } from './sections/VisitorsTracker.tsx';
import { MessagesInbox } from './sections/MessagesInbox.tsx';
import { CvManager } from './sections/CvManager.tsx';

interface AdminLayoutProps {
  user: AdminUser;
  portfolio: PortfolioData;
  onUpdatePortfolio: (updated: Partial<PortfolioData>) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onBackToSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  portfolio,
  onUpdatePortfolio,
  onRefreshData,
  onLogout,
  onBackToSite,
}) => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: '1. Dashboard Overview', icon: LayoutDashboard },
    { id: 'hero', label: '2. Header & Hero', icon: Compass },
    { id: 'about', label: '3. About Section', icon: User },
    { id: 'capabilities', label: '4. Capabilities', icon: Layers },
    { id: 'software', label: '5. Production Software & Toolkit', icon: Cpu },
    { id: 'work', label: '6. Work & Portfolio', icon: Briefcase },
    { id: 'testimonials', label: '7. Testimonials', icon: Quote },
    { id: 'contact', label: '8. Contact & Footer', icon: Mail },
    { id: 'settings', label: '9. Site Settings', icon: Settings },
    { id: 'visitors', label: '10. Visitors & Analytics', icon: Users },
    { id: 'messages', label: '11. Messages Inbox', icon: MessageSquare },
    { id: 'cv', label: '12. CV / Resume', icon: FileText },
  ];

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#F5F1EA] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#181818] border-b border-[#F5F1EA]/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8746A]" />
          <span className="font-display font-bold text-lg text-[#F5F1EA]">
            {portfolio.settings.brandWordmark || 'ORez STUdio'}
          </span>
          <span className="text-[10px] font-sans uppercase px-1.5 py-0.5 rounded bg-[#8B1E1E] text-[#F5F1EA]">
            {user.role}
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#F5F1EA]/70 hover:text-[#F5F1EA]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#101010] border-r border-[#F5F1EA]/10 flex flex-col justify-between z-50 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 overflow-y-auto">
          {/* Logo & Role */}
          <div className="pb-6 border-b border-[#F5F1EA]/10 mb-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E8746A]" />
              <span className="font-display font-bold text-xl tracking-tight text-[#F5F1EA]">
                {portfolio.settings.brandWordmark || 'ORez STUdio'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans text-[#F5F1EA]/50 uppercase tracking-widest">
                Studio Management
              </span>
              <span
                className={`text-[10px] font-sans uppercase px-2 py-0.5 rounded-full font-semibold ${
                  user.role === 'owner'
                    ? 'bg-[#8B1E1E] text-[#F5F1EA]'
                    : 'bg-[#1C1C1C] text-[#E8746A]'
                }`}
              >
                {user.role} Access
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-sans transition-all text-left ${
                    isActive
                      ? 'bg-[#1C1C1C] text-[#E8746A] border-l-2 border-[#E8746A] font-semibold'
                      : 'text-[#F5F1EA]/70 hover:text-[#F5F1EA] hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8746A]' : 'text-[#F5F1EA]/50'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-6 border-t border-[#F5F1EA]/10 space-y-3 bg-[#0D0D0D]">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-3 py-2 rounded-sm border border-[#F5F1EA]/15 text-xs font-sans uppercase text-[#F5F1EA]/80 hover:text-[#F5F1EA] hover:border-[#E8746A] transition-colors"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#E8746A]" />
          </button>

          <div className="flex items-center justify-between pt-1">
            <div className="truncate pr-2">
              <div className="text-xs font-medium text-[#F5F1EA] truncate">
                {user.name}
              </div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/40 truncate">
                {user.email}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-sm text-[#F5F1EA]/50 hover:text-[#E8746A] hover:bg-[#141414] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-6 sm:p-10 lg:p-12 overflow-y-auto bg-[#141414] bg-subtle-grid">
        {activeSection === 'dashboard' && (
          <AdminDashboard
            portfolio={portfolio}
            onNavigateSection={handleNavigate}
          />
        )}

        {activeSection === 'hero' && (
          <HeroEditor
            hero={portfolio.hero}
            onSave={async (updated) => {
              await onUpdatePortfolio({ hero: updated });
            }}
          />
        )}

        {activeSection === 'about' && (
          <AboutEditor
            about={portfolio.about}
            onSave={async (updated) => {
              await onUpdatePortfolio({ about: updated });
            }}
          />
        )}

        {activeSection === 'capabilities' && (
          <CapabilitiesManager
            capabilities={portfolio.capabilities}
            onRefresh={onRefreshData}
          />
        )}

        {activeSection === 'software' && (
          <ProductionSoftwareManager
            software={portfolio.productionSoftware || []}
            onRefresh={onRefreshData}
          />
        )}

        {activeSection === 'work' && (
          <WorkManager
            projects={portfolio.projects}
            onRefresh={onRefreshData}
          />
        )}

        {activeSection === 'testimonials' && (
          <TestimonialsManager
            testimonials={portfolio.testimonials}
            onRefresh={onRefreshData}
          />
        )}

        {activeSection === 'contact' && (
          <ContactFooterEditor
            contact={portfolio.contact}
            onSave={async (updated) => {
              await onUpdatePortfolio({ contact: updated });
            }}
          />
        )}

        {activeSection === 'settings' && (
          <SiteSettingsEditor
            settings={portfolio.settings}
            onSave={async (updated) => {
              await onUpdatePortfolio({ settings: updated });
            }}
          />
        )}

        {activeSection === 'visitors' && <VisitorsTracker />}

        {activeSection === 'messages' && <MessagesInbox />}

        {activeSection === 'cv' && (
          <CvManager
            cvItems={portfolio.cvItems || []}
            onRefresh={onRefreshData}
          />
        )}
      </main>
    </div>
  );
};
