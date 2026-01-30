import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add Firebase token
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Get fresh token before each request
        const token = await user.getIdToken(true);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (tokenError) {
        console.error('Error getting Firebase token:', tokenError);
        // Don't reject the request, just continue without the token
        // The backend will handle unauthorized access
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging purposes with better structure checking
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status || 'Unknown',
        message: error.response.statusText || 'Unknown error',
        data: error.response.data || {},
        url: error.config?.url || 'Unknown URL'
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', {
        message: 'No response received from server',
        url: error.config?.url || 'Unknown URL',
        error: error.message || 'Unknown error'
      });
    } else {
      // Something else happened
      console.error('Request Setup Error:', {
        message: error.message || 'Unknown error',
        url: error.config?.url || 'Unknown URL'
      });
    }
    
    // You can dispatch a global toast notification here if you have a toast context
    // For example: toast.error(error.response?.data?.message || 'An unexpected error occurred');
    
    return Promise.reject(error);
  }
);

// API Functions
export const authSync = () => api.post('/auth/sync');

export const fetchBoards = () => api.get('/boards');

export const createBoard = (title) => api.post('/boards', { title });

export const fetchBoardDetails = (boardId) => api.get(`/boards/${boardId}`);

export const createTask = (boardId, taskData) => 
  api.post('/todos', { boardId, ...taskData });

export const moveTask = (taskId, boardId, status, newPosition) =>
  api.patch(`/todos/${taskId}/move`, { boardId, status, position: newPosition });

export const updateTask = (taskId, data) => api.patch(`/todos/${taskId}`, data);

export const getTaskById = (taskId) => api.get(`/todos/${taskId}`);

export const deleteTask = (taskId) => api.delete(`/todos/${taskId}`);

export const deleteBoard = (boardId) => api.delete(`/boards/${boardId}`);

export default api;