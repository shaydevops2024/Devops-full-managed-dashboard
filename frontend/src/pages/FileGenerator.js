// frontend/src/pages/FileGenerator.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const generators = [
  {
    id: 'docker',
    title: 'Docker',
    icon: '🐳',
    description: 'Generate Dockerfiles for containerized applications',
    path: '/files/docker'
  },
  {
    id: 'terraform',
    title: 'Terraform',
    icon: '🏗️',
    description: 'Create infrastructure as code configurations',
    path: '/files/terraform'
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    icon: '☸️',
    description: 'Generate Kubernetes deployment manifests',
    path: '/files/kubernetes'
  },
  {
    id: 'helm',
    title: 'Helm',
    icon: '⎈',
    description: 'Create Helm chart templates',
    path: '/files/helm'
  },
  {
    id: 'argocd',
    title: 'ArgoCD',
    icon: '🦑',
    description: 'Generate ArgoCD application manifests',
    path: '/files/argocd'
  },
  {
    id: 'jenkins',
    title: 'Jenkins',
    icon: '🤖',
    description: 'Create Jenkins pipeline configurations',
    path: '/files/jenkins'
  }
];

function FileGenerator() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      {/* Header */}
      <nav style={{ 
        background: '#16213e', 
        padding: '1rem 2rem', 
        borderBottom: '2px solid #2496ED',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#0f3460',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              color: '#2496ED',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a4d7a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0f3460'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, color: '#2496ED', fontSize: '1.8rem' }}>
              DevOps File Generator
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
              Create and deploy configuration files
            </p>
          </div>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #4ecca3 0%, #2d98da 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(78, 204, 163, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 204, 163, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 204, 163, 0.4)';
          }}
        >
          <Home size={20} />
          Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ 
        padding: '3rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #4ecca3 0%, #2496ED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Choose Your Generator
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#aaa', margin: 0 }}>
            Select a tool to generate its configuration files
          </p>
        </div>

        {/* Generator Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {generators.map((generator) => (
            <div
              key={generator.id}
              onClick={() => navigate(generator.path)}
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',
                border: '2px solid #2496ED40',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#2496ED';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(36, 150, 237, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#2496ED40';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, #2496ED20 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {generator.icon}
                </div>
                <h3 style={{ 
                  margin: '0 0 0.75rem 0', 
                  color: '#2496ED',
                  fontSize: '1.8rem',
                  textAlign: 'center'
                }}>
                  {generator.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#aaa',
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}>
                  {generator.description}
                </p>
                
                {/* Click indicator */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  background: '#2496ED20',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#2496ED',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Click to Generate →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FileGenerator;
