/**
 * Social Links API service
 * Follows the same token/auth pattern as projectsApi.js, skillsApi.js, timelineApi.js.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

let inFlightSocialPromise = null;

// Public — active links only
export async function fetchSocialLinks() {
  if (inFlightSocialPromise) {
    return inFlightSocialPromise;
  }

  inFlightSocialPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/social-links`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to load social links');
        error.status = response.status;
        throw error;
      }

      return data;
    } finally {
      setTimeout(() => {
        inFlightSocialPromise = null;
      }, 50);
    }
  })();

  return inFlightSocialPromise;
}


// Admin — all links including inactive
export async function fetchAllSocialLinks(token) {
  const response = await fetch(`${API_URL}/social-links/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load social links');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createSocialLink(linkData, token) {
  const response = await fetch(`${API_URL}/social-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(linkData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create social link');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateSocialLink(id, linkData, token) {
  const response = await fetch(`${API_URL}/social-links/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(linkData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update social link');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteSocialLink(id, token) {
  const response = await fetch(`${API_URL}/social-links/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete social link');
    error.status = response.status;
    throw error;
  }

  return data;
}
