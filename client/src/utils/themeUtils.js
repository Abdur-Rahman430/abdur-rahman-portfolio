/**
 * Theme utility for managing CSS custom properties across the application.
 */

export const DEFAULT_THEME = {
  primaryColor: '#10b981',
  secondaryColor: '#18181b',
  accentColor: '#38bdf8',
  backgroundColor: '#09090b',
  textColor: '#f4f4f5',
};

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(color) {
  return typeof color === 'string' && HEX_REGEX.test(color.trim());
}

/**
 * Applies theme colors to document root custom CSS properties.
 * Falls back to default values for missing or invalid colors.
 */
export function applyTheme(theme = {}) {
  const root = document.documentElement;
  if (!root) return;

  const primary = isValidHex(theme.primaryColor) ? theme.primaryColor : DEFAULT_THEME.primaryColor;
  const secondary = isValidHex(theme.secondaryColor) ? theme.secondaryColor : DEFAULT_THEME.secondaryColor;
  const accent = isValidHex(theme.accentColor) ? theme.accentColor : DEFAULT_THEME.accentColor;
  const background = isValidHex(theme.backgroundColor) ? theme.backgroundColor : DEFAULT_THEME.backgroundColor;
  const text = isValidHex(theme.textColor) ? theme.textColor : DEFAULT_THEME.textColor;

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-background', background);
  root.style.setProperty('--color-text', text);
}
