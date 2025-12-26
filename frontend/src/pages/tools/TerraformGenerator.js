// frontend/src/pages/tools/TerraformGenerator.js

import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Download, Copy, Check } from 'lucide-react';

import toast from 'react-hot-toast';



function TerraformGenerator() {

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({

    provider: 'aws',

    region: 'us-east-1',

    resourceName: 'my_instance',

    instanceType: 't2.micro',

    ami: 'ami-0c55b159cbfafe1f0'

  });



  const generateTerraform = () => {

    return `terraform {

  required_providers {

    ${formData.provider} = {

      source  = "hashicorp/${formData.provider}"

      version = "~> 5.0"

    }

  }

}



provider "${formData.provider}" {

  region = "${formData.region}"

}



resource "${formData.provider}_instance" "${formData.resourceName}" {

  ami           = "${formData.ami}"

  instance_type = "${formData.instanceType}"



  tags = {

    Name = "${formData.resourceName}"

    Environment = "production"

  }

}



output "instance_id" {

  value = ${formData.provider}_instance.${formData.resourceName}.id

}



output "public_ip" {

  value = ${formData.provider}_instance.${formData.resourceName}.public_ip

}`;

  };



  const handleCopy = () => {

    navigator.clipboard.writeText(generateTerraform());

    setCopied(true);

    toast.success('Copied to clipboard!');

    setTimeout(() => setCopied(false), 2000);

  };



  const handleDownload = () => {

    const blob = new Blob([generateTerraform()], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'main.tf';

    a.click();

    URL.revokeObjectURL(url);

    toast.success('Terraform file downloaded!');

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        borderBottom: '2px solid #7B42BC',

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

            color: '#7B42BC',

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

          <span style={{ fontSize: '2rem' }}>🏗️</span>

          <div>

            <h1 style={{ margin: 0, color: '#7B42BC', fontSize: '1.5rem' }}>

              Terraform File Generator

            </h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

              Create infrastructure as code

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

          border: '2px solid #7B42BC40',

          borderRadius: '12px',

          padding: '2rem'

        }}>

          <h2 style={{ 

            margin: '0 0 1.5rem 0', 

            color: '#7B42BC',

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

                Cloud Provider

              </label>

              <select

                value={formData.provider}

                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #7B42BC40',

                  borderRadius: '6px',

                  color: '#fff',

                  fontSize: '1rem'

                }}

              >

                <option value="aws">AWS</option>

                <option value="azure">Azure</option>

                <option value="gcp">Google Cloud</option>

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

                Region

              </label>

              <input

                type="text"

                value={formData.region}

                onChange={(e) => setFormData({ ...formData, region: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #7B42BC40',

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

                Resource Name

              </label>

              <input

                type="text"

                value={formData.resourceName}

                onChange={(e) => setFormData({ ...formData, resourceName: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #7B42BC40',

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

                Instance Type

              </label>

              <input

                type="text"

                value={formData.instanceType}

                onChange={(e) => setFormData({ ...formData, instanceType: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #7B42BC40',

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

                AMI / Image ID

              </label>

              <input

                type="text"

                value={formData.ami}

                onChange={(e) => setFormData({ ...formData, ami: e.target.value })}

                style={{

                  width: '100%',

                  padding: '0.75rem',

                  background: '#0f3460',

                  border: '2px solid #7B42BC40',

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

          border: '2px solid #7B42BC40',

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

              color: '#7B42BC',

              fontSize: '1.5rem'

            }}>

              Generated Configuration

            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>

              <button

                onClick={handleCopy}

                style={{

                  padding: '0.5rem 1rem',

                  background: '#7B42BC',

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

            border: '2px solid #7B42BC40',

            borderRadius: '8px',

            padding: '1.5rem',

            overflow: 'auto',

            fontFamily: "'Courier New', monospace",

            fontSize: '0.9rem',

            lineHeight: '1.6',

            color: '#4ecca3',

            margin: 0

          }}>

            {generateTerraform()}

          </pre>

        </div>

      </div>

    </div>

  );

}



export default TerraformGenerator;
