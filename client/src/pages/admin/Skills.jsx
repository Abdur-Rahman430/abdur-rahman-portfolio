import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  seedInitialSkills,
} from '../../services/skillsApi.js';
import {
  resolveSkillIcon,
  AVAILABLE_ICON_NAMES,
} from '../../utils/iconResolver.jsx';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  Save,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Databases',
  'Developer Tools',
  'Cybersecurity',
];

export default function AdminSkills() {
  const { token } = useAuth();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null); // null when adding
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    icon: 'Code2',
    order: 1,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Filter state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const res = await fetchSkills();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setSkills(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load skills from server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSkills = async () => {
    try {
      const res = await fetchSkills();
      if (res.success && Array.isArray(res.data)) {
        setSkills(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to refresh skills.');
    }
  };

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach((cat) => {
      groups[cat] = [];
    });

    skills.forEach((skill) => {
      const cat = skill.category || 'Other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(skill);
    });

    // Sort skills inside each category by order, then name
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
    });

    return groups;
  }, [skills]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: activeCategoryFilter !== 'ALL' ? activeCategoryFilter : CATEGORIES[0],
      icon: 'Code2',
      order: 1,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || CATEGORIES[0],
      icon: skill.icon || 'Code2',
      order: skill.order ?? 0,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  // Open modal for Deleting
  const handleOpenDelete = (skill) => {
    setSkillToDelete(skill);
    setDeleteModalOpen(true);
  };

  // Form field change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Skill name is required';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Skill name cannot exceed 100 characters';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (formData.order === '' || isNaN(formData.order) || formData.order < 0) {
      errors.order = 'Display order must be a non-negative number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save skill (Create or Update)
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (actionLoading) return;
    if (!validateForm()) return;

    setActionLoading(true);

    try {
      if (editingSkill) {
        // Update existing skill
        const res = await updateSkill(editingSkill._id, formData, token);
        if (res.success && res.data) {
          setSkills((prev) =>
            prev.map((s) => (s._id === editingSkill._id ? res.data : s))
          );
          setSuccessMessage(`Skill "${formData.name}" updated successfully.`);
          setModalOpen(false);
        }
      } else {
        // Create new skill
        const res = await createSkill(formData, token);
        if (res.success && res.data) {
          setSkills((prev) => [...prev, res.data]);
          setSuccessMessage(`Skill "${formData.name}" added successfully.`);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save skill. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm delete skill
  const handleConfirmDelete = async () => {
    if (!skillToDelete || actionLoading) return;

    setActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await deleteSkill(skillToDelete._id, token);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s._id !== skillToDelete._id));
        setSuccessMessage(`Skill "${skillToDelete.name}" deleted successfully.`);
        setDeleteModalOpen(false);
        setSkillToDelete(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete skill.');
    } finally {
      setActionLoading(false);
    }
  };

  // Seed initial skills
  const handleSeedSkills = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await seedInitialSkills(token);
      if (res.success) {
        setSuccessMessage(res.message || 'Initial skills seeded successfully.');
        await refreshSkills();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to seed initial skills.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading skills from database...</p>
      </div>
    );
  }

  const displayedCategories =
    activeCategoryFilter === 'ALL'
      ? CATEGORIES
      : [activeCategoryFilter];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Master Plan Step 6</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Skills Management System</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Organize programming languages, frameworks, developer tools, and security competencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {skills.length === 0 && (
            <button
              type="button"
              onClick={handleSeedSkills}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Seed Initial Skills</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeCategoryFilter === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          All Categories ({skills.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = skillsByCategory[cat]?.length || 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {skills.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">No skills have been added yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Add your engineering skills individually or populate the recommended portfolio skills.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={handleSeedSkills}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Load Recommended Skills</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>
      ) : (
        /* Categorized Skills Display */
        <div className="space-y-6">
          {displayedCategories.map((category) => {
            const catSkills = skillsByCategory[category] || [];
            return (
              <div
                key={category}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      {category}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      {catSkills.length} {catSkills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkill(null);
                      setFormData({
                        name: '',
                        category,
                        icon: 'Code2',
                        order: catSkills.length + 1,
                      });
                      setFieldErrors({});
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to category</span>
                  </button>
                </div>

                {catSkills.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">
                    No skills in this category yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="group p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                            {resolveSkillIcon(skill.icon, { className: 'w-4 h-4' })}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">
                              {skill.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-zinc-500">
                                Order: {skill.order ?? 0}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-600 truncate">
                                • {skill.icon || 'Code2'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(skill)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                            title="Edit Skill"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(skill)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4" noValidate>
              {/* Skill Name */}
              <div>
                <label htmlFor="skillName" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Skill Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="skillName"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. React, Docker, Python"
                  className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.name
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="skillCategory" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="skillCategory"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.category}</p>
                )}
              </div>

              {/* Icon Picker with Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="skillIcon" className="block text-xs font-medium text-zinc-300">
                    Icon
                  </label>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <HelpCircle className="w-3 h-3" />
                    <span>Safe Lucide Identifier</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                    {resolveSkillIcon(formData.icon, { className: 'w-5 h-5' })}
                  </div>
                  <select
                    id="skillIcon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {AVAILABLE_ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="skillOrder" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Display Order
                </label>
                <input
                  id="skillOrder"
                  name="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={handleFormChange}
                  placeholder="e.g. 1"
                  className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.order
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                  }`}
                />
                {fieldErrors.order && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.order}</p>
                )}
                <p className="mt-1 text-[11px] text-zinc-500">
                  Lower numbers display earlier within the category.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSkill ? 'Save Changes' : 'Create Skill'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && skillToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Delete Skill</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to delete <span className="text-zinc-100 font-semibold">{skillToDelete.name}</span>? This action removes it from MongoDB and your portfolio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSkillToDelete(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 disabled:opacity-50 transition-all cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
