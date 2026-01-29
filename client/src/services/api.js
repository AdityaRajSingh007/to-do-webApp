import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5000/api';

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
      // Get fresh token before each request
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
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

export const deleteTask = (taskId) => api.delete(`/todos/${taskId}`);

export default api;