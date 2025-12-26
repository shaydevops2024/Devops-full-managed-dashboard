// frontend/src/pages/FileGenerator.js

import React from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';



const TOOLS = [

  {

    name: 'Docker',

    path: '/files/docker',

    color: '#2496ED',

    icon: '🐳',

    iconSize: '3.5rem',

    description: 'Generate Dockerfiles, docker-compose.yml, and .dockerignore files'

  },

  {

    name: 'Terraform',

    path: '/files/terraform',

    color: '#7B42BC',

    icon: '🏗️',

    iconSize: '3.5rem',

    description: 'Create Terraform configuration files for infrastructure as code'

  },

  {

    name: 'Kubernetes',

    path: '/files/kubernetes',

    color: '#326CE5',

    icon: '☸️',

    iconSize: '3.5rem',

    description: 'Generate Kubernetes manifests, deployments, and services'

  },

  {

    name: 'Helm',

    path: '/files/helm',

    color: '#0F1689',

    icon: '⎈',

    iconSize: '4.5rem',

    description: 'Create Helm charts and values files for K8s applications'

  },

  {

    name: 'ArgoCD',

    path: '/files/argocd',

    color: '#EF7B4D',

    icon: '🔄',

    iconSize: '3.5rem',

    description: 'Generate ArgoCD application manifests and sync configurations'

  },

  {

    name: 'Jenkins',

    path: '/files/jenkins',

    color: '#D24939',

    icon: '👷',

    iconSize: '3.5rem',

    description: 'Create Jenkinsfiles and pipeline configurations'

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

        borderBottom: '2px solid #0f3460',

        display: 'flex',

        alignItems: 'center',

        gap: '1rem'

      }}>

        <button

          onClick={() => navigate('/dashboard')}

          style={{

            background: '#0f3460',

            border: 'none',

            borderRadius: '4px',

            padding: '0.5rem',

            color: '#4ecca3',

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

          <h1 style={{ margin: 0, color: '#4ecca3', fontSize: '1.5rem' }}>

            DevOps File Generator

          </h1>

          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

            Select a tool to generate and deploy configuration files

          </p>

        </div>

      </nav>



      {/* Main Content */}

      <div style={{ 

        padding: '3rem 2rem',

        maxWidth: '1400px',

        margin: '0 auto'

      }}>

        {/* Page Title */}

        <div style={{ 

          textAlign: 'center', 

          marginBottom: '3rem' 

        }}>

          <h2 style={{ 

            fontSize: '2.5rem', 

            margin: '0 0 1rem 0',

            background: 'linear-gradient(135deg, #4ecca3 0%, #2d98da 100%)',

            WebkitBackgroundClip: 'text',

            WebkitTextFillColor: 'transparent',

            fontWeight: 'bold'

          }}>

            Generate & Deploy Configuration Files

          </h2>

          <p style={{ 

            fontSize: '1.1rem', 

            color: '#aaa',

            maxWidth: '600px',

            margin: '0 auto'

          }}>

            Choose a DevOps tool to create and deploy professional configurations instantly

          </p>

        </div>



        {/* Tools Grid */}

        <div style={{ 

          display: 'grid', 

          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 

          gap: '2rem',

          marginBottom: '3rem'

        }}>

          {TOOLS.map(tool => (

            <button

              key={tool.name}

              onClick={() => navigate(tool.path)}

              style={{

                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',

                border: `3px solid ${tool.color}`,

                borderRadius: '12px',

                padding: '2.5rem 2rem',

                cursor: 'pointer',

                textAlign: 'left',

                transition: 'all 0.3s ease',

                position: 'relative',

                overflow: 'hidden',

                boxShadow: `0 4px 12px ${tool.color}40`

              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform = 'translateY(-8px)';

                e.currentTarget.style.boxShadow = `0 12px 24px ${tool.color}60`;

                e.currentTarget.style.background = `linear-gradient(135deg, #2a4a6f 0%, #3a5a8f 100%)`;

              }}

              onMouseLeave={(e) => {

                e.currentTarget.style.transform = 'translateY(0)';

                e.currentTarget.style.boxShadow = `0 4px 12px ${tool.color}40`;

                e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)';

              }}

            >

              {/* Background Gradient Effect */}

              <div style={{

                position: 'absolute',

                top: 0,

                right: 0,

                width: '150px',

                height: '150px',

                background: `radial-gradient(circle, ${tool.color}30 0%, transparent 70%)`,

                pointerEvents: 'none'

              }} />



              {/* Content */}

              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Icon */}

                <div style={{ 

                  fontSize: tool.iconSize, 

                  marginBottom: '1rem',

                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'

                }}>

                  {tool.icon}

                </div>



                {/* Tool Name */}

                <h3 style={{ 

                  margin: '0 0 0.75rem 0', 

                  fontSize: '1.8rem',

                  color: tool.color,

                  fontWeight: 'bold',

                  textShadow: `0 0 20px ${tool.color}80`

                }}>

                  {tool.name}

                </h3>



                {/* Description */}

                <p style={{ 

                  margin: 0, 

                  color: '#ddd',

                  fontSize: '0.95rem',

                  lineHeight: '1.5'

                }}>

                  {tool.description}

                </p>



                {/* Arrow Indicator */}

                <div style={{

                  marginTop: '1.5rem',

                  color: tool.color,

                  fontSize: '1.2rem',

                  fontWeight: 'bold',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '0.5rem'

                }}>

                  Start Generating

                  <span style={{ fontSize: '1.5rem' }}>→</span>

                </div>

              </div>

            </button>

          ))}

        </div>



        {/* Info Section */}

        <div style={{

          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',

          border: '2px solid #4ecca3',

          borderRadius: '12px',

          padding: '2rem',

          marginTop: '3rem'

        }}>

          <h3 style={{ 

            margin: '0 0 1rem 0', 

            color: '#4ecca3',

            fontSize: '1.3rem'

          }}>

            💡 Quick Tips

          </h3>

          <ul style={{ 

            margin: 0, 

            paddingLeft: '1.5rem',

            color: '#ddd',

            lineHeight: '2'

          }}>

            <li>Each tool provides templates and best practices for configuration files</li>

            <li>Generated files are production-ready and follow industry standards</li>

            <li>Customize the templates based on your specific requirements</li>

            <li>Files are automatically saved to <strong style={{ color: '#4ecca3' }}>~/Generator/[tool-name]/</strong> on your machine</li>

            <li>Click <strong style={{ color: '#e94560' }}>Deploy</strong> to create files and validate configurations</li>

          </ul>

        </div>

      </div>

    </div>

  );

}



export default FileGenerator;