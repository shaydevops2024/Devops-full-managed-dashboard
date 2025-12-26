// frontend/src/components/Header.js
// Use this header on pages OTHER than Dashboard (FileGenerator, Tool Status, etc.)

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show Dashboard button on the dashboard page itself
  const showDashboardButton = location.pathname !== '/dashboard';

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #16213e 100%)',
      padding: '1rem 2rem',
      borderBottom: '2px solid #2496ED',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ 
          margin: 0, 
          color: '#2496ED', 
          fontSize: '1.8rem',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          DevOps Dashboard
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Dashboard Button - Only show if NOT on dashboard */}
        {showDashboardButton && (
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
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #e94560 0%, #c72c41 100%)',
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
            boxShadow: '0 4px 12px rgba(233, 69, 96, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(233, 69, 96, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 69, 96, 0.4)';
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;