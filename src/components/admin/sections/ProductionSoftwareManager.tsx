import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Eye, EyeOff, Cpu, CheckCircle2, Sparkles, Wrench } from 'lucide-react';
import { SoftwareTool } from '../../../types.ts';
import { api } from '../../../services/api.ts';

interface ProductionSoftwareManagerProps {
  software: SoftwareTool[];
  onRefresh: () => Promise<void>;
}

export const ProductionSoftwareManager: React.FC<ProductionSoftwareManagerProps> = ({
  software = [],
  onRefresh,
}) => {
  const [items, setItems] = useState<SoftwareTool[]>([...software]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SoftwareTool>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (software) {
      setItems([...software]);
    }
  }, [software]);

  const handleStartEdit = (tool: SoftwareTool) => {
    setEditingId(tool.id);
    setEditForm({ ...tool });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editForm.name?.trim()) return;
    setSaving(true);
    try {
      await api.saveSoftwareTool(editForm);
      setEditingId(null);
      await onRefresh();
      setSuccessMsg('Software tool updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving software tool');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async (preset?: Partial<SoftwareTool>) => {
    setSaving(true);
    try {
      const count = items.length + 1;
      const newTool: Partial<SoftwareTool> = preset || {
        name: 'New Software Tool',
        level: 'Mastery',
        category: 'Motion Graphics & Visual FX',
        published: true,
        order: count,
      };
      const created = await api.saveSoftwareTool(newTool);
      await onRefresh();
      handleStartEdit(created);
    } catch (err: any) {
      alert(err.message || 'Error creating software tool');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId((curr) => (curr === id ? null : curr)), 4000);
      return;
    }
    try {
      await api.deleteSoftwareTool(id);
      await onRefresh();
      setSuccessMsg('Tool removed');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting software tool');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (tool: SoftwareTool) => {
    try {
      await api.saveSoftwareTool({ ...tool, published: !tool.published });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const LEVEL_OPTIONS = ['Mastery', 'Advanced', 'Proficient', 'Expert', 'Specialist'];

  const SOFTWARE_PRESETS = [
    { name: 'Adobe After Effects', level: 'Mastery', category: 'Motion Graphics & FX' },
    { name: 'Adobe Photoshop', level: 'Mastery', category: 'Compositing & Retouch' },
    { name: 'Adobe Illustrator', level: 'Mastery', category: 'Vector & Typography' },
    { name: 'Adobe Premiere Pro', level: 'Advanced', category: 'Video Editing & Pacing' },
    { name: 'Adobe Lightroom', level: 'Advanced', category: 'Color Grading & Tone' },
    { name: 'Figma', level: 'Advanced', category: 'Brand Systems & Layout' },
    { name: 'Blender 3D', level: 'Advanced', category: '3D Modeling & Rendering' },
    { name: 'Cinema 4D', level: 'Proficient', category: '3D Animation & Motion' },
    { name: 'CorelDraw', level: 'Mastery', category: 'Vector Illustration & Print' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181818] p-6 rounded-lg border border-[#F5F1EA]/10">
        <div>
          <div className="flex items-center gap-2 text-[#E8746A] text-xs font-sans uppercase tracking-widest mb-1">
            <Cpu className="w-4 h-4" />
            <span>Dashboard Toolkit Category</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-[#F5F1EA]">
            Production Software & Toolkit
          </h2>
          <p className="text-xs text-[#F5F1EA]/60 mt-1 max-w-xl">
            Manage your design tools, software mastery levels, and creative specialties. These items display prominently on the public capabilities section.
          </p>
        </div>

        <button
          onClick={() => handleAddNew()}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#8B1E1E] text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-[#E8746A] transition-colors shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Software</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded bg-[#8B1E1E]/20 border border-[#E8746A]/40 text-[#F5F1EA] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#E8746A]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Add Presets Bar */}
      <div className="bg-[#121212] p-4 rounded-lg border border-[#F5F1EA]/10">
        <div className="flex items-center gap-2 text-xs font-sans text-[#F5F1EA]/70 mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#E8746A]" />
          <span>Quick Preset Shortcuts (1-Click Add)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOFTWARE_PRESETS.map((p) => {
            const exists = items.some((i) => i.name.toLowerCase() === p.name.toLowerCase());
            return (
              <button
                key={p.name}
                onClick={() => !exists && handleAddNew(p)}
                disabled={exists || saving}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  exists
                    ? 'border-white/10 text-white/30 bg-black/20 cursor-not-allowed'
                    : 'border-[#E8746A]/30 text-white/80 hover:text-white hover:border-[#E8746A] hover:bg-[#8B1E1E]/20'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-[#E8746A] font-semibold">({p.level})</span>
                {exists && <CheckCircle2 className="w-3 h-3 text-white/30" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((tool, idx) => {
          const isEditing = editingId === tool.id;

          if (isEditing) {
            return (
              <div
                key={tool.id}
                className="bg-[#1C1C1C] p-5 rounded-lg border-2 border-[#E8746A] space-y-4 md:col-span-2 lg:col-span-3 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-sans font-semibold uppercase text-[#E8746A]">
                    Edit Software Tool #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#8B1E1E] text-white text-xs font-semibold hover:bg-[#E8746A] transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-sans uppercase text-white/60 mb-1">
                      Software Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Adobe After Effects"
                      className="w-full bg-[#141414] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8746A]"
                    />
                  </div>

                  {/* Level */}
                  <div>
                    <label className="block text-[11px] font-sans uppercase text-white/60 mb-1">
                      Proficiency Level
                    </label>
                    <select
                      value={editForm.level || 'Mastery'}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      className="w-full bg-[#141414] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8746A]"
                    >
                      {LEVEL_OPTIONS.map((lvl) => (
                        <option key={lvl} value={lvl} className="bg-[#141414] text-white">
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category / Specialty */}
                  <div>
                    <label className="block text-[11px] font-sans uppercase text-white/60 mb-1">
                      Specialty / Focus
                    </label>
                    <input
                      type="text"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="e.g. Motion Graphics & FX"
                      className="w-full bg-[#141414] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8746A]"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-[11px] font-sans uppercase text-white/60 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={editForm.order || 1}
                      onChange={(e) =>
                        setEditForm({ ...editForm, order: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-[#141414] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8746A]"
                    />
                  </div>

                  {/* Published Toggle */}
                  <div className="flex items-center gap-3 pt-4">
                    <label className="text-xs text-white/80 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.published !== false}
                        onChange={(e) =>
                          setEditForm({ ...editForm, published: e.target.checked })
                        }
                        className="rounded bg-[#141414] border-white/20 text-[#E8746A] focus:ring-0"
                      />
                      <span>Show on Public Site</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={tool.id}
              className={`bg-[#181818] p-5 rounded-lg border transition-all flex flex-col justify-between group ${
                tool.published === false
                  ? 'border-white/10 opacity-50'
                  : 'border-white/15 hover:border-[#E8746A]/60 hover:bg-[#1c1c1c]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#A8FF3E] uppercase tracking-wider bg-[#A8FF3E]/10 px-2.5 py-0.5 rounded border border-[#A8FF3E]/30">
                    {tool.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(tool)}
                      title={tool.published ? 'Hide from public' : 'Show on public'}
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                    >
                      {tool.published ? (
                        <Eye className="w-4 h-4 text-[#E8746A]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                    <button
                      onClick={() => handleStartEdit(tool)}
                      title="Edit Tool"
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      title={deletingId === tool.id ? 'Click again to confirm delete' : 'Delete'}
                      className={`p-1.5 transition-colors ${
                        deletingId === tool.id
                          ? 'text-red-400 font-bold animate-pulse'
                          : 'text-white/40 hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-[#E8746A] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs font-sans text-white/60 mt-1">{tool.category}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-mono">
                <span>Order: #{tool.order}</span>
                <span className="flex items-center gap-1 text-[#A8FF3E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Skill
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
