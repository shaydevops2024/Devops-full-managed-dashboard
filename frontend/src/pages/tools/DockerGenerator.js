// frontend/src/pages/tools/DockerGenerator.js

import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Download, Copy, Check } from 'lucide-react';

import toast from 'react-hot-toast';



function DockerGenerator() {

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({

    baseImage: 'node:18-alpine',

    workdir: '/app',

    port: '3000',

    installCommand: 'npm install',

    buildCommand: 'npm run build',

    startCommand: 'npm start'

  });



  const generateDockerfile = () => {

    return `FROM ${formData.baseImage}

WORKDIR ${formData.workdir}

COPY package*.json ./

RUN ${formData.installCommand}

COPY . .

RUN ${formData.buildCommand}

EXPOSE ${formData.port}

CMD ["${formData.startCommand}"]`;

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



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      {/* Header */}

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        borderBottom: '2px solid #2496ED',

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

              Create production-ready Dockerfiles

            </p>

          </div>

        </div>

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

          background: '#16213e',

          border: '2px solid #2496ED40',

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

            {/* Base Image */}

            <div>

              <label style={{ 

                display: 'block', 

                marginBottom: '0.5rem', 

                color: '#aaa',

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



            {/* Working Directory */}

            <div>

              <label style={{ 

                display: 'block', 

                marginBottom: '0.5rem', 

                color: '#aaa',

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



            {/* Port */}

            <div>

              <label style={{ 

                display: 'block', 

                marginBottom: '0.5rem', 

                color: '#aaa',

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



            {/* Install Command */}

            <div>

              <label style={{ 

                display: 'block', 

                marginBottom: '0.5rem', 

                color: '#aaa',

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



            {/* Build Command */}

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

                  border: '2px solid #2496ED40',

                  borderRadius: '6px',

                  color: '#fff',

                  fontSize: '1rem'

                }}

              />

            </div>



            {/* Start Command */}

            <div>

              <label style={{ 

                display: 'block', 

                marginBottom: '0.5rem', 

                color: '#aaa',

                fontSize: '0.9rem',

                fontWeight: 'bold'

              }}>

                Start Command

              </label>

              <input

                type="text"

                value={formData.startCommand}

                onChange={(e) => setFormData({ ...formData, startCommand: e.target.value })}

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

          </div>

        </div>



        {/* Preview */}

        <div style={{

          background: '#16213e',

          border: '2px solid #2496ED40',

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

              color: '#2496ED',

              fontSize: '1.5rem'

            }}>

              Generated Dockerfile

            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>

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

    </div>

  );

}



export default DockerGenerator;
