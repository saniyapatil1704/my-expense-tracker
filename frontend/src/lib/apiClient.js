const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'expense_tracker_token';

let onUnauthorizedCallback = null;

export const setOnUnauthorized = (cb) => {
  onUnauthorizedCallback = cb;
};

const handleUnauthorized = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
};

export const apiClient = {
  async request(path, options = {}) {
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      throw new Error("can't reach the server, check your connection");
    }

    if (response.status === 401) {
      handleUnauthorized();
      let errorMessage = 'Unauthorized';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (_) { }
      const error = new Error(errorMessage);
      error.status = 401;
      throw error;
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (_) { }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    if (options.responseType === 'blob') {
      return response.blob();
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  },

  async get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  },

  async post(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  async patch(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  async delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  }
};

export default apiClient;
