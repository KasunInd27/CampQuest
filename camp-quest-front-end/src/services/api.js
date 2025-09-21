// Default to same-origin so Vite dev proxy can forward /api and /uploads to backend
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const api = {
  baseUrl: BASE_URL,

  async getBlogs(params = {}) {
    const qs = new URLSearchParams({ published: 'true', ...params }).toString();
    const res = await fetch(`${BASE_URL}/api/blogs?${qs}`, {
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getBlogById(id) {
    const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createBlog(payload) {
    // If payload has a File (featuredImage), send as FormData. Otherwise send JSON
    if (payload.featuredImage instanceof File) {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') form.append(k, v);
      });
      const res = await fetch(`${BASE_URL}/api/blogs`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      return handleResponse(res);
    }

    const res = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async reactToBlog(id, reactionType) {
    const res = await fetch(`${BASE_URL}/api/blogs/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType }),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async updateBlog(id, payload) {
    // PUT update supports either JSON or multipart if a new File is attached
    if (payload.featuredImage instanceof File) {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') form.append(k, v);
      });
      const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
        method: 'PUT',
        body: form,
        credentials: 'include',
      });
      return handleResponse(res);
    }

    const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async deleteBlog(id) {
    const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },
};
