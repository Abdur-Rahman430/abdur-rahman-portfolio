const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Public message submission service
 * POST /api/messages
 * @param {Object} messageData - { name, email, subject, message }
 */
export async function sendMessage(messageData) {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: messageData.name,
      email: messageData.email,
      subject: messageData.subject || '',
      message: messageData.message,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to send message');
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Admin: Fetch messages with pagination and filtering
 * GET /api/messages
 * @param {string} token
 * @param {Object} [params] - { page, limit, read }
 */
export async function fetchMessages(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page);
  if (params.limit) queryParams.set('limit', params.limit);
  if (params.read !== undefined && params.read !== 'ALL') {
    queryParams.set('read', params.read);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}/messages?${queryString}` : `${API_URL}/messages`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load messages');
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Admin: Update message read status
 * PATCH /api/messages/:id/read
 * @param {string} id
 * @param {boolean} read
 * @param {string} token
 */
export async function updateMessageReadStatus(id, read, token) {
  const response = await fetch(`${API_URL}/messages/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ read }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update message status');
    error.status = response.status;
    throw error;
  }

  return data;
}

