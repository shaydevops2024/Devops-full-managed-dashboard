// frontend/src/pages/tools/JenkinsGenerator.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function JenkinsGenerator() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    pipelineName: 'my-pipeline',
    agent: 'any',
    gitRepo: 'https://github.com/user/repo.git',
    branch: 'main',
    buildTool: 'npm',
    testCommand: 'npm test',
    buildCommand: 'npm run build'
  });

  const generateJenkinsfile = () => {
    return `pipeline {
    agent ${formData.agent === 'any' ? 'any' : `{ label '${formData.agent}' }`}
    
    environment {
        PROJECT_NAME = '${formData.pipelineName}'
        BUILD_TIMESTAMP = sh(returnStdout: true, script: 'date +%Y%m%d-%H%M%S').trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: '${formData.branch}',
                    url: '${formData.gitRepo}'
                echo "Checked out branch: ${formData.branch}"
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '${formData.buildTool} install'
                echo 'Dependencies installed successfully'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh '${formData.testCommand}'
                echo 'Tests completed successfully'
            }
        }
        
        stage('Build') {
            steps {
                sh '${formData.buildCommand}'
                echo 'Build completed successfully'
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/build/**/*', 
                                 allowEmptyArchive: true,
                                 fingerprint: true
                echo 'Artifacts archived'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            // Add notification steps here
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification steps here
        }
        always {
            cleanWs()
            echo 'Workspace cleaned'
        }
    }
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateJenkinsfile());
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateJenkinsfile()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jenkinsfile';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Jenkinsfile downloaded!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <nav style={{ 
        background: '#16213e', 
        padding: '1rem 2rem', 
        borderBottom: '2px solid #D24939',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => navigate('/files')}
          style={{
            background: '#0f3460',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem',
            color: '#D24939',
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
          <span style={{ fontSize: '2rem' }}>👷</span>
          <div>
            <h1 style={{ margin: 0, color: '#D24939', fontSize: '1.5rem' }}>
              Jenkins Pipeline Generator
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
              Create CI/CD pipeline configurations
            </p>
          </div>
        </div>
      </nav>

      <div style={{ 
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        <div style={{
          background: '#16213e',
          border: '2px solid #D2493940',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#D24939',
            fontSize: '1.5rem'
          }}>
            Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Pipeline Name
              </label>
              <input
                type="text"
                value={formData.pipelineName}
                onChange={(e) => setFormData({ ...formData, pipelineName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
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
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Agent
              </label>
              <input
                type="text"
                value={formData.agent}
                onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                placeholder="any, docker, specific-label"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Git Repository URL
              </label>
              <input
                type="text"
                value={formData.gitRepo}
                onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
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
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
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
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Build Tool
              </label>
              <select
                value={formData.buildTool}
                onChange={(e) => setFormData({ ...formData, buildTool: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              >
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="maven">mvn</option>
                <option value="gradle">gradle</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#aaa',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Test Command
              </label>
              <input
                type="text"
                value={formData.testCommand}
                onChange={(e) => setFormData({ ...formData, testCommand: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #D2493940',
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
                color: '#aaa',
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
                  border: '2px solid #D2493940',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          background: '#16213e',
          border: '2px solid #D2493940',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#D24939',
              fontSize: '1.5rem'
            }}>
              Generated Jenkinsfile
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#D24939',
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
            </div>
          </div>

          <pre style={{
            flex: 1,
            background: '#0f0f0f',
            border: '2px solid #D2493940',
            borderRadius: '8px',
            padding: '1.5rem',
            overflow: 'auto',
            fontFamily: "'Courier New', monospace",
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#4ecca3',
            margin: 0
          }}>
            {generateJenkinsfile()}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default JenkinsGenerator;
