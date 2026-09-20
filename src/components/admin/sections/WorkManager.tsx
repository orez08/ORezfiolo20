import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  FolderOpen,
  AlertTriangle,
  X,
} from 'lucide-react';
import { WorkProject } from '../../../types.ts';
import { api } from '../../../services/api.ts';
import { MediaLibraryModal } from '../MediaLibraryModal.tsx';

interface WorkManagerProps {
  projects: WorkProject[];
  onRefresh: () => Promise<void>;
}

export const WorkManager: React.FC<WorkManagerProps> = ({ projects, onRefresh }) => {
  const [editingProject, setEditingProject] = useState<Partial<WorkProject> | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<WorkProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'gallery' | 'general'>('general');

  const categories = [
    'Brand Identity',
    'Visual Design',
    'UI/UX',
    'Product Design',
    'Social Media',
    'Art Direction',
  ];

  const handleStartCreate = () => {
    setEditingProject({
      title: '',
      category: 'Brand Identity',
      year: `${new Date().getFullYear()}`,
      client: '',
      role: 'Lead Designer',
      coverImage: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
      gallery: [],
      description: '',
      metrics: '',
      tags: ['Identity', 'Guidelines'],
      featured: false,
      published: true,
      order: projects.length + 1,
    });
  };

  const handleSaveProject = async () => {
    if (!editingProject?.title?.trim()) {
      alert('Please provide a project title');
      return;
    }

    setSaving(true);
    try {
      await api.saveProject(editingProject);
      setEditingProject(null);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete.id);
    try {
      await api.deleteProject(projectToDelete.id);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
      setProjectToDelete(null);
    }
  };

  const handleTogglePublished = async (project: WorkProject) => {
    try {
      await api.saveProject({ ...project, published: !project.published });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update publish state');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploading(true);
    try {
      const optimized = await api.compressImageFile(file, 2000, 0.88);
      const url = await api.uploadImage(optimized, file.name);
      setEditingProject((prev) => (prev ? { ...prev, coverImage: url } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to upload cover image');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProject) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const optimized = await api.compressImageFile(file, 2000, 0.88);
        const url = await api.uploadImage(optimized, file.name);
        newUrls.push(url);
      }
      setEditingProject((prev) =>
        prev ? { ...prev, gallery: [...(prev.gallery || []), ...newUrls] } : null
      );
    } catch (err: any) {
      alert(err.message || 'Failed to upload gallery images');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleMediaSelect = (url: string) => {
    if (!editingProject) return;
    if (mediaTarget === 'cover') {
      setEditingProject({ ...editingProject, coverImage: url });
    } else if (mediaTarget === 'gallery') {
      setEditingProject({
        ...editingProject,
        gallery: [...(editingProject.gallery || []), url],
      });
    }
  };

  const removeCoverImage = () => {
    if (!editingProject) return;
    setEditingProject({ ...editingProject, coverImage: '' });
  };

  const addTag = () => {
    if (!tagInput.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      tags: [...(editingProject.tags || []), tagInput.trim()],
    });
    setTagInput('');
  };

  const removeTag = (t: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      tags: (editingProject.tags || []).filter((item) => item !== t),
    });
  };

  const removeGalleryImage = (idx: number) => {
    if (!editingProject) return;
    const updated = [...(editingProject.gallery || [])];
    updated.splice(idx, 1);
    setEditingProject({ ...editingProject, gallery: updated });
  };

  const addGalleryUrl = () => {
    if (!galleryUrlInput.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      gallery: [...(editingProject.gallery || []), galleryUrlInput.trim()],
    });
    setGalleryUrlInput('');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelectImage={handleMediaSelect}
        title={
          mediaTarget === 'cover'
            ? 'Select Primary Cover Image'
            : mediaTarget === 'gallery'
            ? 'Select Gallery Image'
            : 'Manage Uploaded Portfolio Media & Files'
        }
      />

      {/* Delete Project Confirmation Modal (100% iframe-safe, no window.confirm) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#181818] border border-red-500/40 rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-display font-medium text-lg text-white">
                Delete Portfolio Project?
              </h3>
            </div>
            <p className="text-xs text-white/70 font-sans">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{projectToDelete.title}"</strong>?
              This will remove this case study from your portfolio.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={deletingId === projectToDelete.id}
                className="px-4 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-sans transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                disabled={deletingId === projectToDelete.id}
                className="px-5 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-sans font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingId === projectToDelete.id ? 'Deleting...' : 'Yes, Delete Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Work / Selected Portfolio Showcase
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Curate project case studies, upload high-res imagery, and manage uploaded assets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMediaTarget('general');
              setShowMediaLibrary(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1C1C1C] border border-[#F5F1EA]/20 text-xs font-sans uppercase tracking-wider text-[#F5F1EA] hover:border-[#E8746A] transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-[#E8746A]" />
            <span>Uploaded Files Storage</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E1E] text-[#F5F1EA] text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Project</span>
          </button>
        </div>
      </div>

      {/* Editing / Creating Modal or Inline Panel */}
      {editingProject && (
        <div className="p-6 sm:p-8 rounded-sm bg-[#1C1C1C] border border-[#E8746A] space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-4">
            <h3 className="font-display text-lg text-[#F5F1EA]">
              {editingProject.id ? 'Edit Portfolio Case' : 'New Portfolio Project'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-1.5 rounded-full border border-[#F5F1EA]/20 text-xs text-[#F5F1EA]/60 hover:text-[#F5F1EA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={saving}
                className="px-5 py-1.5 rounded-full bg-[#E8746A] text-[#141414] text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F1EA]"
              >
                {saving ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Metadata */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, title: e.target.value })
                  }
                  placeholder="e.g. Kinetix Brand Architecture"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:border-[#E8746A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editingProject.category || 'Brand Identity'}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={editingProject.year || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, year: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, client: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Role / Deliverable Focus
                </label>
                <input
                  type="text"
                  value={editingProject.role || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, role: e.target.value })
                  }
                  placeholder="Lead Brand Architect & Design System"
                  className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Case Brief & Strategic Description
                </label>
                <textarea
                  rows={4}
                  value={editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Detailed breakdown of challenges, system architecture, and solution..."
                  className="w-full px-4 py-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans text-[#E8746A] uppercase mb-1">
                  Quantifiable Commercial Impact / Metrics
                </label>
                <input
                  type="text"
                  value={editingProject.metrics || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, metrics: e.target.value })
                  }
                  placeholder="e.g. +34% conversion increase, $4.2M capital round secured"
                  className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                />
              </div>
            </div>

            {/* Right: Cover & Gallery Uploads */}
            <div className="md:col-span-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase">
                    Primary Cover Image
                  </label>
                  {editingProject.coverImage && (
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="text-[10px] font-sans text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="aspect-[16/10] rounded-sm overflow-hidden bg-[#141414] border border-[#F5F1EA]/15 mb-2 relative group">
                  {editingProject.coverImage ? (
                    <img
                      src={editingProject.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#F5F1EA]/30 text-xs font-sans">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span>No cover uploaded</span>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-sans text-[#F5F1EA]">
                      Uploading...
                    </div>
                  )}

                  {editingProject.coverImage && (
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      title="Delete cover image"
                      className="absolute top-2 right-2 p-1.5 rounded-sm bg-red-950/80 hover:bg-red-700 text-white text-xs border border-red-500/40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-[11px] font-sans uppercase text-[#F5F1EA] hover:border-[#E8746A] cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#E8746A]" />
                      <span>Upload Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget('cover');
                        setShowMediaLibrary(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-[11px] font-sans uppercase text-[#F5F1EA] hover:border-[#E8746A]"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#E8746A]" />
                      <span>Library</span>
                    </button>
                  </div>

                  <input
                    type="url"
                    value={editingProject.coverImage || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, coverImage: e.target.value })
                    }
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-1.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-[11px] font-sans text-[#F5F1EA]"
                  />
                </div>
              </div>

              {/* Multi-image Gallery */}
              <div className="pt-2 border-t border-[#F5F1EA]/10">
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Multi-Image Gallery ({editingProject.gallery?.length || 0})
                </label>

                <div className="flex flex-wrap gap-2 mb-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-[10px] font-sans uppercase text-[#F5F1EA] hover:border-[#E8746A] cursor-pointer">
                    <Upload className="w-3 h-3 text-[#E8746A]" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaTarget('gallery');
                      setShowMediaLibrary(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-[10px] font-sans uppercase text-[#F5F1EA] hover:border-[#E8746A]"
                  >
                    <FolderOpen className="w-3 h-3 text-[#E8746A]" />
                    <span>Add from Library</span>
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    placeholder="Add image URL"
                    className="flex-1 px-2.5 py-1 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-[11px] font-sans text-[#F5F1EA]"
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    className="px-2.5 py-1 rounded-sm bg-[#141414] border border-[#F5F1EA]/20 text-[11px] font-sans text-[#F5F1EA]"
                  >
                    +
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {editingProject.gallery?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-sm overflow-hidden border border-[#F5F1EA]/10 group"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        title="Delete image from gallery"
                        className="absolute top-1 right-1 p-1 rounded-sm bg-red-600/90 text-white shadow-sm hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-2 border-t border-[#F5F1EA]/10">
                <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                  Deliverable Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. Fintech"
                    className="flex-1 px-2.5 py-1 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-2.5 py-1 rounded-sm bg-[#141414] border border-[#F5F1EA]/20 text-xs text-[#F5F1EA]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editingProject.tags?.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/80"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="text-[#E8746A]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Projects Table / Grid */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#F5F1EA]/15 rounded-sm p-8 text-xs font-sans text-[#F5F1EA]/50">
            No portfolio projects uploaded. Click "Upload New Project" above.
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className={`p-4 rounded-sm bg-[#181818] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                proj.published
                  ? 'border-[#F5F1EA]/10 hover:border-[#8B1E1E]'
                  : 'border-[#F5F1EA]/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-sm overflow-hidden bg-[#121212] flex-shrink-0 border border-[#F5F1EA]/10">
                  <img src={proj.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-medium text-base text-[#F5F1EA]">
                      {proj.title}
                    </h3>
                    {!proj.published && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#141414] text-[#F5F1EA]/40">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-sans text-[#F5F1EA]/50 flex items-center gap-2 mt-0.5">
                    <span className="text-[#E8746A]">{proj.category}</span>
                    <span>•</span>
                    <span>{proj.year}</span>
                    {proj.client && (
                      <>
                        <span>•</span>
                        <span>{proj.client}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F5F1EA]/10">
                <button
                  type="button"
                  onClick={() => handleTogglePublished(proj)}
                  title={proj.published ? 'Hide from public site' : 'Publish to site'}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/60 hover:text-[#E8746A]"
                >
                  {proj.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingProject(proj)}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/80 hover:text-[#E8746A]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setProjectToDelete(proj)}
                  title="Delete project"
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/40 hover:text-[#E8746A]"
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
