import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

/**
 * Hook to consume the public theme context.
 * Use in public components only (not admin).
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}
