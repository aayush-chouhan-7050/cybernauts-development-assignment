// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;