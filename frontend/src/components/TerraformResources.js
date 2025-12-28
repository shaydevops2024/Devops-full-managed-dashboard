// frontend/src/components/TerraformResources.js
// COMPLETE COMPONENT - Copy-paste this entire file

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

function TerraformResources() {
  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destroying, setDestroying] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchResources = async () => {
    try {
      const response = await api.get('/deploy/terraform/resources');
      if (response.data.success) {
        setResources(response.data.resources || []);
        setGroupedResources(response.data.groupedResources || []);
      }
    } catch (error) {
      console.error('Error fetching terraform resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDestroy = async (resourceAddress) => {
    if (!window.confirm(`Are you sure you want to destroy ${resourceAddress}? This action cannot be undone!`)) {
      return;
    }

    setDestroying(resourceAddress);
    try {
      const response = await api.post('/deploy/terraform/destroy-resource', {
        resourceAddress
      });

      if (response.data.success) {
        toast.success(`Resource ${resourceAddress} destroyed successfully!`);
        fetchResources(); // Refresh the list
      } else {
        toast.error(`Failed to destroy ${resourceAddress}`);
      }
    } catch (error) {
      console.error('Error destroying resource:', error);
      toast.error(`Error destroying resource: ${error.message}`);
    } finally {
      setDestroying(null);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('terraform-resources-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('terraform-resources-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#16213e', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        border: '2px solid #2496ED',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#2496ED', margin: '0 0 1rem 0' }}>
          🏗️ Terraform Resources
        </h3>
        <p style={{ color: '#aaa' }}>Loading resources...</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div style={{ 
        background: '#16213e', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        border: '2px solid #2496ED',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#2496ED', margin: '0 0 1rem 0' }}>
          🏗️ Terraform Resources
        </h3>
        <p style={{ color: '#aaa' }}>
          No terraform resources found. Apply a terraform configuration to see resources here.
        </p>
      </div>
    );
  }

  const containerHeight = isExpanded ? 'auto' : '300px';

  return (
    <div style={{ 
      background: '#16213e', 
      borderRadius: '12px', 
      padding: '1.5rem', 
      border: '2px solid #2496ED',
      marginTop: '2rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: '#2496ED', margin: 0 }}>
          🏗️ Terraform Resources ({resources.length})
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleExpand}
            style={{
              background: '#0f3460',
              border: '1px solid #2496ED',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              color: '#2496ED',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a4d7a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0f3460'}
          >
            {isExpanded ? '⊟ Shrink' : '⛶ Expand'}
          </button>
        </div>
      </div>

      {/* Scroll Controls */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={scrollLeft}
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(36, 150, 237, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(36, 150, 237, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(36, 150, 237, 0.9)'}
        >
          ◀
        </button>

        {/* Resources Container */}
        <div
          id="terraform-resources-scroll"
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '1rem',
            maxHeight: containerHeight,
            scrollbarWidth: 'thin',
            scrollbarColor: '#2496ED #0f3460'
          }}
        >
          {groupedResources.map((group, groupIndex) => (
            <div key={groupIndex} style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
              {group.map((resource, index) => (
                <div
                  key={`${resource.type}-${resource.name}-${index}`}
                  style={{
                    background: '#0f3460',
                    border: `2px solid ${resource.status === 'active' ? '#4ecca3' : '#e94560'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    minWidth: '250px',
                    maxWidth: '250px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#4ecca3', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem'
                      }}>
                        {resource.type}
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        wordBreak: 'break-word'
                      }}>
                        {resource.name}
                      </div>
                    </div>
                    <div style={{
                      background: resource.status === 'active' ? '#4ecca3' : '#e94560',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {resource.status || 'active'}
                    </div>
                  </div>

                  {resource.id && (
                    <div style={{ 
                      color: '#aaa', 
                      fontSize: '0.75rem', 
                      marginBottom: '0.5rem',
                      wordBreak: 'break-all'
                    }}>
                      ID: {resource.id}
                    </div>
                  )}

                  {resource.dependencies && resource.dependencies.length > 0 && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #2496ED'
                    }}>
                      <div style={{ color: '#2496ED', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        Dependencies:
                      </div>
                      {resource.dependencies.map((dep, i) => (
                        <div key={i} style={{ color: '#aaa', fontSize: '0.7rem' }}>
                          • {dep}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleDestroy(`${resource.type}.${resource.name}`)}
                    disabled={destroying === `${resource.type}.${resource.name}`}
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      padding: '0.5rem',
                      background: destroying === `${resource.type}.${resource.name}` ? '#666' : '#e94560',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: destroying === `${resource.type}.${resource.name}` ? 'wait' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                    onMouseEnter={(e) => {
                      if (!destroying) e.currentTarget.style.background = '#d63447';
                    }}
                    onMouseLeave={(e) => {
                      if (!destroying) e.currentTarget.style.background = '#e94560';
                    }}
                  >
                    {destroying === `${resource.type}.${resource.name}` ? 'Destroying...' : '🗑️ Destroy'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={scrollRight}
          style={{
            position: 'absolute',
            right: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(36, 150, 237, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(36, 150, 237, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(36, 150, 237, 0.9)'}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default TerraformResources;