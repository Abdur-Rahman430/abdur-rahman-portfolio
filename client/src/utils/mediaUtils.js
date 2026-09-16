/**
 * Media URL resolver for uploaded files.
 *
 * The backend stores media paths as relative paths like `/uploads/images/profile.jpg`.
 * In development, Vite proxies `/uploads/*` to localhost:5000, so these work directly.
 * In production, VITE_API_URL is set to something like `https://backend.com/api` — but
 * uploads are served at the backend ORIGIN (not under /api/), so we must derive the
 * backend origin by stripping the `/api` suffix from VITE_API_URL.
 *
 * Examples:
 *   VITE_API_URL = 'https://backend.com/api'
 *   getMediaUrl('/uploads/images/photo.jpg')
 *   → 'https://backend.com/uploads/images/photo.jpg'  ✓  (NOT /api/uploads/...)
 *
 *   Dev (no VITE_API_URL set, Vite proxy active):
 *   getMediaUrl('/uploads/images/photo.jpg')
 *   → '/uploads/images/photo.jpg'  ✓  (relative, handled by Vite proxy)
 */

const VITE_API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Derives the backend server origin from VITE_API_URL.
 * Returns empty string in dev (Vite proxy handles relative paths).
 */
function getBackendOrigin() {
  if (!VITE_API_URL) return '';
  // Strip trailing /api or /api/ to get the bare origin
  return VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

/**
 * Converts a stored media file path into a fully-qualified URL safe for use
 * as an img src, anchor href, etc.
 *
 * @param {string} filePath - The stored path (e.g. '/uploads/images/profile.jpg')
 *   or a full URL (returned unchanged).
 * @returns {string} Absolute URL or relative path depending on environment.
 */
export function getMediaUrl(filePath) {
  if (!filePath || typeof filePath !== 'string') return '';

  // Already an absolute URL — return as-is
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const origin = getBackendOrigin();

  // In development (no VITE_API_URL), keep the path relative so Vite proxy works
  if (!origin) return filePath;

  // Ensure leading slash
  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${origin}${normalized}`;
}
