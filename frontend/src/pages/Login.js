
// /home/claude/devops-dashboard/frontend/src/pages/Login.js

import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

import { useNavigate, Link } from 'react-router-dom';

import toast from 'react-hot-toast';



function Login() {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      await login({ email, password });

      toast.success('Login successful!');

      navigate('/');

    } catch (error) {

      toast.error(error.response?.data?.error || 'Login failed');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>

      <div style={{ background: '#16213e', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>

        <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>DevOps Platform</h2>

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '1rem' }}>

            <label style={{ color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>Email</label>

            <input

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f3460', color: '#fff' }}

            />

          </div>

          <div style={{ marginBottom: '1.5rem' }}>

            <label style={{ color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>Password</label>

            <input

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f3460', color: '#fff' }}

            />

          </div>

          <button

            type="submit"

            disabled={loading}

            style={{ width: '100%', padding: '0.75rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}

          >

            {loading ? 'Logging in...' : 'Login'}

          </button>

        </form>

        <p style={{ color: '#aaa', marginTop: '1rem', textAlign: 'center' }}>

          Don't have an account? <Link to="/register" style={{ color: '#e94560' }}>Register</Link>

        </p>

      </div>

    </div>

  );

}



export default Login;

