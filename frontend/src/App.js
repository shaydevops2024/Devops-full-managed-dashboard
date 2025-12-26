// /home/claude/devops-dashboard/frontend/src/App.js

import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';

import Register from './pages/Register';

import Dashboard from './pages/Dashboard';

import FileGenerator from './pages/FileGenerator';

import DockerGenerator from './pages/tools/DockerGenerator';

import TerraformGenerator from './pages/tools/TerraformGenerator';

import KubernetesGenerator from './pages/tools/KubernetesGenerator';

import HelmGenerator from './pages/tools/HelmGenerator';

import ArgoCDGenerator from './pages/tools/ArgoCDGenerator';

import JenkinsGenerator from './pages/tools/JenkinsGenerator';



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

          <Route

            path="/dashboard"

            element={

              <PrivateRoute>

                <Dashboard />

              </PrivateRoute>

            }

          />

          <Route

            path="/files"

            element={

              <PrivateRoute>

                <FileGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/docker"

            element={

              <PrivateRoute>

                <DockerGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/terraform"

            element={

              <PrivateRoute>

                <TerraformGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/kubernetes"

            element={

              <PrivateRoute>

                <KubernetesGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/helm"

            element={

              <PrivateRoute>

                <HelmGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/argocd"

            element={

              <PrivateRoute>

                <ArgoCDGenerator />

              </PrivateRoute>

            }

          />

          <Route

            path="/files/jenkins"

            element={

              <PrivateRoute>

                <JenkinsGenerator />

              </PrivateRoute>

            }

          />

        </Routes>

      </Router>

    </AuthProvider>

  );

}



export default App;