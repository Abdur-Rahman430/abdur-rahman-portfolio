const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchProjects() {
  const response = await fetch(`${API_URL}/projects`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load projects');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createProject(projectData, token) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create project');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateProject(id, projectData, token) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update project');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteProject(id, token) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete project');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function uploadProjectImage(file, token, projectId = null) {
  const formData = new FormData();
  formData.append('image', file);

  const endpoint = projectId
    ? `${API_URL}/projects/${projectId}/image`
    : `${API_URL}/projects/upload-image`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to upload project image');
    error.status = response.status;
    throw error;
  }

  return data;
}
