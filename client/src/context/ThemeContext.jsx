import { createContext, useState, useEffect, useCallback } from 'react';

// Internal — not exported directly; use useTheme() hook instead
const ThemeContext = createContext(null);

/**
 * Reads the current effective theme mode.
 * Priority: localStorage → data-theme attribute already set by applyTheme() → 'dark'
 */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage not available
  }
  try {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  } catch {
    // SSR guard
  }
  return 'dark';
}

function applyPublicTheme(mode) {
  try {
    document.documentElement.setAttribute('data-theme', mode);
  } catch {
    // SSR guard
  }
  try {
    localStorage.setItem('portfolio-theme', mode);
  } catch {
    // localStorage not available
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyPublicTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
