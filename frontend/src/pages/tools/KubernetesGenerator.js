// frontend/src/pages/tools/KubernetesGenerator.js

import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Download, Copy, Check } from 'lucide-react';

import toast from 'react-hot-toast';



function KubernetesGenerator() {

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({

    appName: 'my-app',

    namespace: 'default',

    replicas: '3',

    image: 'nginx:latest',

    containerPort: '80',

    servicePort: '80'

  });



  const generateK8s = () => {

    return `apiVersion: apps/v1

kind: Deployment

metadata:

  name: ${formData.appName}

  namespace: ${formData.namespace}

  labels:

    app: ${formData.appName}

spec:

  replicas: ${formData.replicas}

  selector:

    matchLabels:

      app: ${formData.appName}

  template:

    metadata:

      labels:

        app: ${formData.appName}

    spec:

      containers:

      - name: ${formData.appName}

        image: ${formData.image}

        ports:

        - containerPort: ${formData.containerPort}

        resources:

          requests:

            memory: "128Mi"

            cpu: "100m"

          limits:

            memory: "256Mi"

            cpu: "200m"

---

apiVersion: v1

kind: Service

metadata:

  name: ${formData.appName}-service

  namespace: ${formData.namespace}

spec:

  selector:

    app: ${formData.appName}

  ports:

  - protocol: TCP

    port: ${formData.servicePort}

    targetPort: ${formData.containerPort}

  type: LoadBalancer`;

  };



  const handleCopy = () => {

    navigator.clipboard.writeText(generateK8s());

    setCopied(true);

    toast.success('Copied to clipboard!');

    setTimeout(() => setCopied(false), 2000);

  };



  const handleDownload = () => {

    const blob = new Blob([generateK8s()], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'deployment.yaml';

    a.click();

    URL.revokeObjectURL(url);

    toast.success('Kubernetes manifest downloaded!');

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        borderBottom: '2px solid #326CE5',

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

            color: '#326CE5',

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

          <span style={{ fontSize: '2rem' }}>☸️</span>

          <div>

            <h1 style={{ margin: 0, color: '#326CE5', fontSize: '1.5rem' }}>

              Kubernetes Manifest Generator

            </h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

              Create deployments and services

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

          border: '2px solid #326CE540',

          borderRadius: '12px',

          padding: '2rem'

        }}>

          <h2 style={{ 

            margin: '0 0 1.5rem 0', 

            color: '#326CE5',

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

                  border: '2px solid #326CE540',

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

                Namespace

              </label>

              <input

                type="text"

                value={formData.namespace}

                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #326CE540',

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

                Replicas

              </label>

              <input

                type="number"

                value={formData.replicas}

                onChange={(e) => setFormData({ ...formData, replicas: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #326CE540',

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

                Container Image

              </label>

              <input

                type="text"

                value={formData.image}

                onChange={(e) => setFormData({ ...formData, image: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #326CE540',

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

                Container Port

              </label>

              <input

                type="text"

                value={formData.containerPort}

                onChange={(e) => setFormData({ ...formData, containerPort: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #326CE540',

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

                Service Port

              </label>

              <input

                type="text"

                value={formData.servicePort}

                onChange={(e) => setFormData({ ...formData, servicePort: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #326CE540',

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

          border: '2px solid #326CE540',

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

              color: '#326CE5',

              fontSize: '1.5rem'

            }}>

              Generated Manifest

            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>

              <button

                onClick={handleCopy}

                style={{

                  padding: '0.5rem 1rem',

                  background: '#326CE5',

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

            border: '2px solid #326CE540',

            borderRadius: '8px',

            padding: '1.5rem',

            overflow: 'auto',

            fontFamily: "'Courier New', monospace",

            fontSize: '0.9rem',

            lineHeight: '1.6',

            color: '#4ecca3',

            margin: 0

          }}>

            {generateK8s()}

          </pre>

        </div>

      </div>

    </div>

  );

}



export default KubernetesGenerator;
