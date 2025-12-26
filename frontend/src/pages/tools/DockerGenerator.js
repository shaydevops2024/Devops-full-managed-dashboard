// frontend/src/pages/tools/DockerGenerator.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check, Rocket, X, FolderOpen, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

function DockerGenerator() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showLogsPopup, setShowLogsPopup] = useState(false);
  const [deployLogs, setDeployLogs] = useState([]);
  const [deploySuccess, setDeploySuccess] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [deployMode, setDeployMode] = useState('deploy-and-run');
  const [containerName, setContainerName] = useState('');
  const [formData, setFormData] = useState({
    baseImage: 'node:18-alpine',
    workdir: '/app',
    port: '3010',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm', // Just 'npm', will add 'start' separately
    startArgs: 'start'    // The argument to npm
  });

  const generateDockerfile = () => {
    // Generate proper CMD array format
    const cmdParts = formData.startCommand.trim().split(/\s+/);
    if (formData.startArgs) {
      cmdParts.push(...formData.startArgs.trim().split(/\s+/));
    }
    const cmdString = cmdParts.map(part => `"${part}"`).join(', ');
    
    return `FROM ${formData.baseImage}
WORKDIR ${formData.workdir}
COPY package*.json ./
RUN ${formData.installCommand}
COPY . .
RUN ${formData.buildCommand}
EXPOSE ${formData.port}
CMD [${cmdString}]`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDockerfile());
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateDockerfile()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dockerfile downloaded!');
  };

  const handleCopyPath = () => {
    if (filePath) {
      const fullPath = filePath.replace('~', '/home/user');
      navigator.clipboard.writeText(fullPath);
      setPathCopied(true);
      toast.success('Path copied to clipboard!');
      setTimeout(() => setPathCopied(false), 2000);
    }
  };

  const handleDeploy = async () => {
    // Validate container name if deploy-and-run
    if (deployMode === 'deploy-and-run' && !containerName.trim()) {
      toast.error('Please enter a container name!');
      return;
    }

    // Validate container name format
    if (deployMode === 'deploy-and-run') {
      const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
      if (!nameRegex.test(containerName)) {
        toast.error('Container name can only contain letters, numbers, underscores, periods, and hyphens!');
        return;
      }
    }

    setDeploying(true);
    setShowLogsPopup(true);
    setDeployLogs([]);
    setDeploySuccess(null);
    setFilePath('');

    try {
      const payload = {
        content: generateDockerfile(),
        mode: deployMode,
        containerName: containerName.trim() || `generated-app-${Date.now()}`,
        port: formData.port
      };

      const response = await api.post('/deploy/docker', payload);

      setDeployLogs(response.data.logs || []);
      setDeploySuccess(response.data.success);
      setFilePath(response.data.filePath || '');

      if (response.data.success) {
        if (deployMode === 'deploy-and-run') {
          toast.success(`Container "${containerName}" deployed and running!`);
        } else {
          toast.success('Dockerfile deployed successfully!');
        }
      } else {
        toast.error('Deployment failed. Check logs for details.');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setDeployLogs([
        { type: 'stderr', message: `Error: ${error.response?.data?.error || error.message}\n`, timestamp: new Date() }
      ]);
      setDeploySuccess(false);
      toast.error('Deployment failed!');
    } finally {
      setDeploying(false);
    }
  };

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
            onClick={() => navigate('/files')}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🐳</span>
            <div>
              <h1 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem' }}>
                Docker File Generator
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
                Create and deploy production-ready Dockerfiles
              </p>
            </div>
          </div>
        </div>
        
        {/* Dashboard Button - FIXED POSITION */}
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
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        {/* Configuration Form */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',
          border: '2px solid #2496ED',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#2496ED',
            fontSize: '1.5rem'
          }}>
            Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Base Image
              </label>
              <input
                type="text"
                value={formData.baseImage}
                onChange={(e) => setFormData({ ...formData, baseImage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #2496ED40',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Working Directory
              </label>
              <input
                type="text"
                value={formData.workdir}
                onChange={(e) => setFormData({ ...formData, workdir: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #2496ED40',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Exposed Port
              </label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #2496ED40',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Install Command
              </label>
              <input
                type="text"
                value={formData.installCommand}
                onChange={(e) => setFormData({ ...formData, installCommand: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #2496ED40',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Build Command
              </label>
              <input
                type="text"
                value={formData.buildCommand}
                onChange={(e) => setFormData({ ...formData, buildCommand: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #2496ED40',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ddd',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Start Command
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={formData.startCommand}
                  onChange={(e) => setFormData({ ...formData, startCommand: e.target.value })}
                  placeholder="npm"
                  style={{
                    padding: '0.75rem',
                    background: '#0f3460',
                    border: '2px solid #2496ED40',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="text"
                  value={formData.startArgs}
                  onChange={(e) => setFormData({ ...formData, startArgs: e.target.value })}
                  placeholder="start"
                  style={{
                    padding: '0.75rem',
                    background: '#0f3460',
                    border: '2px solid #2496ED40',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                Command and arguments (e.g., "npm" + "start" → CMD ["npm", "start"])
              </small>
            </div>

            {/* Deployment Mode Selection */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#0f3460',
              borderRadius: '8px',
              border: '2px solid #2496ED40'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '1rem', 
                color: '#2496ED',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                Deployment Mode
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  background: deployMode === 'deploy' ? '#2496ED20' : 'transparent',
                  borderRadius: '6px',
                  border: deployMode === 'deploy' ? '2px solid #2496ED' : '2px solid transparent'
                }}>
                  <input
                    type="radio"
                    name="deployMode"
                    value="deploy"
                    checked={deployMode === 'deploy'}
                    onChange={(e) => setDeployMode(e.target.value)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>Deploy Only</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      Save Dockerfile and validate syntax
                    </div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  background: deployMode === 'deploy-and-run' ? '#2496ED20' : 'transparent',
                  borderRadius: '6px',
                  border: deployMode === 'deploy-and-run' ? '2px solid #2496ED' : '2px solid transparent'
                }}>
                  <input
                    type="radio"
                    name="deployMode"
                    value="deploy-and-run"
                    checked={deployMode === 'deploy-and-run'}
                    onChange={(e) => setDeployMode(e.target.value)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>Deploy & Run</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      Build image and start container (visible on dashboard)
                    </div>
                  </div>
                </label>
              </div>

              {/* Container Name Input - Only show for Deploy & Run */}
              {deployMode === 'deploy-and-run' && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#ddd',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Container Name *
                  </label>
                  <input
                    type="text"
                    value={containerName}
                    onChange={(e) => setContainerName(e.target.value)}
                    placeholder="my-app (letters, numbers, _, ., -)"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#1a4d7a',
                      border: '2px solid #2496ED',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                  <small style={{ color: '#4ecca3', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    This will be your container's name on the dashboard
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',
          border: '2px solid #2496ED',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#2496ED',
              fontSize: '1.5rem'
            }}>
              Generated Dockerfile
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2496ED',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#4ecca3',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                style={{
                  padding: '0.5rem 1rem',
                  background: deploying ? '#666' : '#e94560',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: deploying ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                <Rocket size={16} />
                {deploying ? 'Deploying...' : deployMode === 'deploy-and-run' ? 'Deploy & Run' : 'Deploy'}
              </button>
            </div>
          </div>

          <pre style={{
            flex: 1,
            background: '#0f0f0f',
            border: '2px solid #2496ED40',
            borderRadius: '8px',
            padding: '1.5rem',
            overflow: 'auto',
            fontFamily: "'Courier New', monospace",
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#4ecca3',
            margin: 0
          }}>
            {generateDockerfile()}
          </pre>
        </div>
      </div>

      {/* Deployment Logs Popup */}
      {showLogsPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: '#16213e',
            border: '3px solid #2496ED',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Popup Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '2px solid #2496ED',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Rocket size={24} />
                  Deployment Logs
                </h3>
                {filePath && (
                  <div style={{ 
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#4ecca3' }}>
                      📂 {filePath}
                    </span>
                    <button
                      onClick={handleCopyPath}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: pathCopied ? '#4ecca3' : '#2496ED',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {pathCopied ? <Check size={12} /> : <FolderOpen size={12} />}
                      {pathCopied ? 'Copied!' : 'Copy Path'}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowLogsPopup(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e9456040'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Logs Content */}
            <div style={{
              flex: 1,
              padding: '1.5rem',
              overflow: 'auto',
              background: '#0a0a0a',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.9rem'
            }}>
              {deployLogs.length === 0 && deploying && (
                <div style={{ color: '#4ecca3' }}>
                  ⚙️ Initializing deployment...
                </div>
              )}
              {deployLogs.map((log, index) => (
                <div 
                  key={index}
                  style={{ 
                    color: log.type === 'stderr' ? '#e74c3c' : '#4ecca3',
                    marginBottom: '0.25rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6'
                  }}
                >
                  {log.message}
                </div>
              ))}
            </div>

            {/* Footer */}
            {!deploying && deploySuccess !== null && (
              <div style={{
                padding: '1.5rem',
                borderTop: '2px solid #2496ED',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)'
              }}>
                <div style={{
                  color: deploySuccess ? '#4ecca3' : '#e74c3c',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <span>
                    {deploySuccess ? '✓ Deployment Successful!' : '✗ Deployment Failed'}
                  </span>
                  {deploySuccess && deployMode === 'deploy-and-run' && containerName && (
                    <span style={{ fontSize: '0.9rem', color: '#2496ED' }}>
                      Container "{containerName}" is running on dashboard
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowLogsPopup(false);
                    if (deploySuccess && deployMode === 'deploy-and-run') {
                      // Navigate to dashboard after successful deployment
                      setTimeout(() => navigate('/dashboard'), 500);
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: deploySuccess && deployMode === 'deploy-and-run' ? '#4ecca3' : '#2496ED',
                    border: 'none',
                    borderRadius: '6px',
                    color: deploySuccess && deployMode === 'deploy-and-run' ? '#1a1a2e' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {deploySuccess && deployMode === 'deploy-and-run' ? 'Go to Dashboard' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DockerGenerator;