
// /home/claude/Devops-full-managed-dashboard-main/frontend/src/pages/FileExamples.js

import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { ArrowLeft } from 'lucide-react';



function FileExamples() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ background: '#16213e', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f3460' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          <button onClick={() => navigate('/dashboard')} style={{ background: '#0f3460', border: '2px solid #4ecca3', borderRadius: '6px', color: '#fff', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1a4d7a'; e.currentTarget.style.transform = 'translateX(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0f3460'; e.currentTarget.style.transform = 'translateX(0)'; }}>

            <ArrowLeft size={20} />Back to Dashboard

          </button>

          <div>

            <h1 style={{ margin: 0, color: '#4ecca3', fontSize: '1.5rem' }}>File Examples</h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>View example DevOps configuration files</p>

          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <span style={{ color: '#aaa' }}>Welcome, {user?.username}</span>

          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#e94560', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#c23653'} onMouseLeave={(e) => e.currentTarget.style.background = '#e94560'}>Logout</button>

        </div>

      </nav>

      <div style={{ padding: '4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>

        <div style={{ background: '#16213e', borderRadius: '12px', padding: '3rem', border: '2px solid #0f3460', textAlign: 'center', maxWidth: '600px' }}>

          <h2 style={{ color: '#4ecca3', marginBottom: '1rem', fontSize: '2rem' }}>Coming Soon!</h2>

          <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6' }}>This section will contain example configuration files for various DevOps tools. Stay tuned for updates!</p>

        </div>

      </div>

    </div>

  );

}

export default FileExamples;

