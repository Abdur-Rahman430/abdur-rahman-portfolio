const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function loginAdmin({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Authentication failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getMe(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to verify session');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getAdminStats(token) {
  const response = await fetch(`${API_URL}/admin/stats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch stats');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
