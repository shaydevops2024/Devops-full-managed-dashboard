
// /home/claude/devops-dashboard/frontend/src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

import { authAPI } from '../services/api';



const AuthContext = createContext();



export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error('useAuth must be used within AuthProvider');

  }

  return context;

};



export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const token = localStorage.getItem('token');

    if (token) {

      loadUser();

    } else {

      setLoading(false);

    }

  }, []);



  const loadUser = async () => {

    try {

      const response = await authAPI.getMe();

      setUser(response.data.user);

    } catch (error) {

      localStorage.removeItem('token');

    } finally {

      setLoading(false);

    }

  };



  const login = async (credentials) => {

    const response = await authAPI.login(credentials);

    localStorage.setItem('token', response.data.token);

    setUser(response.data.user);

    return response.data;

  };



  const register = async (userData) => {

    const response = await authAPI.register(userData);

    localStorage.setItem('token', response.data.token);

    setUser(response.data.user);

    return response.data;

  };



  const logout = () => {

    localStorage.removeItem('token');

    setUser(null);

    window.location.href = '/login';

  };



  return (

    <AuthContext.Provider value={{ user, loading, login, register, logout }}>

      {children}

    </AuthContext.Provider>

  );

};

