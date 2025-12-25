
// /home/claude/devops-dashboard/frontend/src/pages/Register.js

import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

import { useNavigate, Link } from 'react-router-dom';

import toast from 'react-hot-toast';



function Register() {

  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const navigate = useNavigate();



  const handleChange = (e) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      await register(formData);

      toast.success('Registration successful!');

      navigate('/');

    } catch (error) {

      toast.error(error.response?.data?.error || 'Registration failed');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>

      <div style={{ background: '#16213e', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>

        <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '1rem' }}>

            <label style={{ color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>Username</label>

            <input

              type="text"

              name="username"

              value={formData.username}

              onChange={handleChange}

              required

              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f3460', color: '#fff' }}

            />

          </div>

          <div style={{ marginBottom: '1rem' }}>

            <label style={{ color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>Email</label>

            <input

              type="email"

              name="email"

              value={formData.email}

              onChange={handleChange}

              required

              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f3460', color: '#fff' }}

            />

          </div>

          <div style={{ marginBottom: '1.5rem' }}>

            <label style={{ color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>Password</label>

            <input

              type="password"

              name="password"

              value={formData.password}

              onChange={handleChange}

              required

              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f3460', color: '#fff' }}

            />

          </div>

          <button

            type="submit"

            disabled={loading}

            style={{ width: '100%', padding: '0.75rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}

          >

            {loading ? 'Registering...' : 'Register'}

          </button>

        </form>

        <p style={{ color: '#aaa', marginTop: '1rem', textAlign: 'center' }}>

          Already have an account? <Link to="/login" style={{ color: '#e94560' }}>Login</Link>

        </p>

      </div>

    </div>

  );

}



export default Register;

