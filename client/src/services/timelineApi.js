/**
 * Timeline API service — Education & Experience
 * Follows the same token/auth pattern as projectsApi.js and skillsApi.js.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Education ───────────────────────────────────────────────────────────────

export async function fetchEducation() {
  const response = await fetch(`${API_URL}/education`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load education entries');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createEducation(entryData, token) {
  const response = await fetch(`${API_URL}/education`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entryData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create education entry');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateEducation(id, entryData, token) {
  const response = await fetch(`${API_URL}/education/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entryData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update education entry');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteEducation(id, token) {
  const response = await fetch(`${API_URL}/education/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete education entry');
    error.status = response.status;
    throw error;
  }

  return data;
}

// ─── Experience ──────────────────────────────────────────────────────────────

export async function fetchExperience() {
  const response = await fetch(`${API_URL}/experience`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load experience entries');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createExperience(entryData, token) {
  const response = await fetch(`${API_URL}/experience`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entryData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create experience entry');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateExperience(id, entryData, token) {
  const response = await fetch(`${API_URL}/experience/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entryData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update experience entry');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteExperience(id, token) {
  const response = await fetch(`${API_URL}/experience/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete experience entry');
    error.status = response.status;
    throw error;
  }

  return data;
}
