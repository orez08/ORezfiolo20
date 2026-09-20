import React, { useState } from 'react';
import {
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { AboutContent, StatItem } from '../../../types.ts';
import { api } from '../../../services/api.ts';
import { MediaLibraryModal } from '../MediaLibraryModal.tsx';

interface AboutEditorProps {
  about: AboutContent;
  onSave: (updatedAbout: AboutContent) => Promise<void>;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({ about, onSave }) => {
  const [data, setData] = useState<AboutContent>({ ...about });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [newChip, setNewChip] = useState('');

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSave(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadStatus('Optimizing image for web...');
    setUploadError(null);

    try {
      // 1. Optimize image through canvas
      const optimizedBase64 = await api.compressImageFile(file, 1600, 0.88);

      // 2. Upload to server
      setUploadStatus('Saving to server...');
      const uploadedUrl = await api.uploadImage(
        optimizedBase64,
        `portrait_${Date.now()}`
      );

      // 3. Update local state
      const updated = { ...data, portraitUrl: uploadedUrl };
      setData(updated);

      // 4. Immediately persist to database so it is never lost!
      setUploadStatus('Persisting portrait...');
      await onSave(updated);

      setUploadStatus('Portrait uploaded and saved successfully!');
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      console.error('Portrait upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePortrait = async () => {
    const updated = { ...data, portraitUrl: '' };
    setData(updated);
    setSaving(true);
    try {
      await onSave(updated);
      setUploadStatus('Portrait removed and saved.');
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFromLibrary = async (url: string) => {
    const updated = { ...data, portraitUrl: url };
    setData(updated);
    setSaving(true);
    try {
      await onSave(updated);
      setUploadStatus('Portrait updated from library.');
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (id: string, field: keyof StatItem, value: string) => {
    setData({
      ...data,
      stats: data.stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const addStat = () => {
    const newId = `s-${Date.now()}`;
    setData({
      ...data,
      stats: [...data.stats, { id: newId, value: '10+', label: 'New Metric', description: '' }],
    });
  };

  const removeStat = (id: string) => {
    setData({
      ...data,
      stats: data.stats.filter((s) => s.id !== id),
    });
  };

  const addDiscipline = () => {
    if (!newChip.trim()) return;
    setData({
      ...data,
      disciplineChips: [...(data.disciplineChips || []), newChip.trim()],
    });
    setNewChip('');
  };

  const removeDiscipline = (chipToRemove: string) => {
    setData({
      ...data,
      disciplineChips: data.disciplineChips.filter((c) => c !== chipToRemove),
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelectImage={handleSelectFromLibrary}
        title="Select or Manage Portrait Images"
      />

      <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            About Section & Portrait Editor
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Edit biography, replace lead editorial portrait, manage stats row & disciplines
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

      {/* Upload notification banners */}
      {uploadStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-sm text-xs font-sans text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadStatus(null)}
            className="text-emerald-400 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-sm text-xs font-sans text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Portrait Management */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-6">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
            Professional Editorial Portrait
          </label>
          <button
            type="button"
            onClick={() => setShowMediaLibrary(true)}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-[#F5F1EA]/70 hover:text-[#E8746A] transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Media Library / Storage</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-4 aspect-[4/5] rounded-sm overflow-hidden bg-[#141414] border border-[#F5F1EA]/15 relative group">
            <img
              src={data.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'}
              alt="ORez"
              className="w-full h-full object-cover grayscale"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-xs font-sans text-[#F5F1EA] gap-2 p-2 text-center">
                <div className="w-5 h-5 border-2 border-[#E8746A] border-t-transparent rounded-full animate-spin" />
                <span>{uploadStatus || 'Processing image...'}</span>
              </div>
            )}

            {data.portraitUrl && !uploadingImage && (
              <button
                type="button"
                onClick={handleRemovePortrait}
                title="Remove portrait picture"
                className="absolute top-2 right-2 p-1.5 rounded-sm bg-red-950/80 hover:bg-red-700 text-white text-xs border border-red-500/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-8 space-y-4">
            <div>
              <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-2">
                Upload New Image File (Auto-compressed & Instantly Saved)
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E1E] hover:bg-[#E8746A] text-xs font-sans uppercase tracking-wider text-[#F5F1EA] hover:text-[#141414] cursor-pointer transition-colors shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose & Upload Picture'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1C1C1C] border border-[#F5F1EA]/20 text-xs font-sans uppercase tracking-wider text-[#F5F1EA] hover:border-[#E8746A] transition-colors"
                >
                  <FolderOpen className="w-4 h-4 text-[#E8746A]" />
                  <span>Browse Uploads</span>
                </button>

                {data.portraitUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePortrait}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1C1C] border border-red-500/30 text-xs font-sans uppercase tracking-wider text-red-400 hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                Or Direct Image URL
              </label>
              <input
                type="url"
                value={data.portraitUrl}
                onChange={(e) => setData({ ...data, portraitUrl: e.target.value })}
                placeholder="https://... or /uploads/filename.jpg"
                className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Floating Badge Text
                </label>
                <input
                  type="text"
                  value={data.portraitBadge}
                  onChange={(e) => setData({ ...data, portraitBadge: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Portrait Caption
                </label>
                <input
                  type="text"
                  value={data.portraitCaption}
                  onChange={(e) => setData({ ...data, portraitCaption: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy & Headline */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Editorial Intro & Biography
        </label>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Section Title / Number
          </label>
          <div className="grid grid-cols-12 gap-3">
            <input
              type="text"
              value={data.sectionNumber}
              onChange={(e) => setData({ ...data, sectionNumber: e.target.value })}
              className="col-span-2 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#E8746A]"
            />
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="col-span-10 px-4 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Intro Editorial Headline
          </label>
          <input
            type="text"
            value={data.introHeading}
            onChange={(e) => setData({ ...data, introHeading: e.target.value })}
            className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm font-display text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Primary Bio Statement (Lead Paragraph - Voice: "I", "my")
          </label>
          <textarea
            rows={3}
            value={data.mainBio}
            onChange={(e) => setData({ ...data, mainBio: e.target.value })}
            className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
            Secondary Strategic Philosophy
          </label>
          <textarea
            rows={3}
            value={data.secondaryBio}
            onChange={(e) => setData({ ...data, secondaryBio: e.target.value })}
            className="w-full px-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] resize-none"
          />
        </div>
      </div>

      {/* Stats Row Management */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans uppercase tracking-widest text-[#E8746A]">
            Stats Row (Large Numbers with Captions)
          </label>
          <button
            type="button"
            onClick={addStat}
            className="text-xs font-sans uppercase text-[#E8746A] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stat Metric</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.stats.map((stat) => (
            <div
              key={stat.id}
              className="p-4 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 space-y-2 relative group"
            >
              <button
                type="button"
                onClick={() => removeStat(stat.id)}
                className="absolute top-3 right-3 text-[#F5F1EA]/40 hover:text-[#E8746A]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2 pr-6">
                <div>
                  <label className="text-[10px] font-sans text-[#F5F1EA]/50 uppercase block mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-sm font-display font-semibold text-[#E8746A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans text-[#F5F1EA]/50 uppercase block mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-sans text-[#F5F1EA]/50 uppercase block mb-1">
                  Brief Subtext
                </label>
                <input
                  type="text"
                  value={stat.description || ''}
                  onChange={(e) => updateStat(stat.id, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]/70"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discipline Chips */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-4">
        <label className="block text-xs font-sans uppercase tracking-widest text-[#E8746A]">
          Core Discipline / Skill Chips
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={newChip}
            onChange={(e) => setNewChip(e.target.value)}
            placeholder="Add specialty (e.g. Brand Architecture)"
            className="flex-1 px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDiscipline();
              }
            }}
          />
          <button
            type="button"
            onClick={addDiscipline}
            className="px-5 py-2.5 rounded-sm bg-[#8B1E1E] text-[#F5F1EA] hover:bg-[#E8746A] hover:text-[#141414] text-xs font-sans uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chip</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {data.disciplineChips?.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/15 text-xs font-medium text-[#F5F1EA]"
            >
              <span>{chip}</span>
              <button
                type="button"
                onClick={() => removeDiscipline(chip)}
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
