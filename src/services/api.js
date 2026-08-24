import { auth } from '../lib/firebase.js';

async function getAuthHeader() {
  if (!auth?.currentUser) return {};
  try {
    const token = await auth.currentUser.getIdToken(false);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (err) {
    console.warn('[API Client] Failed to retrieve Firebase ID token:', err);
    return {};
  }
}

async function request(endpoint, options = {}) {
  const authHeaders = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: `HTTP ${response.status} ${response.statusText}`
  }));

  if (!response.ok || !data.success) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data.data;
}

export const api = {
  // Synchronize authenticated Firebase user with Neon database
  async syncAuthUser() {
    return request('/api/auth/sync', {
      method: 'POST'
    });
  },

  // Retrieve Neon profile for authenticated user
  async getProfile() {
    return request('/api/profile', {
      method: 'GET'
    });
  },

  // Update user profile in Neon database
  async updateProfile(payload) {
    return request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // Submit contact message (handles both authenticated & guest submissions)
  async submitContact(payload) {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Submit community feedback
  async submitFeedback(payload) {
    return request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- ADMIN ENDPOINTS ---

  // Retrieve all feedback entries (requires admin permissions)
  async getAdminFeedback() {
    return request('/api/admin/feedback', {
      method: 'GET'
    });
  },

  // Delete feedback entry by ID (requires admin permissions)
  async deleteAdminFeedback(id) {
    return request(`/api/admin/feedback/${id}`, {
      method: 'DELETE'
    });
  },

  // Retrieve all contact submissions (requires admin permissions)
  async getAdminContacts() {
    return request('/api/admin/contacts', {
      method: 'GET'
    });
  },

  // Delete contact submission by ID (requires admin permissions)
  async deleteAdminContact(id) {
    return request(`/api/admin/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // Update contact submission status or starred state
  async updateAdminContact(id, payload) {
    return request(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload)
    });
  },

  // Backward compatibility alias
  async updateAdminContactStatus(id, status = 'replied') {
    return this.updateAdminContact(id, { status });
  },

  // Update feedback status or starred state
  async updateAdminFeedback(id, payload) {
    return request(`/api/admin/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload)
    });
  },

  // Retrieve ASL study playground gamification progress
  async getPlaygroundProgress() {
    return request('/api/playground/progress', {
      method: 'GET'
    });
  },

  // Save/sync ASL study playground gamification progress to Neon
  async updatePlaygroundProgress(payload) {
    return request('/api/playground/progress', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};
