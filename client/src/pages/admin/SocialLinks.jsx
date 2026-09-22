import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../services/socialLinksApi.js';
import {
  PLATFORM_PRESETS,
  resolveSocialIcon,
} from '../../utils/socialIconResolver.jsx';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Share2,
  X,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  Check,
} from 'lucide-react';

const EMPTY_FORM = {
  platform: 'GitHub',
  url: '',
  icon: 'GitHub',
  active: true,
  order: 0,
};

function PlatformSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedPreset =
    PLATFORM_PRESETS.find((p) => p.platform.toLowerCase() === (value || '').toLowerCase()) ||
    PLATFORM_PRESETS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full px-3 py-2 rounded-xl bg-zinc-800/60 border ${
          error
            ? 'border-red-500/60 focus:border-red-500'
            : 'border-zinc-700/60 focus:border-zinc-500'
        } text-xs text-zinc-100 flex items-center justify-between gap-2.5 transition-colors cursor-pointer hover:bg-zinc-800`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0">
            {resolveSocialIcon(selectedPreset.icon, selectedPreset.platform, { className: 'w-3.5 h-3.5' })}
          </div>
          <span className="font-semibold text-zinc-100 truncate">{selectedPreset.platform}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Supported social platforms"
          className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 space-y-0.5"
        >
          {PLATFORM_PRESETS.map((p) => {
            const isSelected = p.platform.toLowerCase() === (value || '').toLowerCase();
            return (
              <button
                key={p.platform}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(p.platform);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 border border-zinc-700/60 text-zinc-300'
                    }`}
                  >
                    {resolveSocialIcon(p.icon, p.platform, { className: 'w-3.5 h-3.5' })}
                  </div>
                  <span className="font-medium">{p.platform}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-zinc-800 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-3 w-48 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminSocialLinks() {
  const { token } = useAuth();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirm
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // Filter
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | active | inactive

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadLinks() {
      try {
        const res = await fetchAllSocialLinks(token);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setLinks(res.data);
        }
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Failed to load social links');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLinks();
    return () => { isMounted = false; };
  }, [token]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
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

  // ── Open add ────────────────────────────────────────────────────────────────
  function openAddModal() {
    setEditingLink(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setModalOpen(true);
  }

  // ── Open edit ───────────────────────────────────────────────────────────────
  function openEditModal(link) {
    setEditingLink(link);
    setForm({
      platform: link.platform || 'Other',
      url: link.url || '',
      icon: link.icon || 'Globe',
      active: Boolean(link.active),
      order: link.order ?? 0,
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    if (actionLoading) return;
    setModalOpen(false);
    setEditingLink(null);
    setFieldErrors({});
  }

  // ── Client validation ────────────────────────────────────────────────────────
  function validateForm() {
    const errors = {};
    if (!form.platform.trim()) errors.platform = 'Platform is required';
    if (!form.url.trim()) {
      errors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/i.test(form.url.trim()) && !/^mailto:.+@.+/i.test(form.url.trim())) {
      errors.url = 'Must be a valid http/https URL or mailto: address';
    }
    if (Number(form.order) < 0 || !Number.isInteger(Number(form.order))) {
      errors.order = 'Order must be a non-negative integer';
    }
    return errors;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setActionLoading(true);

    const payload = {
      platform: form.platform.trim(),
      url: form.url.trim(),
      icon: form.icon.trim(),
      active: form.active,
      order: Number(form.order),
    };

    try {
      if (editingLink) {
        const res = await updateSocialLink(editingLink._id, payload, token);
        if (res.success) {
          setLinks((prev) => prev.map((l) => (l._id === editingLink._id ? res.data : l)));
          showSuccess('Social link updated successfully');
        }
      } else {
        const res = await createSocialLink(payload, token);
        if (res.success) {
          setLinks((prev) => [...prev, res.data]);
          showSuccess('Social link added successfully');
        }
      }
      closeModal();
    } catch (err) {
      showError(err.message || 'Failed to save social link');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Quick toggle active ──────────────────────────────────────────────────────
  async function handleToggleActive(link) {
    try {
      const payload = {
        platform: link.platform,
        url: link.url,
        icon: link.icon,
        active: !link.active,
        order: link.order,
      };
      const res = await updateSocialLink(link._id, payload, token);
      if (res.success) {
        setLinks((prev) => prev.map((l) => (l._id === link._id ? res.data : l)));
        showSuccess(`Social link ${res.data.active ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  function openDeleteConfirm(link) {
    setLinkToDelete(link);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!linkToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteSocialLink(linkToDelete._id, token);
      setLinks((prev) => prev.filter((l) => l._id !== linkToDelete._id));
      showSuccess('Social link deleted successfully');
      setDeleteModalOpen(false);
      setLinkToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete social link');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Platform preset auto-fill ────────────────────────────────────────────────
  function handlePlatformChange(value) {
    const preset = PLATFORM_PRESETS.find((p) => p.platform === value);
    setForm((prev) => ({
      ...prev,
      platform: value,
      icon: preset ? preset.icon : 'Globe',
    }));
  }

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const sortedLinks = [...links].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const filteredLinks =
    activeFilter === 'ALL'
      ? sortedLinks
      : activeFilter === 'active'
      ? sortedLinks.filter((l) => l.active)
      : sortedLinks.filter((l) => !l.active);

  const activeCount = links.filter((l) => l.active).length;
  const inactiveCount = links.filter((l) => !l.active).length;

  const urlPlaceholder =
    PLATFORM_PRESETS.find((p) => p.platform === form.platform)?.urlHint || 'https://example.com';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Social Links</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage public profile handles and professional networks.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Social Link
        </button>
      </div>

      {/* Notifications */}
      <Notification message={successMessage} type="success" onDismiss={() => setSuccessMessage('')} />
      <Notification message={errorMessage} type="error" onDismiss={() => setErrorMessage('')} />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'ALL', label: 'All', count: links.length },
            { key: 'active', label: 'Active', count: activeCount },
            { key: 'inactive', label: 'Inactive', count: inactiveCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeFilter === key
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] text-zinc-500">({count})</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          {links.length} {links.length === 1 ? 'link' : 'links'} total
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">Failed to load social links</p>
          <p className="text-sm text-zinc-500 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <Share2 className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">
            {activeFilter === 'ALL' ? 'No social links yet' : `No ${activeFilter} social links`}
          </p>
          <p className="text-xs text-zinc-500 mb-5">
            Add your first social link to display on your portfolio.
          </p>
          {activeFilter === 'ALL' && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Social Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link._id}
              link={link}
              onEdit={() => openEditModal(link)}
              onDelete={() => openDeleteConfirm(link)}
              onToggle={() => handleToggleActive(link)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  {editingLink ? 'Edit Social Link' : 'Add Social Link'}
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

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="social-link-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Platform & Official Brand Icon Selection */}
                <FormRow label="Platform *" error={fieldErrors.platform}>
                  <PlatformSelect
                    value={form.platform}
                    onChange={handlePlatformChange}
                    error={fieldErrors.platform}
                  />
                </FormRow>

                {/* URL */}
                <FormRow label="URL *" error={fieldErrors.url}>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder={urlPlaceholder}
                    maxLength={500}
                    className={inputClass(fieldErrors.url)}
                  />
                </FormRow>

                {/* Official Brand Icon Badge Preview */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shrink-0">
                      {resolveSocialIcon(form.icon, form.platform, { className: 'w-4 h-4' })}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{form.platform}</p>
                      <p className="text-[11px] text-zinc-500">Official Brand Icon</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Brand
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Order */}
                  <FormRow label="Display Order" error={fieldErrors.order}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={form.order}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          order: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        }))
                      }
                      className={inputClass(fieldErrors.order)}
                    />
                  </FormRow>

                  {/* Active */}
                  <FormRow label="Status" error={fieldErrors.active}>
                    <div className="flex items-center h-[34px]">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, active: e.target.checked }))
                          }
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span className="text-xs text-zinc-300 font-medium">Active</span>
                      </label>
                    </div>
                  </FormRow>
                </div>
              </form>
            </div>

            {/* Footer */}
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
                form="social-link-form"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {actionLoading ? 'Saving…' : editingLink ? 'Update Link' : 'Save Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && linkToDelete && (
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
              <h3 className="text-sm font-semibold text-zinc-100">Delete Social Link</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-1">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-xs font-semibold text-zinc-200 mb-1 break-words">
              {linkToDelete.platform} — {linkToDelete.url}
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

// ─── Link Card ────────────────────────────────────────────────────────────────

function LinkCard({ link, onEdit, onDelete, onToggle }) {
  return (
    <div
      className={`group p-4 rounded-xl border transition-all ${
        link.active
          ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/80'
          : 'bg-zinc-900/30 border-zinc-800/40 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400 shrink-0">
          {resolveSocialIcon(link.icon, link.platform, { className: 'w-4 h-4' })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-100">{link.platform}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                link.active
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}
            >
              {link.active ? (
                <><Eye className="w-2.5 h-2.5" />Active</>
              ) : (
                <><EyeOff className="w-2.5 h-2.5" />Inactive</>
              )}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">order: {link.order ?? 0}</span>
          </div>
          <p className="text-xs text-zinc-400 truncate">{link.url}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title={link.active ? 'Deactivate' : 'Activate'}
          >
            {link.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
