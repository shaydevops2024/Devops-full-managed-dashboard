
// /home/claude/devops-dashboard/frontend/src/App.js

import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';

import Register from './pages/Register';

import Dashboard from './pages/Dashboard';



function PrivateRoute({ children }) {

  const { user, loading } = useAuth();



  if (loading) {

    return (

      <div style={{ 

        minHeight: '100vh', 

        display: 'flex', 

        alignItems: 'center', 

        justifyContent: 'center',

        background: '#1a1a2e',

        color: '#fff'

      }}>

        Loading...

      </div>

    );

  }



  return user ? children : <Navigate to="/login" />;

}



function App() {

  return (

    <AuthProvider>

      <Router>

        <Toaster position="top-right" />

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route

            path="/"

            element={

              <PrivateRoute>

                <Dashboard />

              </PrivateRoute>

            }

          />

        </Routes>

      </Router>

    </AuthProvider>

  );

}



export default App;

