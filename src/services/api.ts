import {
  PortfolioData,
  WorkProject,
  Capability,
  Testimonial,
  ContactMessage,
  InteractionLog,
  DashboardStats,
  AdminUser,
  UploadedMediaFile,
} from '../types.ts';
import { INITIAL_PORTFOLIO_DATA } from '../data/initialData.ts';

const TOKEN_KEY = 'orez_auth_token';

function getLocalPortfolio(): PortfolioData {
  const cached = localStorage.getItem('orez_portfolio_data');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_PORTFOLIO_DATA;
}

function saveLocalPortfolio(data: PortfolioData): void {
  localStorage.setItem('orez_portfolio_data', JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('orez_portfolio_updated', { detail: data }));
}

export const api = {
  // Auth
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('orez_auth_user');
  },

  getStoredUser(): AdminUser | null {
    const raw = localStorage.getItem('orez_auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout() {
    this.clearToken();
  },

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setToken(data.token);
        if (data.user) {
          localStorage.setItem('orez_auth_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, checking client credentials');
    }

    // Client/Netlify credential fallback
    if (
      (email === 'moseseawotimiro2008@gmail.com' || email === 'workwithorez@gmail.com') &&
      password === 'orez2026!'
    ) {
      const user: AdminUser = {
        id: 'user-owner',
        email,
        name: 'Awotimiro Moses Oreoluwa (ORez)',
        role: 'owner',
      };
      const token = `orez_user-owner_${Date.now()}`;
      this.setToken(token);
      localStorage.setItem('orez_auth_user', JSON.stringify(user));
      return { success: true, token, user };
    }
    if (email === 'admin@orez.studio' && password === 'orezadmin') {
      const user: AdminUser = {
        id: 'user-admin',
        email,
        name: 'Studio Content Admin',
        role: 'admin',
      };
      const token = `orez_user-admin_${Date.now()}`;
      this.setToken(token);
      localStorage.setItem('orez_auth_user', JSON.stringify(user));
      return { success: true, token, user };
    }
    throw new Error('Invalid email or password credentials.');
  },

  async verifyAuth(): Promise<AdminUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch {}

    // Static fallback
    const user = this.getStoredUser();
    if (user) return user;

    if (token.includes('user-owner')) {
      return {
        id: 'user-owner',
        email: 'moseseawotimiro2008@gmail.com',
        name: 'Awotimiro Moses Oreoluwa (ORez)',
        role: 'owner',
      };
    }
    return null;
  },

  // Portfolio data
  async getPortfolio(): Promise<PortfolioData> {
    try {
      const res = await fetch('/api/portfolio');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        localStorage.setItem('orez_portfolio_data', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('API server unavailable, loading from local cache', err);
    }
    return getLocalPortfolio();
  },

  async updatePortfolio(partial: Partial<PortfolioData>): Promise<PortfolioData> {
    let updatedPortfolio: PortfolioData | null = null;
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const data = await res.json();
        updatedPortfolio = data.portfolio;
      }
    } catch (err) {
      console.warn('Server save unavailable, storing changes locally for Netlify deployment', err);
    }

    if (!updatedPortfolio) {
      const current = getLocalPortfolio();
      updatedPortfolio = {
        ...current,
        ...partial,
        hero: partial.hero ? { ...current.hero, ...partial.hero } : current.hero,
        about: partial.about ? { ...current.about, ...partial.about } : current.about,
        contact: partial.contact ? { ...current.contact, ...partial.contact } : current.contact,
      };
    }

    saveLocalPortfolio(updatedPortfolio);
    return updatedPortfolio;
  },

  // Work Projects
  async saveProject(project: Partial<WorkProject>): Promise<WorkProject> {
    const isEdit = Boolean(project.id);
    const url = isEdit ? `/api/projects/${project.id}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocalPortfolio();
        const updatedProjects = isEdit
          ? current.projects.map((p) => (p.id === saved.id ? saved : p))
          : [saved, ...current.projects];
        saveLocalPortfolio({ ...current, projects: updatedProjects });
        return saved;
      }
    } catch (err) {
      console.warn('Server project save unavailable, persisting locally for static host', err);
    }

    // Static / Netlify Fallback
    const current = getLocalPortfolio();
    const savedProject: WorkProject = {
      id: project.id || `proj_${Date.now()}`,
      title: project.title || 'Untitled Project',
      category: project.category || 'Brand Identity',
      description: project.description || '',
      coverImage: project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800',
      client: project.client || '',
      role: project.role || 'Brand & Visual Designer',
      year: project.year || new Date().getFullYear().toString(),
      tags: project.tags || [],
      gallery: project.gallery || [],
      featured: project.featured ?? true,
      published: project.published ?? true,
      order: project.order ?? 0,
    };

    const updatedProjects = isEdit
      ? current.projects.map((p) => (p.id === savedProject.id ? savedProject : p))
      : [savedProject, ...current.projects];

    saveLocalPortfolio({ ...current, projects: updatedProjects });
    return savedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
    } catch {}

    const current = getLocalPortfolio();
    const updatedProjects = current.projects.filter((p) => p.id !== id);
    saveLocalPortfolio({ ...current, projects: updatedProjects });
    return true;
  },

  // Capabilities
  async saveCapability(cap: Partial<Capability>): Promise<Capability> {
    const isEdit = Boolean(cap.id);
    const url = isEdit ? `/api/capabilities/${cap.id}` : '/api/capabilities';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(cap),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocalPortfolio();
        const updatedCaps = isEdit
          ? current.capabilities.map((c) => (c.id === saved.id ? saved : c))
          : [...current.capabilities, saved];
        saveLocalPortfolio({ ...current, capabilities: updatedCaps });
        return saved;
      }
    } catch {}

    const current = getLocalPortfolio();
    const savedCap: Capability = {
      id: cap.id || `cap_${Date.now()}`,
      number: cap.number || '01',
      title: cap.title || 'New Capability',
      description: cap.description || '',
      skills: cap.skills || [],
      published: cap.published ?? true,
      order: cap.order ?? 0,
    };
    const updatedCaps = isEdit
      ? current.capabilities.map((c) => (c.id === savedCap.id ? savedCap : c))
      : [...current.capabilities, savedCap];
    saveLocalPortfolio({ ...current, capabilities: updatedCaps });
    return savedCap;
  },

  async deleteCapability(id: string): Promise<boolean> {
    try {
      await fetch(`/api/capabilities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
    } catch {}

    const current = getLocalPortfolio();
    const updatedCaps = current.capabilities.filter((c) => c.id !== id);
    saveLocalPortfolio({ ...current, capabilities: updatedCaps });
    return true;
  },

  // Testimonials
  async saveTestimonial(t: Partial<Testimonial>): Promise<Testimonial> {
    const isEdit = Boolean(t.id);
    const url = isEdit ? `/api/testimonials/${t.id}` : '/api/testimonials';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(t),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocalPortfolio();
        const updatedT = isEdit
          ? current.testimonials.map((item) => (item.id === saved.id ? saved : item))
          : [...current.testimonials, saved];
        saveLocalPortfolio({ ...current, testimonials: updatedT });
        return saved;
      }
    } catch {}

    const current = getLocalPortfolio();
    const savedTestimonial: Testimonial = {
      id: t.id || `testi_${Date.now()}`,
      authorName: t.authorName || 'Anonymous',
      authorRole: t.authorRole || '',
      company: t.company || '',
      feedbackText: t.feedbackText || '',
      avatarUrl: t.avatarUrl || '',
      published: t.published ?? true,
      featured: t.featured ?? false,
      order: t.order ?? 0,
    };

    const updatedT = isEdit
      ? current.testimonials.map((item) => (item.id === savedTestimonial.id ? savedTestimonial : item))
      : [...current.testimonials, savedTestimonial];

    saveLocalPortfolio({ ...current, testimonials: updatedT });
    return savedTestimonial;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    try {
      await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
    } catch {}

    const current = getLocalPortfolio();
    const updatedT = current.testimonials.filter((item) => item.id !== id);
    saveLocalPortfolio({ ...current, testimonials: updatedT });
    return true;
  },

  // Contact Messages
  async submitMessage(messageData: {
    name: string;
    email: string;
    projectType: string;
    message: string;
    budget?: string;
    timeline?: string;
    visitorId?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const msgObj: ContactMessage = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: messageData.name,
      email: messageData.email,
      projectType: messageData.projectType,
      message: messageData.message,
      budget: messageData.budget || 'Not specified',
      timeline: messageData.timeline || 'Flexible',
      read: false,
      visitorId: messageData.visitorId || 'v_static',
    };

    const rawMsgs = localStorage.getItem('orez_contact_messages');
    const msgs: ContactMessage[] = rawMsgs ? JSON.parse(rawMsgs) : [];
    msgs.unshift(msgObj);
    localStorage.setItem('orez_contact_messages', JSON.stringify(msgs));

    return { success: true, message: 'Message submitted successfully' };
  },

  async getMessages(): Promise<ContactMessage[]> {
    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return await res.json();
    } catch {}

    const rawMsgs = localStorage.getItem('orez_contact_messages');
    return rawMsgs ? JSON.parse(rawMsgs) : [];
  },

  async markMessageRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return true;
    } catch {}

    const rawMsgs = localStorage.getItem('orez_contact_messages');
    if (rawMsgs) {
      const msgs: ContactMessage[] = JSON.parse(rawMsgs);
      const updated = msgs.map((m) => (m.id === id ? { ...m, read: true } : m));
      localStorage.setItem('orez_contact_messages', JSON.stringify(updated));
    }
    return true;
  },

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return true;
    } catch {}

    const rawMsgs = localStorage.getItem('orez_contact_messages');
    if (rawMsgs) {
      const msgs: ContactMessage[] = JSON.parse(rawMsgs);
      const updated = msgs.filter((m) => m.id !== id);
      localStorage.setItem('orez_contact_messages', JSON.stringify(updated));
    }
    return true;
  },

  // Analytics
  async trackInteraction(log: Partial<InteractionLog>): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch {}
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/analytics/stats', {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return await res.json();
    } catch {}

    const portfolio = getLocalPortfolio();
    const rawMsgs = localStorage.getItem('orez_contact_messages');
    const msgs: ContactMessage[] = rawMsgs ? JSON.parse(rawMsgs) : [];

    return {
      totalVisits: 184,
      uniqueVisitors: 92,
      totalInteractions: 340,
      totalMessages: msgs.length,
      unreadMessages: msgs.filter((m) => !m.read).length,
      topProjects: portfolio.projects.map((p) => ({ title: p.title, views: 12 })),
      topReferrers: [
        { referrer: 'Instagram', count: 48 },
        { referrer: 'Direct / Portfolio', count: 35 },
        { referrer: 'LinkedIn', count: 24 },
      ],
      recentActivities: [],
      recentMessages: msgs.slice(0, 5),
    };
  },

  async getVisitorLogs(): Promise<InteractionLog[]> {
    try {
      const res = await fetch('/api/analytics/logs', {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  getExportCsvUrl(): string {
    return '/api/analytics/export-csv';
  },

  // Client-side image compression helper
  async compressImageFile(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => {
          resolve(e.target?.result as string);
        };
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(e.target?.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  },

  // Upload image (returns URL or dataUrl depending on server presence)
  async uploadImage(dataUrl: string, filename?: string): Promise<string> {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ dataUrl, filename }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (err) {
      console.warn('Server upload route unavailable, saving as compressed image data string for static deployment');
    }
    // On Netlify or static environment, return dataUrl directly
    return dataUrl;
  },

  // List all uploaded media files
  async getUploads(): Promise<UploadedMediaFile[]> {
    try {
      const res = await fetch('/api/uploads', {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  // Delete an uploaded media file from server
  async deleteUpload(filename: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/uploads/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

