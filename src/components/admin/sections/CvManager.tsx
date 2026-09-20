import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Save, FileText, Download, Upload, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { CvItem } from '../../../types.ts';
import { api } from '../../../services/api.ts';

interface CvManagerProps {
  cvItems: CvItem[];
  onRefresh: () => Promise<void>;
}

export const CvManager: React.FC<CvManagerProps> = ({ cvItems = [], onRefresh }) => {
  const [items, setItems] = useState<CvItem[]>([...cvItems]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CvItem>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleStartEdit = (cv: CvItem) => {
    setEditingId(cv.id);
    setEditForm({ ...cv });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editForm.title?.trim()) {
      alert('CV Title is required');
      return;
    }
    setSaving(true);
    try {
      const updatedList = items.map((item) =>
        item.id === editingId ? ({ ...item, ...editForm, updatedAt: new Date().toISOString().split('T')[0] } as CvItem) : item
      );
      await api.updatePortfolio({ cvItems: updatedList });
      setItems(updatedList);
      setEditingId(null);
      await onRefresh();
      setSuccessMsg('CV updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving CV');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    setSaving(true);
    try {
      const newCv: CvItem = {
        id: `cv-${Date.now()}`,
        title: 'New Professional Resume / CV',
        category: 'Brand Design & Art Direction',
        fileUrl: '',
        fileName: 'Resume_2026.pdf',
        fileSize: '1.5 MB',
        updatedAt: new Date().toISOString().split('T')[0],
        published: true,
        order: items.length + 1,
      };
      const updatedList = [newCv, ...items];
      await api.updatePortfolio({ cvItems: updatedList });
      setItems(updatedList);
      handleStartEdit(newCv);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error creating CV item');
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
      const updatedList = items.filter((item) => item.id !== id);
      await api.updatePortfolio({ cvItems: updatedList });
      setItems(updatedList);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting CV');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (cv: CvItem) => {
    try {
      const updatedList = items.map((item) =>
        item.id === cv.id ? { ...item, published: !item.published } : item
      );
      await api.updatePortfolio({ cvItems: updatedList });
      setItems(updatedList);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileUrl = await api.uploadImage(dataUrl, file.name);

      setEditForm((prev) => ({
        ...prev,
        fileUrl,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }));
      setSuccessMsg('File uploaded successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-[#F5F1EA] tracking-tight">
            CV & Resume Manager
          </h1>
          <p className="text-xs font-sans text-[#F5F1EA]/50 uppercase tracking-widest mt-1">
            Manage downloadable professional CVs and categorized resume documents for the website header
          </p>
        </div>

        <button
          onClick={handleAddNew}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E1E] text-white text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New CV</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-sm bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* CV List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-12 text-center rounded-sm bg-[#181818] border border-[#F5F1EA]/10">
            <FileText className="w-8 h-8 text-[#E8746A] mx-auto mb-3 opacity-50" />
            <p className="text-sm font-sans text-[#F5F1EA]/60">No CV documents uploaded yet.</p>
            <button
              onClick={handleAddNew}
              className="mt-4 px-4 py-2 rounded-sm bg-[#8B1E1E] text-white text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-black transition-colors"
            >
              Upload First CV
            </button>
          </div>
        ) : (
          items.map((cv) => {
            const isEditing = editingId === cv.id;

            return (
              <div
                key={cv.id}
                className={`p-6 rounded-sm border transition-all ${
                  isEditing
                    ? 'bg-[#1C1C1C] border-[#E8746A]'
                    : 'bg-[#181818] border-[#F5F1EA]/10 hover:border-[#8B1E1E]'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-4">
                      <span className="text-xs font-sans text-[#E8746A] uppercase tracking-wider">
                        Editing CV Document
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-sm border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]/70 hover:text-[#F5F1EA]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[#8B1E1E] text-white text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-black transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save CV</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                          CV Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-white"
                          placeholder="e.g. Senior Brand Design CV 2026"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                          Category / Discipline Tag
                        </label>
                        <input
                          type="text"
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-white"
                          placeholder="e.g. Brand Identity & Art Direction"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                          File URL / Document Upload
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editForm.fileUrl || ''}
                            onChange={(e) => setEditForm({ ...editForm, fileUrl: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-white font-sans"
                            placeholder="/uploads/resume.pdf"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/20 text-xs font-sans text-[#E8746A] hover:bg-[#1C1C1C] cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploading ? 'Uploading...' : 'Browse'}</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#F5F1EA]/60 uppercase mb-1">
                          File Name & Size (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editForm.fileName || ''}
                            onChange={(e) => setEditForm({ ...editForm, fileName: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-white"
                            placeholder="Resume.pdf"
                          />
                          <input
                            type="text"
                            value={editForm.fileSize || ''}
                            onChange={(e) => setEditForm({ ...editForm, fileSize: e.target.value })}
                            className="w-24 px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-white text-center"
                            placeholder="2.4 MB"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#E8746A]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-medium text-base text-white">
                            {cv.title}
                          </span>
                          {!cv.published && (
                            <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 text-[10px] font-sans uppercase">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#F5F1EA]/50">
                          <span className="text-[#E8746A]">{cv.category}</span>
                          <span>•</span>
                          <span>{cv.fileName || 'document.pdf'} ({cv.fileSize || '1.5 MB'})</span>
                          <span>•</span>
                          <span>Updated {cv.updatedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {cv.fileUrl && (
                        <a
                          href={cv.fileUrl}
                          download={cv.fileName || 'CV.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-sm border border-[#F5F1EA]/15 text-[#F5F1EA]/70 hover:text-[#E8746A] hover:border-[#E8746A] transition-colors"
                          title="Download CV"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleTogglePublish(cv)}
                        className="p-2 rounded-sm border border-[#F5F1EA]/15 text-[#F5F1EA]/70 hover:text-[#E8746A] hover:border-[#E8746A] transition-colors"
                        title={cv.published ? 'Unpublish' : 'Publish'}
                      >
                        {cv.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleStartEdit(cv)}
                        className="p-2 rounded-sm border border-[#F5F1EA]/15 text-[#F5F1EA]/70 hover:text-[#E8746A] hover:border-[#E8746A] transition-colors"
                        title="Edit CV"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(cv.id)}
                        className={`p-2 rounded-sm border transition-colors ${
                          deletingId === cv.id
                            ? 'bg-red-600 text-white border-red-500 animate-pulse'
                            : 'border-[#F5F1EA]/15 text-[#F5F1EA]/50 hover:text-red-400 hover:border-red-500'
                        }`}
                        title={deletingId === cv.id ? 'Click again to permanently delete' : 'Delete CV'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
