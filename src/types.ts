export type UserRole = 'owner' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface HeroContent {
  tagline: string;
  statementPrefix: string;
  statementHighlight: string;
  statementSuffix: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  floatingBadges: Array<{ id: string; label: string; sub: string }>;
  marqueeClients: string[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface AboutContent {
  sectionNumber: string;
  title: string;
  introHeading: string;
  mainBio: string;
  secondaryBio: string;
  portraitUrl: string;
  portraitCaption: string;
  portraitBadge: string;
  stats: StatItem[];
  disciplineChips: string[];
}

export interface Capability {
  id: string;
  number: string;
  title: string;
  description: string;
  skills: string[];
  published: boolean;
  order: number;
}

export interface SoftwareTool {
  id: string;
  name: string;
  level: 'Mastery' | 'Advanced' | 'Proficient' | 'Expert' | string;
  category: string;
  published: boolean;
  order: number;
}

export interface WorkProject {
  id: string;
  title: string;
  category: 'Brand Identity' | 'Visual Design' | 'UI/UX' | 'Product Design' | 'Social Media' | string;
  year: string;
  client: string;
  role: string;
  coverImage: string;
  gallery: string[];
  description: string;
  metrics?: string;
  featured: boolean;
  published: boolean;
  order: number;
  tags: string[];
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  company: string;
  feedbackText: string;
  screenshotUrl?: string;
  avatarUrl?: string;
  published: boolean;
  featured: boolean;
  order: number;
}

export interface ContactContent {
  sectionNumber: string;
  title: string;
  headline: string;
  subtext: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  location: string;
  availability: string;
  projectBriefCategories: string[];
  projectBudgetCategories: string[];
  socials: {
    instagram: string;
    twitter: string;
    linkedin: string;
    facebook?: string;
    behance: string;
    dribbble: string;
  };
  footerNote: string;
  copyrightText: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  brandWordmark: string;
  brandSubmark: string;
  wordmark?: string;
  submark?: string;
  seoTitle?: string;
  seoDescription?: string;
  accentColorDark: string; // #8B1E1E
  accentColorLight: string; // #E8746A
  charcoalBg: string; // #141414
  ivoryText: string; // #F5F1EA
  enableCookieConsent: boolean;
  analyticsActive: boolean;
}

export interface UploadedMediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface CvItem {
  id: string;
  title: string;
  category: string; // e.g., Brand Design, UI/UX, Executive Resume
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  updatedAt: string;
  published: boolean;
  order: number;
}

export interface PortfolioData {
  hero: HeroContent;
  about: AboutContent;
  capabilities: Capability[];
  productionSoftware?: SoftwareTool[];
  projects: WorkProject[];
  work?: WorkProject[];
  testimonials: Testimonial[];
  contact: ContactContent;
  settings: SiteSettings;
  cvItems: CvItem[];
}

export type InteractionType =
  | 'visit'
  | 'section_view'
  | 'project_click'
  | 'cta_click'
  | 'contact_click'
  | 'form_submission';

export interface InteractionLog {
  id: string;
  timestamp: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  page: string;
  section?: string;
  projectTitle?: string;
  interactionType: InteractionType;
  details?: string;
  device: string;
  browser: string;
  referrer: string;
  approxLocation?: string;
  city?: string;
  country?: string;
  sectionViewed?: string;
  projectClicked?: string;
}

export type VisitorLog = InteractionLog;


export interface ContactMessage {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  budget?: string;
  timeline?: string;
  read: boolean;
  visitorId?: string;
}

export interface DashboardStats {
  totalVisits: number;
  uniqueVisitors: number;
  totalInteractions: number;
  totalMessages: number;
  unreadMessages: number;
  topProjects: Array<{ title: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  recentActivities: InteractionLog[];
  recentMessages: ContactMessage[];
}
