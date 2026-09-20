import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Upload, Eye, EyeOff, CheckCircle2, Quote } from 'lucide-react';
import { Testimonial } from '../../../types.ts';
import { api } from '../../../services/api.ts';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => Promise<void>;
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({
  testimonials,
  onRefresh,
}) => {
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleStartCreate = () => {
    setEditingItem({
      authorName: '',
      authorRole: 'CEO / Founder',
      company: '',
      feedbackText: '',
      avatarUrl: '',
      screenshotUrl: '',
      published: true,
      featured: true,
      order: testimonials.length + 1,
    });
  };

  const handleSave = async () => {
    if (!editingItem?.authorName?.trim() || !editingItem?.feedbackText?.trim()) {
      alert('Please provide client name and endorsement text');
      return;
    }

    setSaving(true);
    try {
      await api.saveTestimonial(editingItem);
      setEditingItem(null);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving endorsement');
    } finally {
      setSaving(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId((curr) => (curr === id ? null : curr)), 4000);
      return;
    }
    try {
      await api.deleteTestimonial(id);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting testimonial');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (t: Testimonial) => {
    try {
      await api.saveTestimonial({ ...t, published: !t.published });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const url = await api.uploadImage(base64, `feedback_${file.name}`);
          setEditingItem((prev) => (prev ? { ...prev, screenshotUrl: url } : null));
        } catch {
          setEditingItem((prev) => (prev ? { ...prev, screenshotUrl: base64 } : null));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Testimonials & Client Feedback
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Display authoritative client endorsements and optional feedback screenshot captures
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E1E] text-[#F5F1EA] text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {editingItem && (
        <div className="p-6 sm:p-8 rounded-sm bg-[#1C1C1C] border border-[#E8746A] space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-4">
            <h3 className="font-display text-lg text-[#F5F1EA]">
              {editingItem.id ? 'Edit Testimonial' : 'Add New Client Endorsement'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-1.5 rounded-full border border-[#F5F1EA]/20 text-xs text-[#F5F1EA]/60 hover:text-[#F5F1EA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-1.5 rounded-full bg-[#E8746A] text-[#141414] text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F1EA]"
              >
                {saving ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={editingItem.authorName || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, authorName: e.target.value })
                }
                placeholder="e.g. Dr. Adeyemi Adeleke"
                className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={editingItem.authorRole || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, authorRole: e.target.value })
                }
                placeholder="Chief Executive Officer"
                className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={editingItem.company || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, company: e.target.value })
                }
                placeholder="Kinetix Global"
                className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
              Endorsement Quote / Feedback *
            </label>
            <textarea
              rows={4}
              required
              value={editingItem.feedbackText || ''}
              onChange={(e) =>
                setEditingItem({ ...editingItem, feedbackText: e.target.value })
              }
              placeholder="What specific impact, growth outcome, or strategic clarity did Moses deliver?"
              className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] resize-none"
            />
          </div>

          {/* Feedback screenshot image upload */}
          <div className="border-t border-[#F5F1EA]/10 pt-4">
            <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-2">
              Optional Client Feedback Screenshot Image (WhatsApp / Email / Slack proof)
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-xs font-sans uppercase text-[#F5F1EA] hover:border-[#E8746A] cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#E8746A]" />
                <span>Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                value={editingItem.screenshotUrl || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, screenshotUrl: e.target.value })
                }
                placeholder="Or paste screenshot URL"
                className="flex-1 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]"
              />
            </div>

            {editingItem.screenshotUrl && (
              <div className="mt-3 w-40 h-24 rounded-sm overflow-hidden border border-[#F5F1EA]/20 relative">
                <img
                  src={editingItem.screenshotUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, screenshotUrl: '' })}
                  className="absolute top-1 right-1 p-1 bg-red-900 rounded-full text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#F5F1EA]/15 rounded-sm p-8 text-xs font-sans text-[#F5F1EA]/50">
            No client feedback recorded yet. Click "Add Testimonial" above.
          </div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-sm bg-[#181818] border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                t.published
                  ? 'border-[#F5F1EA]/10 hover:border-[#8B1E1E]'
                  : 'border-[#F5F1EA]/5 opacity-60'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-medium text-base text-[#F5F1EA]">
                    {t.authorName}
                  </span>
                  <span className="text-xs font-sans text-[#F5F1EA]/50">
                    • {t.authorRole}, {t.company}
                  </span>
                </div>
                <p className="text-xs text-[#F5F1EA]/75 line-clamp-2 italic leading-relaxed">
                  "{t.feedbackText}"
                </p>
                {t.screenshotUrl && (
                  <span className="inline-block text-[10px] font-sans text-[#E8746A] border border-[#8B1E1E]/40 px-2 py-0.5 rounded-full">
                    Includes verified screenshot attachment
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(t)}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/60 hover:text-[#E8746A]"
                >
                  {t.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(t)}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/80 hover:text-[#E8746A]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  title={deletingId === t.id ? 'Click again to confirm deletion' : 'Delete testimonial'}
                  className={`p-2 rounded-sm border transition-colors ${
                    deletingId === t.id
                      ? 'bg-red-600 text-white border-red-500 animate-pulse'
                      : 'bg-[#141414] border-[#F5F1EA]/10 text-[#F5F1EA]/40 hover:text-[#E8746A]'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
