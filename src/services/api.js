import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return 'https://otplessbackend.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseURL();
console.log(`🌐 API Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  withCredentials: true // Add this for CORS credentials
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`❌ Error from ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

// Helper to update user data
const updateUserData = (userData) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new CustomEvent('user:updated', { detail: userData }));
  }
};

export const authService = {
  // Register new user
  register: async (name, mobileNumber) => {
    const response = await api.post('/users/register', { name, mobileNumber });
    return response.data;
  },

  // Send OTP
  sendOTP: async (mobileNumber) => {
    const response = await api.post('/users/send-otp', { mobileNumber });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (mobileNumber, otpCode) => {
    const response = await api.post('/users/verify-otp', { mobileNumber, otpCode });
    if (response.data.user) {
      updateUserData(response.data.user);
    }
    return response.data;
  },

  // Get user profile
  getProfile: async (mobileNumber) => {
    const response = await api.get(`/users/profile/${mobileNumber}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (mobileNumber, name) => {
    const response = await api.put(`/users/update/${mobileNumber}`, { name });
    if (response.data.user) {
      updateUserData(response.data.user);
    }
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  }
};

export default api;