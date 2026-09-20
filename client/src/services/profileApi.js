const API_URL = import.meta.env.VITE_API_URL || '/api';

let cachedProfile = null;
let inFlightProfilePromise = null;

export function clearProfileCache() {
  cachedProfile = null;
  inFlightProfilePromise = null;
}

export async function fetchProfile({ forceRefresh = false } = {}) {
  if (cachedProfile && !forceRefresh) {
    return cachedProfile;
  }

  if (inFlightProfilePromise) {
    return inFlightProfilePromise;
  }

  inFlightProfilePromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/profile`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to load profile');
        error.status = response.status;
        throw error;
      }

      cachedProfile = data;
      return data;
    } catch (err) {
      cachedProfile = null;
      throw err;
    } finally {
      inFlightProfilePromise = null;
    }
  })();

  return inFlightProfilePromise;
}


export async function saveProfile(profileData, token) {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to save profile');
    error.status = response.status;
    throw error;
  }

  if (data.success && data.data) {
    cachedProfile = data;
  } else {
    clearProfileCache();
  }

  return data;
}

export async function uploadProfileImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/profile/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to upload profile image');
    error.status = response.status;
    throw error;
  }

  clearProfileCache();

  return data;
}

export async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_URL}/profile/resume`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to upload resume');
    error.status = response.status;
    throw error;
  }

  clearProfileCache();

  return data;
}
