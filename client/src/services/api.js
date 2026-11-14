let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').trim();
if (!rawBaseUrl.includes('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`;
}
const API_BASE_URL = rawBaseUrl;

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('helpdesk_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.code = data.code || 'API_ERROR';
      error.status = res.status;
      error.details = data.details || null;
      throw error;
    }

    return data;
  } catch (err) {
    // If unauthorized, clear invalid token
    if (err.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem('helpdesk_user');
    }
    throw err;
  }
};

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(url, { method: 'GET' });
  },

  post: (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put: (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  patch: (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  }
};

