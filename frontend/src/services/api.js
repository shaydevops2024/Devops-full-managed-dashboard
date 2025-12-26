// /home/shayg/open-source-contribute/Devops-full-managed-dashboard/frontend/src/services/api.js

import axios from 'axios';



// Determine API URL based on environment

const getApiUrl = () => {

  // If running in production (built app), use relative path to leverage nginx proxy

  if (process.env.NODE_ENV === 'production') {

    return '/api';

  }

  // In development, use env variable or localhost

  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

};



const API_BASE_URL = getApiUrl();



const api = axios.create({

  baseURL: API_BASE_URL

});



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



api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem('token');

      window.location.href = '/login';

    }

    return Promise.reject(error);

  }

);



export const authAPI = {

  login: (credentials) => api.post('/auth/login', credentials),

  register: (userData) => api.post('/auth/register', userData),

  getMe: () => api.get('/auth/me'),

};



export const toolsAPI = {

  checkAll: () => api.get('/tools/check-all'),

  check: (toolName) => api.get(`/tools/check/${toolName}`),

};



export const dockerAPI = {

  getContainers: () => api.get('/docker/containers'),

  getComposeServices: () => api.get('/docker/compose/services'),

  startContainer: (id) => api.post(`/docker/containers/${id}/start`),

  stopContainer: (id) => api.post(`/docker/containers/${id}/stop`),

  restartContainer: (id) => api.post(`/docker/containers/${id}/restart`),

  getContainerLogs: (id, tail = 100) => api.get(`/docker/containers/${id}/logs`, { params: { tail } }),

  checkDocker: () => api.get('/docker/check'),

  deleteContainer: (id) => api.delete(`/docker/containers/${id}`)

};



export const monitoringAPI = {

  getMetrics: () => api.get('/monitoring/metrics'),

};



export const getLogsUrl = (containerId) => {

  const baseUrl = API_BASE_URL.replace('/api', '');

  return `${baseUrl}/api/docker/containers/${containerId}/logs?follow=true&tail=500`;

};




export default api;