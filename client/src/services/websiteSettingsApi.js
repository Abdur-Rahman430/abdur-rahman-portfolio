/**
 * Website Settings API service
 * Handles fetching and updating appearance/theme settings.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchWebsiteSettings() {
  const response = await fetch(`${API_URL}/settings`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load website settings');
    error.status = response.status;
    throw error;
  }

  return data;
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

  return data;
}
