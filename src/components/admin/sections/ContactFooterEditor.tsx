import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { ContactContent } from '../../../types.ts';

interface ContactFooterEditorProps {
  contact: ContactContent;
  onSave: (updatedContact: ContactContent) => Promise<void>;
}

export const ContactFooterEditor: React.FC<ContactFooterEditorProps> = ({
  contact,
  onSave,
}) => {
  const [data, setData] = useState<ContactContent>({
    ...contact,
    socials: { ...contact.socials },
    projectBriefCategories: contact.projectBriefCategories || [
      'Brand Identity & Positioning',
      'Visual Design & Art Direction',
      'UI/UX & Digital Experience',
      'Social Media & Content Strategy',
      'Product Design & Systems',
      'Comprehensive Brand Partnership',
    ],
    projectBudgetCategories: contact.projectBudgetCategories || [
      '$5,000 – $10,000',
      '$10,000 – $25,000',
      '$25,000 – $50,000',
      '$50,000+',
      'Project Based (Custom)',
    ],
  });

  useEffect(() => {
    setData({
      ...contact,
      socials: { ...contact.socials },
      projectBriefCategories: contact.projectBriefCategories || [
        'Brand Identity & Positioning',
        'Visual Design & Art Direction',
        'UI/UX & Digital Experience',
        'Social Media & Content Strategy',
        'Product Design & Systems',
        'Comprehensive Brand Partnership',
      ],
      projectBudgetCategories: contact.projectBudgetCategories || [
        '$5,000 – $10,000',
        '$10,000 – $25,000',
        '$25,000 – $50,000',
        '$50,000+',
        'Project Based (Custom)',
      ],
    });
  }, [contact]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newBudgetInput, setNewBudgetInput] = useState('');

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

  const updateSocial = (key: keyof typeof data.socials, value: string) => {
    setData({
      ...data,
      socials: {
        ...data.socials,
        [key]: value,
      },
    });
  };

  const addCategory = () => {
    if (!newCategoryInput.trim()) return;
    setData({
      ...data,
      projectBriefCategories: [...(data.projectBriefCategories || []), newCategoryInput.trim()],
    });
    setNewCategoryInput('');
  };

  const removeCategory = (idx: number) => {
    const updated = [...(data.projectBriefCategories || [])];
    updated.splice(idx, 1);
    setData({ ...data, projectBriefCategories: updated });
  };

  const addBudget = () => {
    if (!newBudgetInput.trim()) return;
    setData({
      ...data,
      projectBudgetCategories: [...(data.projectBudgetCategories || []), newBudgetInput.trim()],
    });
    setNewBudgetInput('');
  };

  const removeBudget = (idx: number) => {
    const updated = [...(data.projectBudgetCategories || [])];
    updated.splice(idx, 1);
    setData({ ...data, projectBudgetCategories: updated });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Contact & Footer Settings
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Edit direct channels, WhatsApp connection, social handles, and copyright
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

      {/* Direct Contact Channels */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Direct Communication Channels
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Contact Email (mailto: link) *
            </label>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Phone Number (tel: link) *
            </label>
            <input
              type="text"
              required
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Custom WhatsApp Direct URL (or leave empty to use phone number)
          </label>
          <input
            type="url"
            value={data.whatsappUrl || ''}
            onChange={(e) => setData({ ...data, whatsappUrl: e.target.value })}
            placeholder="https://wa.me/234..."
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Studio Location Note
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Availability Badge Status
            </label>
            <input
              type="text"
              value={data.availability}
              onChange={(e) => setData({ ...data, availability: e.target.value })}
              className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
            />
          </div>
        </div>
      </div>

      {/* Project Brief Categories / Contact Form Dropdown Options */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Project Brief Categories (Contact Form Dropdown)
        </label>
        <p className="text-xs text-[#F5F1EA]/60">
          Manage the project disciplines and categories available for clients when submitting a project brief on the website.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="e.g. Generative AI & Creative Tech"
            className="flex-1 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
              }
            }}
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 rounded-sm bg-[#8B1E1E] text-white text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors"
          >
            + Add Category
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.projectBriefCategories?.map((cat, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10"
            >
              <span className="text-xs font-sans text-[#F5F1EA]">{cat}</span>
              <button
                type="button"
                onClick={() => removeCategory(idx)}
                className="text-xs text-red-400 hover:text-red-300 p-1"
                title="Remove category"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Investment / Budget Categories */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Estimated Investment / Budget Options (Contact Form Dropdown)
        </label>
        <p className="text-xs text-[#F5F1EA]/60">
          Manage the estimated investment ranges and budget tiers available for clients when submitting a project brief.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newBudgetInput}
            onChange={(e) => setNewBudgetInput(e.target.value)}
            placeholder="e.g. $10,000 – $25,000"
            className="flex-1 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addBudget();
              }
            }}
          />
          <button
            type="button"
            onClick={addBudget}
            className="px-4 py-2 rounded-sm bg-[#8B1E1E] text-white text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors"
          >
            + Add Budget Tier
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.projectBudgetCategories?.map((bud, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10"
            >
              <span className="text-xs font-sans text-[#F5F1EA]">{bud}</span>
              <button
                type="button"
                onClick={() => removeBudget(idx)}
                className="text-xs text-red-400 hover:text-red-300 p-1"
                title="Remove budget tier"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Headlines & Subtitles */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Contact Section Messaging (Voice: "I", "my")
        </label>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Main Contact Headline
          </label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => setData({ ...data, headline: e.target.value })}
            className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-base font-display text-[#F5F1EA]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Supportive Narrative
          </label>
          <textarea
            rows={3}
            value={data.subtext}
            onChange={(e) => setData({ ...data, subtext: e.target.value })}
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] resize-none"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Social Profiles & Networks
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={data.socials?.instagram || ''}
              onChange={(e) => updateSocial('instagram', e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              X (formerly Twitter) URL
            </label>
            <input
              type="url"
              value={data.socials?.twitter || ''}
              onChange={(e) => updateSocial('twitter', e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={data.socials?.linkedin || ''}
              onChange={(e) => updateSocial('linkedin', e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Facebook Profile URL
            </label>
            <input
              type="url"
              value={data.socials?.facebook || ''}
              onChange={(e) => updateSocial('facebook', e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Behance Portfolio URL
            </label>
            <input
              type="url"
              value={data.socials?.behance || ''}
              onChange={(e) => updateSocial('behance', e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
            />
          </div>
        </div>
      </div>

      {/* Footer Copy & Legal */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Footer Wordmark Note & Copyright
        </label>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Footer Sub-note
          </label>
          <input
            type="text"
            value={data.footerNote || ''}
            onChange={(e) => setData({ ...data, footerNote: e.target.value })}
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Copyright Line
          </label>
          <input
            type="text"
            value={data.copyrightText || ''}
            onChange={(e) => setData({ ...data, copyrightText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
          />
        </div>
      </div>
    </form>
  );
};
