// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

axios.defaults.baseURL = API_BASE_URL;

// Interceptors for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
  getMe: () => axios.get('/auth/me'),
  updatePreferences: (preferences) => axios.patch('/auth/preferences', preferences),

  // Tools
  checkTool: (toolName) => axios.get(`/tools/check/${toolName}`),
  checkAllTools: () => axios.get('/tools/check-all'),
  getInstalledTools: () => axios.get('/tools/installed'),

  // Manifests
  generateManifest: (data) => axios.post('/manifests/generate', data),
  getManifests: (params) => axios.get('/manifests', { params }),
  getManifest: (id) => axios.get(`/manifests/${id}`),
  updateManifest: (id, data) => axios.put(`/manifests/${id}`, data),
  deleteManifest: (id) => axios.delete(`/manifests/${id}`),
  getTemplates: (type) => axios.get(`/manifests/templates/${type}`),

  // System
  getSystemInfo: () => axios.get('/system/info'),
  executeCommand: (command) => axios.post('/system/execute', { command }),
  getHosts: () => axios.get('/system/hosts'),

  // Files
  uploadFile: (formData) => axios.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFiles: (params) => axios.get('/files', { params }),
  getFile: (id) => axios.get(`/files/${id}`),
  updateFile: (id, data) => axios.put(`/files/${id}`, data),
  deleteFile: (id) => axios.delete(`/files/${id}`),
  downloadFile: (id) => axios.get(`/files/${id}/download`, { responseType: 'blob' }),

  // Monitoring
  getDockerContainers: () => axios.get('/monitoring/docker/containers'),
  getContainerLogs: (id, lines = 100) => axios.get(`/monitoring/docker/containers/${id}/logs`, { params: { lines } }),
  getKubernetesPods: () => axios.get('/monitoring/kubernetes/pods'),
  getPodLogs: (namespace, name, lines = 100, container) => 
    axios.get(`/monitoring/kubernetes/pods/${namespace}/${name}/logs`, { params: { lines, container } }),
  getKubernetesServices: () => axios.get('/monitoring/kubernetes/services'),
  getKubernetesNodes: () => axios.get('/monitoring/kubernetes/nodes'),
  getServiceStatus: (serviceName) => axios.get(`/monitoring/services/${serviceName}`),
  getMetrics: () => axios.get('/monitoring/metrics'),
  startRealTimeMonitoring: () => axios.post('/monitoring/start-realtime'),
  stopRealTimeMonitoring: () => axios.post('/monitoring/stop-realtime'),
};

export default api;