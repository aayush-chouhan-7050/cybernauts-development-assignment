// src/services/api.ts
import axios from 'axios';

// Use environment variable with fallback for development
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;