import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchWebsiteSettings,
  updateWebsiteSettings,
} from '../../services/websiteSettingsApi.js';
import {
  DEFAULT_THEME,
  isValidHex,
  applyTheme,
} from '../../utils/themeUtils.js';
import {
  Settings,
  Globe,
  FileText,
  Palette,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Undo2,
  RotateCcw,
  Sliders,
  Search,
  Eye,
  X,
  Moon,
  Sun,
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  websiteTitle: '',
  metaDescription: '',
  footerText: '',
  defaultTheme: 'dark',
  primaryColor: DEFAULT_THEME.primaryColor,
  secondaryColor: DEFAULT_THEME.secondaryColor,
  accentColor: DEFAULT_THEME.accentColor,
  backgroundColor: DEFAULT_THEME.backgroundColor,
  textColor: DEFAULT_THEME.textColor,
};

const COLOR_FIELDS = [
  {
    key: 'primaryColor',
    label: 'Primary Color',
    description: 'Main brand highlight, active states, and buttons',
    default: DEFAULT_THEME.primaryColor,
  },
  {
    key: 'secondaryColor',
    label: 'Secondary Color',
    description: 'Card backgrounds and secondary surfaces',
    default: DEFAULT_THEME.secondaryColor,
  },
  {
    key: 'accentColor',
    label: 'Accent Color',
    description: 'Badges, pill tags, and dynamic highlights',
    default: DEFAULT_THEME.accentColor,
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    description: 'Global page and body background canvas',
    default: DEFAULT_THEME.backgroundColor,
  },
  {
    key: 'textColor',
    label: 'Text Color',
    description: 'Main typography and heading color',
    default: DEFAULT_THEME.textColor,
  },
];

function to6DigitHex(hex) {
  if (!hex || typeof hex !== 'string') return '#000000';
  const clean = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/i.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/i.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return '#000000';
}

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
        className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AdminWebsiteSettings() {
  const { token } = useAuth();

  const [savedSettings, setSavedSettings] = useState(INITIAL_FORM_STATE);
  const [formSettings, setFormSettings] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Check if form has unsaved modifications
  const hasUnsavedChanges = Object.keys(INITIAL_FORM_STATE).some(
    (key) => formSettings[key] !== savedSettings[key]
  );

  // Load existing settings
  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetchWebsiteSettings();
        if (isMounted && res.success && res.data) {
          const loaded = {
            websiteTitle: res.data.websiteTitle || '',
            metaDescription: res.data.metaDescription || '',
            footerText: res.data.footerText || '',
            defaultTheme: res.data.defaultTheme || 'dark',
            primaryColor: res.data.primaryColor || DEFAULT_THEME.primaryColor,
            secondaryColor: res.data.secondaryColor || DEFAULT_THEME.secondaryColor,
            accentColor: res.data.accentColor || DEFAULT_THEME.accentColor,
            backgroundColor: res.data.backgroundColor || DEFAULT_THEME.backgroundColor,
            textColor: res.data.textColor || DEFAULT_THEME.textColor,
          };
          setSavedSettings(loaded);
          setFormSettings(loaded);
          // Apply theme colors globally
          applyTheme(loaded);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || 'Failed to load website settings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleFieldChange(key, value) {
    setFormSettings((prev) => ({ ...prev, [key]: value }));
    // Clear validation error for field
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  function handleRevert() {
    setFormSettings(savedSettings);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('Unsaved modifications reverted to last saved settings.');
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function handleResetDefaults() {
    const defaults = {
      ...formSettings,
      websiteTitle: '',
      metaDescription: '',
      footerText: '© ' + new Date().getFullYear() + ' Abdur Rahman. All rights reserved.',
      defaultTheme: 'dark',
      primaryColor: DEFAULT_THEME.primaryColor,
      secondaryColor: DEFAULT_THEME.secondaryColor,
      accentColor: DEFAULT_THEME.accentColor,
      backgroundColor: DEFAULT_THEME.backgroundColor,
      textColor: DEFAULT_THEME.textColor,
    };
    setFormSettings(defaults);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('Settings reset to default baseline values. Click "Save Changes" to persist.');
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function validateForm() {
    const errors = {};
    if (formSettings.websiteTitle.trim().length > 200) {
      errors.websiteTitle = 'Website Title cannot exceed 200 characters';
    }
    if (formSettings.metaDescription.trim().length > 500) {
      errors.metaDescription = 'Meta Description cannot exceed 500 characters';
    }
    if (formSettings.footerText.trim().length > 300) {
      errors.footerText = 'Footer Text cannot exceed 300 characters';
    }

    for (const color of COLOR_FIELDS) {
      const val = formSettings[color.key];
      if (val && !isValidHex(val)) {
        errors[color.key] = 'Must be a valid HEX color (e.g. #10b981 or #fff)';
      }
    }

    return errors;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fix form validation errors before saving.');
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        websiteTitle: formSettings.websiteTitle.trim(),
        metaDescription: formSettings.metaDescription.trim(),
        footerText: formSettings.footerText.trim(),
        defaultTheme: formSettings.defaultTheme,
        primaryColor: formSettings.primaryColor.trim(),
        secondaryColor: formSettings.secondaryColor.trim(),
        accentColor: formSettings.accentColor.trim(),
        backgroundColor: formSettings.backgroundColor.trim(),
        textColor: formSettings.textColor.trim(),
      };

      const res = await updateWebsiteSettings(payload, token);
      if (res.success && res.data) {
        const updated = {
          websiteTitle: res.data.websiteTitle ?? payload.websiteTitle,
          metaDescription: res.data.metaDescription ?? payload.metaDescription,
          footerText: res.data.footerText ?? payload.footerText,
          defaultTheme: res.data.defaultTheme ?? payload.defaultTheme,
          primaryColor: res.data.primaryColor || payload.primaryColor,
          secondaryColor: res.data.secondaryColor || payload.secondaryColor,
          accentColor: res.data.accentColor || payload.accentColor,
          backgroundColor: res.data.backgroundColor || payload.backgroundColor,
          textColor: res.data.textColor || payload.textColor,
        };
        setSavedSettings(updated);
        setFormSettings(updated);
        // Apply saved theme globally
        applyTheme(updated);
        setSuccessMessage('Website settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update website settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            Website Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure global SEO metadata, site title, theme colors, and footer notices.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            title="Reset to default baseline settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleRevert}
            disabled={!hasUnsavedChanges || saving || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Revert to last saved state"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
            Revert Edits
          </button>

          <button
            type="submit"
            form="website-settings-form"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <Notification
        message={successMessage}
        type="success"
        onDismiss={() => setSuccessMessage('')}
      />
      <Notification
        message={errorMessage}
        type="error"
        onDismiss={() => setErrorMessage('')}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-44 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
            <div className="h-64 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
            <div className="h-32 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
          </div>
          <div className="lg:col-span-5 h-96 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-zinc-200 font-semibold mb-1">Failed to load website settings</p>
          <p className="text-xs text-zinc-400 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Column */}
          <div className="lg:col-span-7 space-y-6">
            <form id="website-settings-form" onSubmit={handleSave} className="space-y-6" noValidate>
              {/* Section 1: General Website Settings */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">General Information</h2>
                  </div>
                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Unsaved
                    </span>
                  )}
                </div>

                {/* Website Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="websiteTitle" className="text-xs font-medium text-zinc-200">
                      Website Title
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {formSettings.websiteTitle.length} / 200
                    </span>
                  </div>
                  <input
                    id="websiteTitle"
                    type="text"
                    value={formSettings.websiteTitle}
                    maxLength={200}
                    onChange={(e) => handleFieldChange('websiteTitle', e.target.value)}
                    placeholder="e.g. Abdur Rahman | Software Engineer & Researcher"
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950/80 border text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors ${
                      fieldErrors.websiteTitle
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-zinc-800 focus:border-zinc-600'
                    }`}
                  />
                  {fieldErrors.websiteTitle && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.websiteTitle}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Displayed in the browser tab title and search engine results.
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="metaDescription" className="text-xs font-medium text-zinc-200">
                      Meta Description (SEO)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {formSettings.metaDescription.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="metaDescription"
                    rows={3}
                    value={formSettings.metaDescription}
                    maxLength={500}
                    onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                    placeholder="Brief description of your portfolio and professional background for search engine indexing..."
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950/80 border text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors resize-none leading-relaxed ${
                      fieldErrors.metaDescription
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-zinc-800 focus:border-zinc-600'
                    }`}
                  />
                  {fieldErrors.metaDescription && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.metaDescription}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Provides a concise summary for OpenGraph sharing cards and Google search snippets.
                  </p>
                </div>

                {/* Default Theme Mode */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-zinc-200 block">
                    Default Site Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('defaultTheme', 'dark')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        formSettings.defaultTheme === 'dark'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Dark (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('defaultTheme', 'light')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        formSettings.defaultTheme === 'light'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Light
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Theme Colors */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">Theme Colors</h2>
                  </div>
                  <span className="text-[11px] text-zinc-500">HEX Palette</span>
                </div>

                <div className="space-y-3">
                  {COLOR_FIELDS.map((cfg) => {
                    const val = formSettings[cfg.key] || cfg.default;
                    const pickerVal = to6DigitHex(val);
                    const error = fieldErrors[cfg.key];

                    return (
                      <div
                        key={cfg.key}
                        className={`p-3.5 rounded-xl border transition-all ${
                          error
                            ? 'bg-red-500/5 border-red-500/40'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <label className="text-xs font-semibold text-zinc-200 block">
                              {cfg.label}
                            </label>
                            <p className="text-[11px] text-zinc-400 leading-tight">
                              {cfg.description}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                            {/* Native picker with custom wrapper */}
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-800 overflow-hidden cursor-pointer shadow-inner">
                              <input
                                type="color"
                                value={pickerVal}
                                onChange={(e) => handleFieldChange(cfg.key, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title={`Select ${cfg.label}`}
                              />
                              <div
                                className="w-full h-full rounded-lg"
                                style={{ backgroundColor: isValidHex(val) ? val : pickerVal }}
                              />
                            </div>

                            {/* HEX input */}
                            <input
                              type="text"
                              value={val}
                              maxLength={7}
                              onChange={(e) => handleFieldChange(cfg.key, e.target.value)}
                              placeholder="#000000"
                              className={`w-24 px-2.5 py-1.5 rounded-lg bg-zinc-900 border text-xs font-mono text-zinc-100 outline-none transition-colors ${
                                error
                                  ? 'border-red-500 focus:border-red-400'
                                  : 'border-zinc-700 focus:border-zinc-500'
                              }`}
                            />
                          </div>
                        </div>

                        {error && (
                          <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Footer */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">Footer Information</h2>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="footerText" className="text-xs font-medium text-zinc-200">
                      Footer Text / Copyright Notice
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {formSettings.footerText.length} / 300
                    </span>
                  </div>
                  <input
                    id="footerText"
                    type="text"
                    value={formSettings.footerText}
                    maxLength={300}
                    onChange={(e) => handleFieldChange('footerText', e.target.value)}
                    placeholder="e.g. © 2026 Abdur Rahman. Built with React & Node.js."
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950/80 border text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors ${
                      fieldErrors.footerText
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-zinc-800 focus:border-zinc-600'
                    }`}
                  />
                  {fieldErrors.footerText && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.footerText}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Appears across the bottom of the public portfolio pages.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar / Live Preview Column */}
          <div className="lg:col-span-5 sticky top-20 space-y-6">
            {/* Search Engine Result Snippet Preview */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                    SEO Snippet Preview
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Google Result</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                  <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>https://abdurrahman.dev</span>
                </div>
                <h3 className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
                  {formSettings.websiteTitle || 'Abdur Rahman | Portfolio'}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {formSettings.metaDescription ||
                    'Professional portfolio showcasing web development, full-stack software engineering, and cybersecurity research.'}
                </p>
              </div>
            </div>

            {/* Footer Notice Preview */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                    Footer Preview
                  </h2>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                <p className="text-xs text-zinc-400 font-mono break-words">
                  {formSettings.footerText ||
                    `© ${new Date().getFullYear()} Abdur Rahman. All rights reserved.`}
                </p>
              </div>
            </div>

            {/* Color Palette Mini Swatch */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                    Active Colors
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {COLOR_FIELDS.map((cfg) => {
                  const val = formSettings[cfg.key] || cfg.default;
                  return (
                    <div key={cfg.key} className="text-center space-y-1">
                      <div
                        className="w-full h-7 rounded-lg border border-zinc-700 shadow-inner"
                        style={{ backgroundColor: isValidHex(val) ? val : cfg.default }}
                        title={`${cfg.label}: ${val}`}
                      />
                      <span className="text-[9px] font-mono text-zinc-400 block truncate">
                        {cfg.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
