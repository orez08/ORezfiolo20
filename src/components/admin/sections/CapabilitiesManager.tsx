import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, CheckCircle2, Save, Eye, EyeOff } from 'lucide-react';
import { Capability } from '../../../types.ts';
import { api } from '../../../services/api.ts';

interface CapabilitiesManagerProps {
  capabilities: Capability[];
  onRefresh: () => Promise<void>;
}

export const CapabilitiesManager: React.FC<CapabilitiesManagerProps> = ({
  capabilities,
  onRefresh,
}) => {
  const [items, setItems] = useState<Capability[]>([...capabilities]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Capability>>({});
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleStartEdit = (cap: Capability) => {
    setEditingId(cap.id);
    setEditForm({ ...cap });
    setSkillInput('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editForm.title?.trim()) return;
    setSaving(true);
    try {
      await api.saveCapability(editForm);
      setEditingId(null);
      await onRefresh();
      setSuccessMsg('Capability updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving capability');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    setSaving(true);
    try {
      const count = items.length + 1;
      const newCap: Partial<Capability> = {
        title: 'New Creative Capability',
        description: 'Strategic execution delivering high-conversion brand experiences.',
        number: count < 10 ? `0${count}` : `${count}`,
        skills: ['Strategic Art', 'Creative Execution'],
        published: true,
        order: count,
      };
      const created = await api.saveCapability(newCap);
      await onRefresh();
      handleStartEdit(created);
    } catch (err: any) {
      alert(err.message || 'Error creating capability');
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
      await api.deleteCapability(id);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting capability');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (cap: Capability) => {
    try {
      await api.saveCapability({ ...cap, published: !cap.published });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // renumber
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
      item.number = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
    });

    setItems(newItems);

    try {
      for (const item of newItems) {
        await api.saveCapability(item);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const addSkillToEdit = () => {
    if (!skillInput.trim()) return;
    const current = editForm.skills || [];
    setEditForm({ ...editForm, skills: [...current, skillInput.trim()] });
    setSkillInput('');
  };

  const removeSkillFromEdit = (skill: string) => {
    const current = editForm.skills || [];
    setEditForm({ ...editForm, skills: current.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Capabilities & Growth Services
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Numbered list layout items with hover reveal on the public site
          </p>
        </div>

        <button
          onClick={handleAddNew}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E1E] text-[#F5F1EA] text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Capability</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-sm bg-green-900/30 border border-green-700 text-xs text-green-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Capabilities List */}
      <div className="space-y-4">
        {capabilities.map((cap, idx) => {
          const isEditing = editingId === cap.id;

          if (isEditing) {
            return (
              <div
                key={cap.id}
                className="p-6 rounded-sm bg-[#1C1C1C] border border-[#E8746A] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#F5F1EA]/10 pb-3">
                  <span className="font-sans text-xs text-[#E8746A] uppercase font-bold">
                    Editing Capability {cap.number}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-full border border-[#F5F1EA]/20 text-xs text-[#F5F1EA]/60 hover:text-[#F5F1EA]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-4 py-1.5 rounded-full bg-[#E8746A] text-[#141414] text-xs font-semibold uppercase"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-sans uppercase text-[#F5F1EA]/60 mb-1">
                      Number Marker
                    </label>
                    <input
                      type="text"
                      value={editForm.number || ''}
                      onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs font-sans text-[#E8746A]"
                    />
                  </div>
                  <div className="sm:col-span-9">
                    <label className="block text-[10px] font-sans uppercase text-[#F5F1EA]/60 mb-1">
                      Capability Title *
                    </label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase text-[#F5F1EA]/60 mb-1">
                    One-line Strategic Description
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] resize-none"
                  />
                </div>

                {/* Skill tags */}
                <div>
                  <label className="block text-[10px] font-sans uppercase text-[#F5F1EA]/60 mb-1">
                    Specialty Skill Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add tag (e.g. Design Systems)"
                      className="flex-1 px-3 py-1.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillToEdit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSkillToEdit}
                      className="px-3 py-1.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/20 text-xs font-sans text-[#F5F1EA]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editForm.skills?.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#F5F1EA]/15 text-[11px] font-sans text-[#F5F1EA]/80"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillFromEdit(s)}
                          className="text-[#E8746A]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cap.id}
              className={`p-5 rounded-sm bg-[#181818] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                cap.published
                  ? 'border-[#F5F1EA]/10 hover:border-[#8B1E1E]'
                  : 'border-[#F5F1EA]/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="font-sans text-sm text-[#E8746A] font-bold mt-0.5">
                  {cap.number}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-medium text-lg text-[#F5F1EA]">
                      {cap.title}
                    </h3>
                    {!cap.published && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#141414] border border-[#F5F1EA]/20 text-[#F5F1EA]/50">
                        Draft / Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#F5F1EA]/65 line-clamp-1 mt-1 font-normal">
                    {cap.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cap.skills?.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#141414] text-[#F5F1EA]/50"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F5F1EA]/10">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(cap)}
                  title={cap.published ? 'Hide on public site' : 'Publish to public site'}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/60 hover:text-[#E8746A]"
                >
                  {cap.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/60 hover:text-[#F5F1EA] disabled:opacity-20"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === capabilities.length - 1}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/60 hover:text-[#F5F1EA] disabled:opacity-20"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(cap)}
                  className="p-2 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-[#F5F1EA]/80 hover:text-[#E8746A]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(cap.id)}
                  title={deletingId === cap.id ? 'Click again to confirm deletion' : 'Delete capability'}
                  className={`p-2 rounded-sm border transition-colors ${
                    deletingId === cap.id
                      ? 'bg-red-600 text-white border-red-500 animate-pulse'
                      : 'bg-[#141414] border-[#F5F1EA]/10 text-[#F5F1EA]/40 hover:text-[#E8746A]'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
