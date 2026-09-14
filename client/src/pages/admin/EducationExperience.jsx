import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  fetchExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../../services/timelineApi.js';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  X,
  Save,
  Calendar,
  MapPin,
  BookOpen,
  Clock,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract', 'Volunteer', ''];

const EMPTY_EDUCATION_FORM = {
  institution: '',
  degree: '',
  department: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  order: 0,
};

const EMPTY_EXPERIENCE_FORM = {
  title: '',
  organization: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  type: '',
  order: 0,
};

// ─── Helper components ────────────────────────────────────────────────────────

function Notification({ message, type, onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${
        isError
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function TypeBadge({ type }) {
  const isEdu = type === 'education';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        isEdu
          ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
          : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
      }`}
    >
      {isEdu ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
      {isEdu ? 'Education' : 'Experience'}
    </span>
  );
}

function CurrentBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
      <Clock className="w-2.5 h-2.5" />
      Current
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-zinc-800 rounded-full" />
        <div className="h-4 w-12 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-zinc-800 rounded" />
      <div className="h-4 w-1/2 bg-zinc-800 rounded" />
      <div className="h-4 w-2/3 bg-zinc-800 rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminEducationExperience() {
  const { token } = useAuth();

  // Data
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Notification
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Filter
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'education' | 'experience'

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('education'); // 'education' | 'experience'
  const [editingEntry, setEditingEntry] = useState(null); // null = adding new
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirm
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null); // { id, type, label }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form data
  const [eduForm, setEduForm] = useState(EMPTY_EDUCATION_FORM);
  const [expForm, setExpForm] = useState(EMPTY_EXPERIENCE_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [eduRes, expRes] = await Promise.all([fetchEducation(), fetchExperience()]);
        if (isMounted) {
          if (eduRes.success && Array.isArray(eduRes.data)) setEducationList(eduRes.data);
          if (expRes.success && Array.isArray(expRes.data)) setExperienceList(expRes.data);
        }
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Failed to load timeline entries');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // ── Notification helpers ───────────────────────────────────────────────────
  function showSuccess(msg) {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function showError(msg) {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 6000);
  }

  // ── Open add modal ─────────────────────────────────────────────────────────
  function openAddModal(type) {
    setModalType(type);
    setEditingEntry(null);
    if (type === 'education') setEduForm(EMPTY_EDUCATION_FORM);
    else setExpForm(EMPTY_EXPERIENCE_FORM);
    setFieldErrors({});
    setModalOpen(true);
  }

  // ── Open edit modal ────────────────────────────────────────────────────────
  function openEditModal(entry, type) {
    setModalType(type);
    setEditingEntry(entry);
    if (type === 'education') {
      setEduForm({
        institution: entry.institution || '',
        degree: entry.degree || '',
        department: entry.department || '',
        description: entry.description || '',
        startDate: entry.startDate || '',
        endDate: entry.endDate || '',
        current: Boolean(entry.current),
        order: entry.order ?? 0,
      });
    } else {
      setExpForm({
        title: entry.title || '',
        organization: entry.organization || '',
        description: entry.description || '',
        startDate: entry.startDate || '',
        endDate: entry.endDate || '',
        current: Boolean(entry.current),
        type: entry.type || '',
        order: entry.order ?? 0,
      });
    }
    setFieldErrors({});
    setModalOpen(true);
  }

  // ── Close modal ────────────────────────────────────────────────────────────
  function closeModal() {
    if (actionLoading) return;
    setModalOpen(false);
    setEditingEntry(null);
    setFieldErrors({});
  }

  // ── Validate education form ────────────────────────────────────────────────
  function validateEduForm() {
    const errors = {};
    if (!eduForm.institution.trim()) errors.institution = 'Institution is required';
    if (!eduForm.degree.trim()) errors.degree = 'Degree is required';
    if (!eduForm.startDate.trim()) errors.startDate = 'Start date is required';
    if (
      Number(eduForm.order) < 0 ||
      !Number.isInteger(Number(eduForm.order))
    ) errors.order = 'Order must be a non-negative integer';
    return errors;
  }

  // ── Validate experience form ───────────────────────────────────────────────
  function validateExpForm() {
    const errors = {};
    if (!expForm.title.trim()) errors.title = 'Title is required';
    if (!expForm.organization.trim()) errors.organization = 'Organization is required';
    if (!expForm.startDate.trim()) errors.startDate = 'Start date is required';
    if (
      Number(expForm.order) < 0 ||
      !Number.isInteger(Number(expForm.order))
    ) errors.order = 'Order must be a non-negative integer';
    return errors;
  }

  // ── Submit form ────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    const errors = modalType === 'education' ? validateEduForm() : validateExpForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setActionLoading(true);
    try {
      if (modalType === 'education') {
        const payload = {
          ...eduForm,
          order: Number(eduForm.order),
          endDate: eduForm.current ? '' : eduForm.endDate,
        };

        if (editingEntry) {
          const res = await updateEducation(editingEntry._id, payload, token);
          if (res.success) {
            setEducationList((prev) =>
              prev.map((e) => (e._id === editingEntry._id ? res.data : e))
            );
            showSuccess('Education entry updated successfully');
          }
        } else {
          const res = await createEducation(payload, token);
          if (res.success) {
            setEducationList((prev) => [...prev, res.data]);
            showSuccess('Education entry added successfully');
          }
        }
      } else {
        const payload = {
          ...expForm,
          order: Number(expForm.order),
          endDate: expForm.current ? '' : expForm.endDate,
        };

        if (editingEntry) {
          const res = await updateExperience(editingEntry._id, payload, token);
          if (res.success) {
            setExperienceList((prev) =>
              prev.map((e) => (e._id === editingEntry._id ? res.data : e))
            );
            showSuccess('Experience entry updated successfully');
          }
        } else {
          const res = await createExperience(payload, token);
          if (res.success) {
            setExperienceList((prev) => [...prev, res.data]);
            showSuccess('Experience entry added successfully');
          }
        }
      }

      closeModal();
    } catch (err) {
      showError(err.message || 'Failed to save entry');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Open delete confirm ────────────────────────────────────────────────────
  function openDeleteConfirm(entry, type) {
    const label =
      type === 'education'
        ? `${entry.degree} — ${entry.institution}`
        : `${entry.title} — ${entry.organization}`;
    setEntryToDelete({ id: entry._id, type, label });
    setDeleteModalOpen(true);
  }

  // ── Confirm delete ─────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!entryToDelete) return;
    setDeleteLoading(true);
    try {
      if (entryToDelete.type === 'education') {
        await deleteEducation(entryToDelete.id, token);
        setEducationList((prev) => prev.filter((e) => e._id !== entryToDelete.id));
      } else {
        await deleteExperience(entryToDelete.id, token);
        setExperienceList((prev) => prev.filter((e) => e._id !== entryToDelete.id));
      }
      showSuccess('Entry deleted successfully');
      setDeleteModalOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Filtered combined list ─────────────────────────────────────────────────
  const combinedList = [
    ...educationList.map((e) => ({ ...e, _entryType: 'education' })),
    ...experienceList.map((e) => ({ ...e, _entryType: 'experience' })),
  ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filteredList =
    activeFilter === 'ALL'
      ? combinedList
      : combinedList.filter((e) => e._entryType === activeFilter);

  const totalCount = combinedList.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Education &amp; Experience</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage education and professional experience timeline entries.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openAddModal('education')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Education
          </button>
          <button
            onClick={() => openAddModal('experience')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Experience
          </button>
        </div>
      </div>

      {/* Notifications */}
      <Notification message={successMessage} type="success" onDismiss={() => setSuccessMessage('')} />
      <Notification message={errorMessage} type="error" onDismiss={() => setErrorMessage('')} />

      {/* Stats + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'education', 'experience'].map((filter) => {
            const count =
              filter === 'ALL'
                ? totalCount
                : filter === 'education'
                ? educationList.length
                : experienceList.length;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeFilter === filter
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'education' ? 'Education' : 'Experience'}
                <span className="ml-1.5 text-[10px] text-zinc-500">({count})</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-500">
          {totalCount} {totalCount === 1 ? 'entry' : 'entries'} total
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">Failed to load entries</p>
          <p className="text-sm text-zinc-500 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <GraduationCap className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">
            {activeFilter === 'ALL'
              ? 'No timeline entries yet'
              : activeFilter === 'education'
              ? 'No education entries yet'
              : 'No experience entries yet'}
          </p>
          <p className="text-xs text-zinc-500 mb-5">
            Add your first {activeFilter === 'experience' ? 'experience' : 'education'} entry to get started.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal('education')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
            <button
              onClick={() => openAddModal('experience')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredList.map((entry) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              onEdit={() => openEditModal(entry, entry._entryType)}
              onDelete={() => openDeleteConfirm(entry, entry._entryType)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                {modalType === 'education' ? (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300">
                    <Briefcase className="w-4 h-4" />
                  </div>
                )}
                <h2 className="text-sm font-semibold text-zinc-100">
                  {editingEntry
                    ? `Edit ${modalType === 'education' ? 'Education' : 'Experience'}`
                    : `Add ${modalType === 'education' ? 'Education' : 'Experience'}`}
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="timeline-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                {modalType === 'education' ? (
                  <EducationFormFields
                    form={eduForm}
                    setForm={setEduForm}
                    errors={fieldErrors}
                  />
                ) : (
                  <ExperienceFormFields
                    form={expForm}
                    setForm={setExpForm}
                    errors={fieldErrors}
                  />
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="timeline-form"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {actionLoading ? 'Saving…' : editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { if (!deleteLoading) setDeleteModalOpen(false); }}
          />
          <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Delete Entry</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-1">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-xs font-semibold text-zinc-200 mb-1 break-words">
              {entryToDelete.label}
            </p>
            <p className="text-xs text-zinc-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, onEdit, onDelete }) {
  const isEdu = entry._entryType === 'education';
  const title = isEdu ? entry.degree : entry.title;
  const org = isEdu ? entry.institution : entry.organization;
  const sub = isEdu ? entry.department : entry.type;

  return (
    <div className="group p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
            isEdu
              ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
          }`}
        >
          {isEdu ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <TypeBadge type={entry._entryType} />
            {entry.current && <CurrentBadge />}
            <span className="text-[10px] text-zinc-600 font-mono">order: {entry.order ?? 0}</span>
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 truncate">{title}</h3>
          <p className="text-xs text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {org}
          </p>

          {sub && (
            <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" />
              {sub}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 shrink-0" />
            {entry.startDate}
            {entry.current ? ' — Present' : entry.endDate ? ` — ${entry.endDate}` : ''}
          </p>

          {entry.description && (
            <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
              {entry.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Edit entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form: Education ──────────────────────────────────────────────────────────

function EducationFormFields({ form, setForm, errors }) {
  function field(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <FormRow label="Institution *" error={errors.institution}>
        <input
          type="text"
          value={form.institution}
          onChange={(e) => field('institution', e.target.value)}
          placeholder="e.g. University of Dhaka"
          maxLength={200}
          className={inputClass(errors.institution)}
        />
      </FormRow>

      <FormRow label="Degree / Qualification *" error={errors.degree}>
        <input
          type="text"
          value={form.degree}
          onChange={(e) => field('degree', e.target.value)}
          placeholder="e.g. BSc in Computer Science"
          maxLength={200}
          className={inputClass(errors.degree)}
        />
      </FormRow>

      <FormRow label="Department / Major" error={errors.department}>
        <input
          type="text"
          value={form.department}
          onChange={(e) => field('department', e.target.value)}
          placeholder="e.g. Department of Computer Science"
          maxLength={200}
          className={inputClass(errors.department)}
        />
      </FormRow>

      <FormRow label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(e) => field('description', e.target.value)}
          placeholder="Brief description of your studies, achievements, activities…"
          maxLength={2000}
          rows={3}
          className={`${inputClass(errors.description)} resize-none`}
        />
      </FormRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="Start Date *" error={errors.startDate}>
          <input
            type="text"
            value={form.startDate}
            onChange={(e) => field('startDate', e.target.value)}
            placeholder="e.g. Sep 2021"
            maxLength={50}
            className={inputClass(errors.startDate)}
          />
        </FormRow>

        <FormRow
          label="End Date"
          error={errors.endDate}
          hint={form.current ? 'Cleared because Current is checked' : undefined}
        >
          <input
            type="text"
            value={form.current ? '' : form.endDate}
            onChange={(e) => field('endDate', e.target.value)}
            placeholder={form.current ? 'Present' : 'e.g. Jun 2025'}
            disabled={form.current}
            maxLength={50}
            className={`${inputClass(errors.endDate)} disabled:opacity-40`}
          />
        </FormRow>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.current}
            onChange={(e) => {
              field('current', e.target.checked);
              if (e.target.checked) field('endDate', '');
            }}
            className="w-4 h-4 rounded accent-emerald-500"
          />
          <span className="text-xs text-zinc-300 font-medium">Currently studying here</span>
        </label>
      </div>

      <FormRow label="Display Order" error={errors.order}>
        <input
          type="number"
          min={0}
          step={1}
          value={form.order}
          onChange={(e) => field('order', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
          className={inputClass(errors.order)}
        />
      </FormRow>
    </>
  );
}

// ─── Form: Experience ─────────────────────────────────────────────────────────

function ExperienceFormFields({ form, setForm, errors }) {
  function field(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <FormRow label="Job Title *" error={errors.title}>
        <input
          type="text"
          value={form.title}
          onChange={(e) => field('title', e.target.value)}
          placeholder="e.g. Software Engineer"
          maxLength={200}
          className={inputClass(errors.title)}
        />
      </FormRow>

      <FormRow label="Organization / Company *" error={errors.organization}>
        <input
          type="text"
          value={form.organization}
          onChange={(e) => field('organization', e.target.value)}
          placeholder="e.g. Acme Corp"
          maxLength={200}
          className={inputClass(errors.organization)}
        />
      </FormRow>

      <FormRow label="Employment Type" error={errors.type}>
        <select
          value={form.type}
          onChange={(e) => field('type', e.target.value)}
          className={selectClass(errors.type)}
        >
          <option value="">Select type (optional)</option>
          {EXPERIENCE_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormRow>

      <FormRow label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(e) => field('description', e.target.value)}
          placeholder="Responsibilities, achievements, technologies used…"
          maxLength={2000}
          rows={3}
          className={`${inputClass(errors.description)} resize-none`}
        />
      </FormRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="Start Date *" error={errors.startDate}>
          <input
            type="text"
            value={form.startDate}
            onChange={(e) => field('startDate', e.target.value)}
            placeholder="e.g. Jan 2024"
            maxLength={50}
            className={inputClass(errors.startDate)}
          />
        </FormRow>

        <FormRow
          label="End Date"
          error={errors.endDate}
          hint={form.current ? 'Cleared because Current is checked' : undefined}
        >
          <input
            type="text"
            value={form.current ? '' : form.endDate}
            onChange={(e) => field('endDate', e.target.value)}
            placeholder={form.current ? 'Present' : 'e.g. Jun 2024'}
            disabled={form.current}
            maxLength={50}
            className={`${inputClass(errors.endDate)} disabled:opacity-40`}
          />
        </FormRow>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.current}
            onChange={(e) => {
              field('current', e.target.checked);
              if (e.target.checked) field('endDate', '');
            }}
            className="w-4 h-4 rounded accent-emerald-500"
          />
          <span className="text-xs text-zinc-300 font-medium">Currently working here</span>
        </label>
      </div>

      <FormRow label="Display Order" error={errors.order}>
        <input
          type="number"
          min={0}
          step={1}
          value={form.order}
          onChange={(e) => field('order', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
          className={inputClass(errors.order)}
        />
      </FormRow>
    </>
  );
}

// ─── Shared form helpers ──────────────────────────────────────────────────────

function FormRow({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {hint && !error && <p className="text-[11px] text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full px-3 py-2 rounded-xl bg-zinc-800/60 border ${
    hasError
      ? 'border-red-500/60 focus:border-red-500'
      : 'border-zinc-700/60 focus:border-zinc-500'
  } text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors`;
}

function selectClass(hasError) {
  return `w-full px-3 py-2 rounded-xl bg-zinc-800/60 border ${
    hasError
      ? 'border-red-500/60 focus:border-red-500'
      : 'border-zinc-700/60 focus:border-zinc-500'
  } text-xs text-zinc-100 outline-none transition-colors`;
}
