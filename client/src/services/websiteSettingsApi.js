/**
 * Website Settings API service
 * Handles fetching and updating appearance/theme settings.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

let cachedSettings = null;
let inFlightSettingsPromise = null;

export function clearWebsiteSettingsCache() {
  cachedSettings = null;
  inFlightSettingsPromise = null;
}

export async function fetchWebsiteSettings({ forceRefresh = false } = {}) {
  if (cachedSettings && !forceRefresh) {
    return cachedSettings;
  }

  if (inFlightSettingsPromise) {
    return inFlightSettingsPromise;
  }

  inFlightSettingsPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to load website settings');
        error.status = response.status;
        throw error;
      }

      cachedSettings = data;
      return data;
    } catch (err) {
      cachedSettings = null;
      throw err;
    } finally {
      inFlightSettingsPromise = null;
    }
  })();

  return inFlightSettingsPromise;
}

export async function updateWebsiteSettings(settingsData, token) {
  const response = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settingsData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update website settings');
    error.status = response.status;
    throw error;
  }

  if (data.success && data.data) {
    cachedSettings = data;
  } else {
    clearWebsiteSettingsCache();
  }

  return data;
}
