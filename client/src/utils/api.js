const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Only add default token if Authorization header not already provided
  if (!headers.Authorization) {
    const token = localStorage.getItem("pp_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
