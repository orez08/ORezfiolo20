import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { HeroContent } from '../../../types.ts';

interface HeroEditorProps {
  hero: HeroContent;
  onSave: (updatedHero: HeroContent) => Promise<void>;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ hero, onSave }) => {
  const [data, setData] = useState<HeroContent>({ ...hero });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newClient, setNewClient] = useState('');

  React.useEffect(() => {
    if (hero) {
      setData({ ...hero });
    }
  }, [hero]);

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

  const addClient = () => {
    if (!newClient.trim()) return;
    setData({
      ...data,
      marqueeClients: [...(data.marqueeClients || []), newClient.trim().toUpperCase()],
    });
    setNewClient('');
  };

  const removeClient = (idx: number) => {
    const updated = [...(data.marqueeClients || [])];
    updated.splice(idx, 1);
    setData({ ...data, marqueeClients: updated });
  };

  const updateBadge = (id: string, field: 'label' | 'sub', value: string) => {
    setData({
      ...data,
      floatingBadges: data.floatingBadges.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Header & Hero Section Editor
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Controls the overarching brand headline, subtitle, buttons, badges and marquee
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
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-discipline Tagline */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Sub-discipline Pill Tagline
        </label>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => setData({ ...data, tagline: e.target.value })}
          placeholder="Creative • Brand Designer • Visual Designer"
          className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
        />
      </div>

      {/* Core Statement Split (Prefix, Highlight, Suffix) */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-6">
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A] mb-1">
            Core Statement Headline (Hero)
          </label>
          <p className="text-xs text-[#F5F1EA]/50 font-sans mb-4">
            The highlighted word/phrase appears in the scarlet accent color with an accent underline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Statement Prefix
            </label>
            <textarea
              rows={3}
              value={data.statementPrefix}
              onChange={(e) => setData({ ...data, statementPrefix: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] resize-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-sans text-[#E8746A] uppercase mb-1">
              Highlight Word / Phrase
            </label>
            <input
              type="text"
              value={data.statementHighlight}
              onChange={(e) => setData({ ...data, statementHighlight: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#E8746A]/60 text-sm text-[#E8746A] font-semibold focus:outline-none focus:border-[#E8746A]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Suffix
            </label>
            <input
              type="text"
              value={data.statementSuffix}
              onChange={(e) => setData({ ...data, statementSuffix: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
            />
          </div>
        </div>

        {/* Live Preview of Headline */}
        <div className="p-4 rounded-sm bg-[#141414] border border-[#F5F1EA]/5">
          <div className="text-[10px] font-sans uppercase tracking-widest text-[#F5F1EA]/40 mb-2">
            Live Preview
          </div>
          <div className="font-display text-xl sm:text-2xl text-[#F5F1EA]">
            {data.statementPrefix}{' '}
            <span className="text-[#E8746A] underline decoration-[#8B1E1E]">
              {data.statementHighlight}
            </span>
            {data.statementSuffix}
          </div>
        </div>
      </div>

      {/* Subtitle / Voice statement */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Hero Subtitle & Bio Hook (First Person "I", "my")
        </label>
        <textarea
          rows={3}
          value={data.subtitle}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          CTA Button Labels
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Primary Action Button (Solid)
            </label>
            <input
              type="text"
              value={data.ctaPrimaryText}
              onChange={(e) => setData({ ...data, ctaPrimaryText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Secondary Action Button (Ghost)
            </label>
            <input
              type="text"
              value={data.ctaSecondaryText}
              onChange={(e) => setData({ ...data, ctaSecondaryText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
            />
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Floating Reference Tags / Credibility Badges
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.floatingBadges?.map((badge) => (
            <div
              key={badge.id}
              className="p-3.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 space-y-2"
            >
              <input
                type="text"
                value={badge.label}
                onChange={(e) => updateBadge(badge.id, 'label', e.target.value)}
                placeholder="Tag Label"
                className="w-full px-3 py-1.5 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs text-[#E8746A] font-semibold font-sans"
              />
              <input
                type="text"
                value={badge.sub}
                onChange={(e) => updateBadge(badge.id, 'sub', e.target.value)}
                placeholder="Tag Subtext"
                className="w-full px-3 py-1.5 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Clients */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Infinite Scrolling Marquee Clients / Brands
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="Add brand name (e.g. KINETIX LABS)"
            className="flex-1 px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addClient();
              }
            }}
          />
          <button
            type="button"
            onClick={addClient}
            className="px-5 py-2.5 rounded-sm bg-[#8B1E1E] text-[#F5F1EA] hover:bg-[#E8746A] hover:text-[#141414] text-xs font-sans uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {data.marqueeClients?.map((client, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]/80"
            >
              <span>{client}</span>
              <button
                type="button"
                onClick={() => removeClient(idx)}
                className="text-[#F5F1EA]/40 hover:text-[#E8746A]"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </form>
  );
};
