import { api } from '../services/api.ts';
import { InteractionType } from '../types.ts';

const VISITOR_ID_KEY = 'orez_visitor_id';
const VISITOR_NAME_KEY = 'orez_visitor_name';
const VISITOR_EMAIL_KEY = 'orez_visitor_email';
const CONSENT_KEY = 'orez_cookie_consent';

export function getOrCreateVisitorId(): string {
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export function saveVisitorIdentity(name: string, email: string) {
  localStorage.setItem(VISITOR_NAME_KEY, name);
  localStorage.setItem(VISITOR_EMAIL_KEY, email);
}

export function getVisitorIdentity(): { name?: string; email?: string } {
  return {
    name: localStorage.getItem(VISITOR_NAME_KEY) || undefined,
    email: localStorage.getItem(VISITOR_EMAIL_KEY) || undefined,
  };
}

export function hasGivenConsent(): boolean | null {
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'accepted') return true;
  if (v === 'declined') return false;
  return null;
}

export function setCookieConsent(accepted: boolean) {
  localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined');
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Browser';
}

const trackedSections = new Set<string>();

export function trackAction(
  interactionType: InteractionType,
  data?: {
    page?: string;
    section?: string;
    projectTitle?: string;
    details?: string;
  }
) {
  const consent = hasGivenConsent();
  if (consent === false) return; // respect user preference

  const visitorId = getOrCreateVisitorId();
  const identity = getVisitorIdentity();

  api.trackInteraction({
    visitorId,
    visitorName: identity.name,
    visitorEmail: identity.email,
    page: data?.page || window.location.pathname,
    section: data?.section,
    projectTitle: data?.projectTitle,
    interactionType,
    details: data?.details,
    device: detectDevice(),
    browser: detectBrowser(),
    referrer: document.referrer || 'Direct Visit',
    approxLocation: 'Lagos, NG', // Default regional estimate for visitor context
  });
}

export function trackSectionView(sectionId: string) {
  if (trackedSections.has(sectionId)) return;
  trackedSections.add(sectionId);
  trackAction('section_view', {
    section: sectionId,
    details: `Viewed section #${sectionId}`,
  });
}

export function trackVisitorSession() {
  trackAction('visit', {
    page: window.location.pathname || '/',
    details: 'Initial page visit session started',
  });
}

