const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchSkills() {
  const response = await fetch(`${API_URL}/skills`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load skills');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createSkill(skillData, token) {
  const response = await fetch(`${API_URL}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(skillData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create skill');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateSkill(id, skillData, token) {
  const response = await fetch(`${API_URL}/skills/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(skillData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update skill');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteSkill(id, token) {
  const response = await fetch(`${API_URL}/skills/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete skill');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function seedInitialSkills(token) {
  const response = await fetch(`${API_URL}/skills/seed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to seed initial skills');
    error.status = response.status;
    throw error;
  }

  return data;
}
