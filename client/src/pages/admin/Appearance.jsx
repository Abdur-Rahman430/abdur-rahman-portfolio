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
  Palette,
  RotateCcw,
  Undo2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Sliders,
  Layers,
  X,
} from 'lucide-react';

const COLOR_CONFIG = [
  {
    key: 'primaryColor',
    label: 'Primary Color',
    description: 'Main brand accent, primary CTA buttons, and active highlights.',
    default: DEFAULT_THEME.primaryColor,
  },
  {
    key: 'secondaryColor',
    label: 'Secondary Color',
    description: 'Subtle backgrounds, elevated cards, and secondary interactive elements.',
    default: DEFAULT_THEME.secondaryColor,
  },
  {
    key: 'accentColor',
    label: 'Accent Color',
    description: 'Special badges, gradient stops, links, and vibrant callouts.',
    default: DEFAULT_THEME.accentColor,
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    description: 'Main canvas and body background color across the entire application.',
    default: DEFAULT_THEME.backgroundColor,
  },
  {
    key: 'textColor',
    label: 'Text Color',
    description: 'Primary typography color for headings, titles, and body content.',
    default: DEFAULT_THEME.textColor,
  },
];

// Helper to normalize 3-digit hex to 6-digit for native input[type="color"]
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

export default function AdminAppearance() {
  const { token } = useAuth();

  const [savedColors, setSavedColors] = useState(DEFAULT_THEME);
  const [formColors, setFormColors] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Check if current form has unsaved modifications
  const hasUnsavedChanges = Object.keys(DEFAULT_THEME).some(
    (key) => formColors[key] !== savedColors[key]
  );

  // Load existing settings
  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetchWebsiteSettings();
        if (isMounted && res.success && res.data) {
          const loaded = {
            primaryColor: res.data.primaryColor || DEFAULT_THEME.primaryColor,
            secondaryColor: res.data.secondaryColor || DEFAULT_THEME.secondaryColor,
            accentColor: res.data.accentColor || DEFAULT_THEME.accentColor,
            backgroundColor: res.data.backgroundColor || DEFAULT_THEME.backgroundColor,
            textColor: res.data.textColor || DEFAULT_THEME.textColor,
          };
          setSavedColors(loaded);
          setFormColors(loaded);
          // Apply initial loaded theme globally
          applyTheme(loaded);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || 'Failed to load appearance settings');
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

  function handleColorChange(key, value) {
    setFormColors((prev) => ({ ...prev, [key]: value }));
    // Clear validation error if valid
    if (isValidHex(value)) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  function handleRevert() {
    setFormColors(savedColors);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('Unsaved changes reverted to last saved theme.');
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function handleResetDefaults() {
    setFormColors(DEFAULT_THEME);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('Reset to portfolio baseline defaults. Click "Save Changes" to persist.');
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function validateColors() {
    const errors = {};
    for (const config of COLOR_CONFIG) {
      const val = formColors[config.key];
      if (!val || !isValidHex(val)) {
        errors[config.key] = 'Must be a valid HEX color (e.g. #10b981 or #fff)';
      }
    }
    return errors;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errors = validateColors();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fix invalid HEX color values before saving.');
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        primaryColor: formColors.primaryColor.trim(),
        secondaryColor: formColors.secondaryColor.trim(),
        accentColor: formColors.accentColor.trim(),
        backgroundColor: formColors.backgroundColor.trim(),
        textColor: formColors.textColor.trim(),
      };

      const res = await updateWebsiteSettings(payload, token);
      if (res.success) {
        const updated = {
          primaryColor: res.data.primaryColor || payload.primaryColor,
          secondaryColor: res.data.secondaryColor || payload.secondaryColor,
          accentColor: res.data.accentColor || payload.accentColor,
          backgroundColor: res.data.backgroundColor || payload.backgroundColor,
          textColor: res.data.textColor || payload.textColor,
        };
        setSavedColors(updated);
        setFormColors(updated);
        // Apply saved theme globally
        applyTheme(updated);
        setSuccessMessage('Appearance & theme settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save appearance settings');
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
            <Palette className="w-6 h-6 text-emerald-400" />
            Appearance &amp; Theme
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Customize the dynamic color palette used throughout your portfolio.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            title="Reset to default theme values"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleRevert}
            disabled={!hasUnsavedChanges || saving || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Revert edits to last saved state"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
            Revert Edits
          </button>

          <button
            type="submit"
            form="appearance-form"
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
            ))}
          </div>
          <div className="lg:col-span-5 h-96 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-zinc-200 font-semibold mb-1">Failed to load appearance settings</p>
          <p className="text-xs text-zinc-400 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Color Palette Settings</h2>
                </div>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unsaved Edits
                  </span>
                )}
              </div>

              <form id="appearance-form" onSubmit={handleSave} className="space-y-4" noValidate>
                {COLOR_CONFIG.map((cfg) => {
                  const val = formColors[cfg.key] || cfg.default;
                  const pickerVal = to6DigitHex(val);
                  const error = fieldErrors[cfg.key];

                  return (
                    <div
                      key={cfg.key}
                      className={`p-4 rounded-xl border transition-all ${
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

                        {/* Pickers */}
                        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                          {/* Native color picker wrapper */}
                          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-700 bg-zinc-800 overflow-hidden cursor-pointer shadow-inner">
                            <input
                              type="color"
                              value={pickerVal}
                              onChange={(e) => handleColorChange(cfg.key, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title={`Choose ${cfg.label}`}
                            />
                            <div
                              className="w-full h-full rounded-lg"
                              style={{ backgroundColor: isValidHex(val) ? val : pickerVal }}
                            />
                          </div>

                          {/* Text HEX Input */}
                          <div className="relative">
                            <input
                              type="text"
                              value={val}
                              maxLength={7}
                              onChange={(e) => handleColorChange(cfg.key, e.target.value)}
                              placeholder="#000000"
                              className={`w-28 px-3 py-2 rounded-xl bg-zinc-900 border text-xs font-mono text-zinc-100 outline-none transition-colors ${
                                error
                                  ? 'border-red-500 focus:border-red-400'
                                  : 'border-zinc-700 focus:border-zinc-500'
                              }`}
                            />
                          </div>
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
              </form>
            </div>
          </div>

          {/* Live Preview column */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Live Preview</h2>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Isolated Preview
                </span>
              </div>

              {/* Isolated Simulated UI Card */}
              <div
                className="rounded-2xl p-5 border shadow-2xl transition-colors duration-200 overflow-hidden space-y-4"
                style={{
                  backgroundColor: isValidHex(formColors.backgroundColor)
                    ? formColors.backgroundColor
                    : DEFAULT_THEME.backgroundColor,
                  borderColor: isValidHex(formColors.secondaryColor)
                    ? formColors.secondaryColor
                    : DEFAULT_THEME.secondaryColor,
                  color: isValidHex(formColors.textColor)
                    ? formColors.textColor
                    : DEFAULT_THEME.textColor,
                }}
              >
                {/* Header mock */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isValidHex(formColors.primaryColor)
                          ? formColors.primaryColor
                          : DEFAULT_THEME.primaryColor,
                        color: isValidHex(formColors.backgroundColor)
                          ? formColors.backgroundColor
                          : '#000000',
                      }}
                    >
                      AR
                    </div>
                    <span className="text-xs font-bold tracking-tight">Abdur Rahman</span>
                  </div>

                  {/* Accent Pill */}
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: `${isValidHex(formColors.accentColor) ? formColors.accentColor : DEFAULT_THEME.accentColor}20`,
                      color: isValidHex(formColors.accentColor)
                        ? formColors.accentColor
                        : DEFAULT_THEME.accentColor,
                    }}
                  >
                    Featured
                  </span>
                </div>

                {/* Hero preview */}
                <div className="space-y-2 py-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono opacity-80">
                    <Sparkles
                      className="w-3 h-3"
                      style={{
                        color: isValidHex(formColors.accentColor)
                          ? formColors.accentColor
                          : DEFAULT_THEME.accentColor,
                      }}
                    />
                    Full-Stack Engineer &amp; Researcher
                  </div>
                  <h3 className="text-base font-extrabold leading-snug">
                    Building scalable, secure web architectures.
                  </h3>
                  <p className="text-xs opacity-70 leading-relaxed">
                    This preview dynamically updates in real-time as you tweak theme colors.
                  </p>
                </div>

                {/* Interactive Card Element (Secondary color demo) */}
                <div
                  className="p-3.5 rounded-xl border space-y-2"
                  style={{
                    backgroundColor: isValidHex(formColors.secondaryColor)
                      ? formColors.secondaryColor
                      : DEFAULT_THEME.secondaryColor,
                    borderColor: `${isValidHex(formColors.textColor) ? formColors.textColor : '#ffffff'}15`,
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 opacity-80" />
                      Portfolio Project Card
                    </span>
                    <span
                      className="text-[10px] font-mono"
                      style={{
                        color: isValidHex(formColors.primaryColor)
                          ? formColors.primaryColor
                          : DEFAULT_THEME.primaryColor,
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70">
                    Demonstrating secondary surface container styling with current theme values.
                  </p>
                </div>

                {/* Button Action Element (Primary Color demo) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-transform shadow-md"
                    style={{
                      backgroundColor: isValidHex(formColors.primaryColor)
                        ? formColors.primaryColor
                        : DEFAULT_THEME.primaryColor,
                      color: isValidHex(formColors.backgroundColor)
                        ? formColors.backgroundColor
                        : '#000000',
                    }}
                  >
                    Primary Button CTA
                  </button>

                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl text-xs font-medium border"
                    style={{
                      borderColor: `${isValidHex(formColors.textColor) ? formColors.textColor : '#ffffff'}30`,
                      color: isValidHex(formColors.textColor)
                        ? formColors.textColor
                        : DEFAULT_THEME.textColor,
                    }}
                  >
                    Outline
                  </button>
                </div>
              </div>

              {/* Theme palette chips */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {COLOR_CONFIG.map((cfg) => {
                  const val = formColors[cfg.key] || cfg.default;
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
