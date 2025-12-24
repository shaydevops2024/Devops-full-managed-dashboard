// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Monitoring from './pages/Monitoring';
import Files from './pages/Files';
import Documentation from './pages/Documentation';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-layout">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success-color)',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--error-color)',
                    secondary: 'white',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate/:tool"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Generator />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Monitoring />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Files />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentation"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Documentation />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;