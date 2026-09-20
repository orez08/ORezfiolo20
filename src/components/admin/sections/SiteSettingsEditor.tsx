import React, { useState } from 'react';
import { Save, CheckCircle2, Shield, Palette } from 'lucide-react';
import { SiteSettings } from '../../../types.ts';

interface SiteSettingsEditorProps {
  settings: SiteSettings;
  onSave: (updatedSettings: SiteSettings) => Promise<void>;
}

export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({
  settings,
  onSave,
}) => {
  const [data, setData] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSave(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Site Settings & Brand Controls
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Brand wordmark, SEO metadata, verified brand color palette & consent regulations
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F5F1EA] text-[#141414] font-semibold text-xs uppercase tracking-wider hover:bg-[#E8746A] transition-colors shadow-lg disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>Saved Instantly</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>

      {/* Brand Identity & Wordmark */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Brand Identity & Wordmark
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Studio Wordmark *
            </label>
            <input
              type="text"
              required
              value={data.brandWordmark}
              onChange={(e) => setData({ ...data, brandWordmark: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] font-display"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Brand Submark / Monogram
            </label>
            <input
              type="text"
              value={data.brandSubmark}
              onChange={(e) => setData({ ...data, brandSubmark: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] font-sans"
            />
          </div>
        </div>
      </div>

      {/* Strict Brand Palette */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#E8746A]" />
          <label className="text-xs font-sans uppercase tracking-widest text-[#E8746A]">
            Verified Brand Palette (Strict Aesthetic Constraint)
          </label>
        </div>
        <p className="text-xs text-[#F5F1EA]/50 font-sans">
          Per brand guidelines, colors are strictly locked to Charcoal, Ivory, and subtle Red accents.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-[#141414] border border-[#F5F1EA]/30" />
            <div>
              <div className="text-[11px] font-sans text-[#F5F1EA]">Charcoal Base</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/40">#141414</div>
            </div>
          </div>

          <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-[#F5F1EA] border border-black/30" />
            <div>
              <div className="text-[11px] font-sans text-[#F5F1EA]">Ivory Surface</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/40">#F5F1EA</div>
            </div>
          </div>

          <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-[#8B1E1E]" />
            <div>
              <div className="text-[11px] font-sans text-[#F5F1EA]">Dark Red</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/40">#8B1E1E</div>
            </div>
          </div>

          <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-[#E8746A]" />
            <div>
              <div className="text-[11px] font-sans text-[#F5F1EA]">Light Red Accent</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/40">#E8746A</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Configuration */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Search Engine Optimization (SEO) & Social Meta
        </label>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Browser Page Title & OpenGraph Title
          </label>
          <input
            type="text"
            value={data.siteTitle}
            onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Meta Description (Search Snippet)
          </label>
          <textarea
            rows={3}
            value={data.siteDescription}
            onChange={(e) => setData({ ...data, siteDescription: e.target.value })}
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] resize-none"
          />
        </div>
      </div>

      {/* Analytics & Consent Banner */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 flex items-center justify-between">
        <div>
          <div className="font-display font-medium text-sm text-[#F5F1EA]">
            Visitor Cookie & Analytics Consent Notice
          </div>
          <div className="text-xs font-sans text-[#F5F1EA]/50 mt-0.5">
            Display bottom privacy banner asking visitors for tracking permission
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setData({ ...data, enableCookieConsent: !data.enableCookieConsent })
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            data.enableCookieConsent ? 'bg-[#8B1E1E]' : 'bg-[#141414] border border-[#F5F1EA]/20'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-[#F5F1EA] transition-transform ${
              data.enableCookieConsent ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </form>
  );
};
