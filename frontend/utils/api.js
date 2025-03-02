import axios from 'axios';

const API_URL = 'http://localhost:6565';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add the updateUserProfile function
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/api/auth/profile', userData);
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api; 