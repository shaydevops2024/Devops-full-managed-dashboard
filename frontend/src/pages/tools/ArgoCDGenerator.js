// frontend/src/pages/tools/ArgoCDGenerator.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function ArgoCDGenerator() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    appName: 'my-application',
    namespace: 'argocd',
    repoUrl: 'https://github.com/user/repo',
    targetRevision: 'HEAD',
    path: 'k8s',
    destServer: 'https://kubernetes.default.svc',
    destNamespace: 'default'
  });

  const generateArgoCD = () => {
    return `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${formData.appName}
  namespace: ${formData.namespace}
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: ${formData.repoUrl}
    targetRevision: ${formData.targetRevision}
    path: ${formData.path}
  destination:
    server: ${formData.destServer}
    namespace: ${formData.destNamespace}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - Validate=true
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateArgoCD());
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateArgoCD()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application.yaml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ArgoCD application downloaded!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <nav style={{ 
        background: '#16213e', 
        padding: '1rem 2rem', 
        borderBottom: '2px solid #EF7B4D',
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
            color: '#EF7B4D',
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
          <span style={{ fontSize: '2rem' }}>🔄</span>
          <div>
            <h1 style={{ margin: 0, color: '#EF7B4D', fontSize: '1.5rem' }}>
              ArgoCD Application Generator
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
              Create GitOps application manifests
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
          border: '2px solid #EF7B4D40',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#EF7B4D',
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
                Application Name
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
                ArgoCD Namespace
              </label>
              <input
                type="text"
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
                Repository URL
              </label>
              <input
                type="text"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
                Target Revision (Branch/Tag)
              </label>
              <input
                type="text"
                value={formData.targetRevision}
                onChange={(e) => setFormData({ ...formData, targetRevision: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
                Path in Repository
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
                Destination Namespace
              </label>
              <input
                type="text"
                value={formData.destNamespace}
                onChange={(e) => setFormData({ ...formData, destNamespace: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '2px solid #EF7B4D40',
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
          border: '2px solid #EF7B4D40',
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
              color: '#EF7B4D',
              fontSize: '1.5rem'
            }}>
              Generated Application
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#EF7B4D',
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
            border: '2px solid #EF7B4D40',
            borderRadius: '8px',
            padding: '1.5rem',
            overflow: 'auto',
            fontFamily: "'Courier New', monospace",
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#4ecca3',
            margin: 0
          }}>
            {generateArgoCD()}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default ArgoCDGenerator;
