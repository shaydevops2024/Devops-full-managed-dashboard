// frontend/src/pages/tools/HelmGenerator.js

import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Download, Copy, Check } from 'lucide-react';

import toast from 'react-hot-toast';



function HelmGenerator() {

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({

    chartName: 'my-chart',

    appVersion: '1.0.0',

    description: 'A Helm chart for Kubernetes',

    replicaCount: '2',

    image: 'nginx',

    tag: 'latest'

  });



  const generateHelm = () => {

    return `apiVersion: v2

name: ${formData.chartName}

description: ${formData.description}

type: application

version: 0.1.0

appVersion: "${formData.appVersion}"

---

# values.yaml

replicaCount: ${formData.replicaCount}



image:

  repository: ${formData.image}

  pullPolicy: IfNotPresent

  tag: "${formData.tag}"



service:

  type: ClusterIP

  port: 80



ingress:

  enabled: false

  className: ""

  annotations: {}

  hosts:

    - host: chart-example.local

      paths:

        - path: /

          pathType: ImplementationSpecific



resources:

  limits:

    cpu: 100m

    memory: 128Mi

  requests:

    cpu: 100m

    memory: 128Mi



autoscaling:

  enabled: false

  minReplicas: 1

  maxReplicas: 100

  targetCPUUtilizationPercentage: 80`;

  };



  const handleCopy = () => {

    navigator.clipboard.writeText(generateHelm());

    setCopied(true);

    toast.success('Copied to clipboard!');

    setTimeout(() => setCopied(false), 2000);

  };



  const handleDownload = () => {

    const blob = new Blob([generateHelm()], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'Chart.yaml';

    a.click();

    URL.revokeObjectURL(url);

    toast.success('Helm chart downloaded!');

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        borderBottom: '2px solid #0F1689',

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

            color: '#0F1689',

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

          <span style={{ fontSize: '2rem' }}>⎈</span>

          <div>

            <h1 style={{ margin: 0, color: '#0F1689', fontSize: '1.5rem' }}>

              Helm Chart Generator

            </h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

              Create Helm charts for Kubernetes

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

          border: '2px solid #0F168940',

          borderRadius: '12px',

          padding: '2rem'

        }}>

          <h2 style={{ 

            margin: '0 0 1.5rem 0', 

            color: '#0F1689',

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

                Chart Name

              </label>

              <input

                type="text"

                value={formData.chartName}

                onChange={(e) => setFormData({ ...formData, chartName: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

                App Version

              </label>

              <input

                type="text"

                value={formData.appVersion}

                onChange={(e) => setFormData({ ...formData, appVersion: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

                Description

              </label>

              <input

                type="text"

                value={formData.description}

                onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

                Replica Count

              </label>

              <input

                type="number"

                value={formData.replicaCount}

                onChange={(e) => setFormData({ ...formData, replicaCount: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

                Image Repository

              </label>

              <input

                type="text"

                value={formData.image}

                onChange={(e) => setFormData({ ...formData, image: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

                Image Tag

              </label>

              <input

                type="text"

                value={formData.tag}

                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #0F168940',

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

          border: '2px solid #0F168940',

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

              color: '#0F1689',

              fontSize: '1.5rem'

            }}>

              Generated Chart

            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>

              <button

                onClick={handleCopy}

                style={{

                  padding: '0.5rem 1rem',

                  background: '#0F1689',

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

            border: '2px solid #0F168940',

            borderRadius: '8px',

            padding: '1.5rem',

            overflow: 'auto',

            fontFamily: "'Courier New', monospace",

            fontSize: '0.9rem',

            lineHeight: '1.6',

            color: '#4ecca3',

            margin: 0

          }}>

            {generateHelm()}

          </pre>

        </div>

      </div>

    </div>

  );

}



export default HelmGenerator;
