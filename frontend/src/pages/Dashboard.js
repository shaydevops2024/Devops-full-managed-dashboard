
// frontend/src/pages/Dashboard.js



import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { dockerAPI, toolsAPI, getLogsUrl } from '../services/api';

import { 

  Play, 

  Square, 

  FileText, 

  RefreshCw, 

  CheckCircle, 

  XCircle, 

  AlertCircle, 

  FileCode, 

  X, 

  Upload, 

  BookOpen,

  Maximize2,

  Minimize2,

  ChevronLeft,

  ChevronRight

} from 'lucide-react';

import toast from 'react-hot-toast';



const TOOLS = [

  { name: 'docker', displayName: 'Docker', docs: 'https://docs.docker.com/get-docker/' },

  { name: 'terraform', displayName: 'Terraform', docs: 'https://learn.hashicorp.com/tutorials/terraform/install-cli' },

  { name: 'kubectl', displayName: 'Kubernetes', docs: 'https://kubernetes.io/docs/tasks/tools/' },

  { name: 'helm', displayName: 'Helm', docs: 'https://helm.sh/docs/intro/install/' },

  { name: 'argocd', displayName: 'ArgoCD', docs: 'https://argo-cd.readthedocs.io/en/stable/getting_started/' },

  { name: 'jenkins', displayName: 'Jenkins', docs: 'https://www.jenkins.io/doc/book/installing/' },

];



// Unified color for all tools

const TOOL_COLOR = '#4ecca3';



function Dashboard() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [containers, setContainers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [toolsStatus, setToolsStatus] = useState({});

  const [checkingTools, setCheckingTools] = useState({});

  const [refreshing, setRefreshing] = useState(false);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [actionInProgress, setActionInProgress] = useState({});

  const [hoveredDelete, setHoveredDelete] = useState(null);

  const [deletingContainer, setDeletingContainer] = useState(null);

  const [expandedTool, setExpandedTool] = useState(null);



  useEffect(() => {

    loadContainers();

    const interval = setInterval(() => {

      loadContainers();

    }, 5000);

    return () => clearInterval(interval);

  }, []);



  const loadContainers = async () => {

    try {

      const response = await dockerAPI.getContainers();

      setContainers(response.data.containers || []);

      setLastRefresh(new Date());

    } catch (error) {

      console.error('Error loading containers:', error);

      toast.error('Failed to load containers');

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };



  const handleRefresh = () => {

    setRefreshing(true);

    loadContainers();

  };



  const handleStart = async (container) => {

    setActionInProgress(prev => ({ ...prev, [container.id]: 'starting' }));

    

    try {

      await dockerAPI.startContainer(container.id);

      toast.success(`Started ${container.name}`);

      

      setTimeout(() => {

        loadContainers();

        setActionInProgress(prev => {

          const newState = { ...prev };

          delete newState[container.id];

          return newState;

        });

      }, 1500);

    } catch (error) {

      toast.error(`Failed to start ${container.name}: ${error.response?.data?.error || error.message}`);

      setActionInProgress(prev => {

        const newState = { ...prev };

        delete newState[container.id];

        return newState;

      });

    }

  };



  const handleStop = async (container) => {

    setActionInProgress(prev => ({ ...prev, [container.id]: 'stopping' }));

    

    try {

      await dockerAPI.stopContainer(container.id);

      toast.success(`Stopped ${container.name}`);

      

      setTimeout(() => {

        loadContainers();

        setActionInProgress(prev => {

          const newState = { ...prev };

          delete newState[container.id];

          return newState;

        });

      }, 1500);

    } catch (error) {

      toast.error(`Failed to stop ${container.name}: ${error.response?.data?.error || error.message}`);

      setActionInProgress(prev => {

        const newState = { ...prev };

        delete newState[container.id];

        return newState;

      });

    }

  };



  const handleDelete = async (container) => {

    if (container.isRunning) {

      toast.error('Please stop the container first!', {

        icon: '⚠️',

        duration: 3000

      });

      return;

    }



    if (!window.confirm(`Are you sure you want to delete container "${container.name}"?\n\nThis action cannot be undone.`)) {

      return;

    }



    setDeletingContainer(container.id);

    

    try {

      await dockerAPI.deleteContainer(container.id);

      toast.success(`Container "${container.name}" deleted successfully!`);

      loadContainers();

    } catch (error) {

      toast.error(`Failed to delete container: ${error.response?.data?.error || error.message}`);

    } finally {

      setDeletingContainer(null);

    }

  };



  const handleLogs = (container) => {

    const token = localStorage.getItem('token');

    const logsUrl = getLogsUrl(container.id);

    const logsWindow = window.open('', '_blank', 'width=1000,height=600');

    

    logsWindow.document.write(`

      <!DOCTYPE html>

      <html>

        <head>

          <title>Logs - ${container.name}</title>

          <style>

            body {

              margin: 0;

              padding: 20px;

              background: #1a1a2e;

              color: #0f0;

              font-family: 'Courier New', monospace;

              font-size: 12px;

            }

            #logs {

              white-space: pre-wrap;

              word-wrap: break-word;

            }

            .header {

              position: sticky;

              top: 0;

              background: #16213e;

              padding: 10px;

              border-bottom: 2px solid #0f0;

              margin-bottom: 10px;

            }

            .header h2 {

              margin: 0;

              color: #0f0;

            }

          </style>

        </head>

        <body>

          <div class="header">

            <h2>Container Logs: ${container.name}</h2>

            <p>Container ID: ${container.shortId}</p>

          </div>

          <div id="logs">Loading logs...</div>

          <script>

            const logsDiv = document.getElementById('logs');

            logsDiv.textContent = '';

            

            fetch('${logsUrl}', {

              headers: {

                'Authorization': 'Bearer ${token}'

              }

            })

            .then(response => {

              const reader = response.body.getReader();

              const decoder = new TextDecoder();

              

              function read() {

                reader.read().then(({ done, value }) => {

                  if (done) {

                    logsDiv.textContent += '\\n\\n[Stream ended]';

                    return;

                  }

                  logsDiv.textContent += decoder.decode(value, { stream: true });

                  logsDiv.scrollTop = logsDiv.scrollHeight;

                  read();

                });

              }

              

              read();

            })

            .catch(error => {

              logsDiv.textContent = 'Error loading logs: ' + error.message;

            });

          </script>

        </body>

      </html>

    `);

  };



  const checkTool = async (toolName) => {

    setCheckingTools(prev => ({ ...prev, [toolName]: true }));

    const toolInfo = TOOLS.find(t => t.name === toolName);

    

    try {

      const response = await toolsAPI.check(toolName);

      setToolsStatus(prev => ({

        ...prev,

        [toolName]: response.data.installed

      }));

      

      if (!response.data.installed) {

        toast.error(

          <div>

            <strong>{toolInfo.displayName} is not installed</strong>

            <br />

            <a 

              href={toolInfo.docs} 

              target="_blank" 

              rel="noopener noreferrer"

              style={{ color: '#4ecca3', textDecoration: 'underline' }}

            >

              View installation guide →

            </a>

          </div>,

          { duration: 5000 }

        );

      } else {

        const versionText = response.data.version ? ` (${response.data.version})` : '';

        toast.success(`${toolInfo.displayName} is installed${versionText}`);

      }

    } catch (error) {

      console.error(`Error checking ${toolName}:`, error);

      setToolsStatus(prev => ({ ...prev, [toolName]: false }));

      toast.error(`Failed to check ${toolInfo.displayName}`);

    } finally {

      setCheckingTools(prev => ({ ...prev, [toolName]: false }));

    }

  };



  const formatTime = (date) => {

    return date.toLocaleTimeString('en-US', { hour12: false });

  };



  const toggleExpand = (toolName) => {

    setExpandedTool(expandedTool === toolName ? null : toolName);

  };



  const scrollToolRow = (toolName, direction) => {

    const scrollContainer = document.getElementById(`scroll-${toolName}`);

    if (scrollContainer) {

      const scrollAmount = 400;

      scrollContainer.scrollBy({

        left: direction === 'left' ? -scrollAmount : scrollAmount,

        behavior: 'smooth'

      });

    }

  };



  const getToolContainers = (toolName) => {

    if (toolName === 'docker') {

      return containers;

    }

    return [];

  };



  const renderContainerCard = (container, isExpanded) => {

    const isActionInProgress = actionInProgress[container.id];

    const isStarting = isActionInProgress === 'starting';

    const isStopping = isActionInProgress === 'stopping';

    const isDeleting = deletingContainer === container.id;

    const isHovered = hoveredDelete === container.id;



    return (

      <div 

        key={container.id}

        style={{ 

          background: '#16213e', 

          padding: '1.5rem', 

          borderRadius: '8px',

          border: `2px solid ${container.isRunning ? '#4ecca3' : '#666'}`,

          transition: 'transform 0.2s, box-shadow 0.2s',

          minWidth: isExpanded ? 'auto' : '350px',

          maxWidth: isExpanded ? 'auto' : '350px',

          position: 'relative',

          flexShrink: 0

        }}

        onMouseEnter={(e) => {

          e.currentTarget.style.transform = 'translateY(-4px)';

          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';

        }}

        onMouseLeave={(e) => {

          e.currentTarget.style.transform = 'translateY(0)';

          e.currentTarget.style.boxShadow = 'none';

        }}

      >

        <button

          onClick={() => handleDelete(container)}

          onMouseEnter={() => setHoveredDelete(container.id)}

          onMouseLeave={() => setHoveredDelete(null)}

          disabled={isDeleting}

          style={{

            position: 'absolute',

            top: '0.75rem',

            right: '0.75rem',

            background: container.isRunning ? '#666' : '#e94560',

            border: 'none',

            borderRadius: '6px',

            width: '32px',

            height: '32px',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            cursor: container.isRunning ? 'not-allowed' : (isDeleting ? 'wait' : 'pointer'),

            opacity: isDeleting ? 0.5 : 1,

            transition: 'all 0.2s ease',

            boxShadow: container.isRunning ? 'none' : '0 2px 8px rgba(233, 69, 96, 0.4)',

            zIndex: 10

          }}

          title={container.isRunning ? 'Stop container first to delete' : 'Delete container'}

        >

          <X size={18} color="#fff" />

        </button>



        {container.isRunning && isHovered && (

          <div style={{

            position: 'absolute',

            top: '3rem',

            right: '0.75rem',

            background: '#16213e',

            border: '2px solid #ffa726',

            borderRadius: '6px',

            padding: '0.5rem 0.75rem',

            color: '#ffa726',

            fontSize: '0.85rem',

            whiteSpace: 'nowrap',

            zIndex: 11,

            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',

            display: 'flex',

            alignItems: 'center',

            gap: '0.5rem'

          }}>

            <AlertCircle size={16} />

            Stop container first!

          </div>

        )}



        <div style={{ marginBottom: '1rem', paddingRight: '2.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>

            <div style={{

              width: '12px',

              height: '12px',

              borderRadius: '50%',

              background: container.isRunning ? '#4ecca3' : '#e74c3c',

              flexShrink: 0

            }} />

            <h3 style={{ 

              margin: 0, 

              fontSize: '1.1rem',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap'

            }}>{container.name}</h3>

          </div>

          <p style={{ 

            margin: '0.25rem 0', 

            fontSize: '0.85rem', 

            color: '#aaa',

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap'

          }}>

            ID: {container.shortId}

          </p>

          <p style={{ 

            margin: '0.25rem 0', 

            fontSize: '0.85rem', 

            color: '#aaa',

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap',

            wordBreak: 'break-all'

          }} title={container.image}>

            Image: {container.image}

          </p>

          <p style={{ 

            margin: '0.25rem 0', 

            fontSize: '0.85rem', 

            color: container.isRunning ? '#4ecca3' : '#e74c3c',

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap'

          }}>

            Status: {container.status}

          </p>

        </div>



        <div style={{ display: 'flex', gap: '0.5rem' }}>

          <button

            onClick={() => handleStart(container)}

            disabled={container.isRunning || isActionInProgress}

            style={{

              flex: 1,

              padding: '0.75rem',

              background: (container.isRunning || isActionInProgress) ? '#333' : '#4ecca3',

              border: 'none',

              borderRadius: '4px',

              color: (container.isRunning || isActionInProgress) ? '#666' : '#1a1a2e',

              cursor: (container.isRunning || isActionInProgress) ? 'not-allowed' : 'pointer',

              fontWeight: 'bold',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem'

            }}

          >

            {isStarting ? (

              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />

            ) : (

              <Play size={16} />

            )}

            {isStarting ? 'Starting...' : 'Start'}

          </button>

          

          <button

            onClick={() => handleStop(container)}

            disabled={!container.isRunning || isActionInProgress}

            style={{

              flex: 1,

              padding: '0.75rem',

              background: (!container.isRunning || isActionInProgress) ? '#333' : '#e94560',

              border: 'none',

              borderRadius: '4px',

              color: (!container.isRunning || isActionInProgress) ? '#666' : '#fff',

              cursor: (!container.isRunning || isActionInProgress) ? 'not-allowed' : 'pointer',

              fontWeight: 'bold',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem'

            }}

          >

            {isStopping ? (

              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />

            ) : (

              <Square size={16} />

            )}

            {isStopping ? 'Stopping...' : 'Stop'}

          </button>

          

          <button

            onClick={() => handleLogs(container)}

            style={{

              flex: 1,

              padding: '0.75rem',

              background: '#6c5ce7',

              border: 'none',

              borderRadius: '4px',

              color: '#fff',

              cursor: 'pointer',

              fontWeight: 'bold',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem'

            }}

          >

            <FileText size={16} />

            Logs

          </button>

        </div>

      </div>

    );

  };



  const renderToolRow = (tool) => {

    const toolContainers = getToolContainers(tool.name);

    const isExpanded = expandedTool === tool.name;

    const hasContainers = toolContainers.length > 0;



    return (

      <div key={tool.name} style={{ marginBottom: '2rem' }}>

        <div style={{ 

          display: 'flex', 

          justifyContent: 'space-between', 

          alignItems: 'center', 

          marginBottom: '1rem',

          background: '#16213e',

          padding: '1rem 1.5rem',

          borderRadius: '8px',

          border: `2px solid ${TOOL_COLOR}`

        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

            <div style={{

              width: '8px',

              height: '8px',

              borderRadius: '50%',

              background: TOOL_COLOR

            }} />

            <h2 style={{ margin: 0, color: TOOL_COLOR }}>

              {tool.displayName} ({toolContainers.length})

            </h2>

          </div>

          

          <div style={{ display: 'flex', gap: '0.5rem' }}>

            {!isExpanded && hasContainers && (

              <>

                <button

                  onClick={() => scrollToolRow(tool.name, 'left')}

                  style={{

                    padding: '0.5rem',

                    background: '#0f3460',

                    border: `1px solid ${TOOL_COLOR}`,

                    borderRadius: '4px',

                    color: '#fff',

                    cursor: 'pointer',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center'

                  }}

                  title="Scroll left"

                >

                  <ChevronLeft size={20} />

                </button>

                <button

                  onClick={() => scrollToolRow(tool.name, 'right')}

                  style={{

                    padding: '0.5rem',

                    background: '#0f3460',

                    border: `1px solid ${TOOL_COLOR}`,

                    borderRadius: '4px',

                    color: '#fff',

                    cursor: 'pointer',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center'

                  }}

                  title="Scroll right"

                >

                  <ChevronRight size={20} />

                </button>

              </>

            )}

            

            {hasContainers && (

              <button

                onClick={() => toggleExpand(tool.name)}

                style={{

                  padding: '0.5rem 1rem',

                  background: isExpanded ? '#e94560' : TOOL_COLOR,

                  border: 'none',

                  borderRadius: '4px',

                  color: '#fff',

                  cursor: 'pointer',

                  fontWeight: 'bold',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '0.5rem',

                  transition: 'all 0.3s ease'

                }}

              >

                {isExpanded ? (

                  <>

                    <Minimize2 size={16} />

                    Shrink

                  </>

                ) : (

                  <>

                    <Maximize2 size={16} />

                    Expand

                  </>

                )}

              </button>

            )}

          </div>

        </div>



        {hasContainers ? (

          <div

            id={`scroll-${tool.name}`}

            style={{

              display: isExpanded ? 'grid' : 'flex',

              gridTemplateColumns: isExpanded ? 'repeat(auto-fill, minmax(350px, 1fr))' : 'none',

              gap: '1.5rem',

              overflowX: isExpanded ? 'visible' : 'auto',

              paddingBottom: '1rem',

              scrollBehavior: 'smooth'

            }}

          >

            {toolContainers.map(container => renderContainerCard(container, isExpanded))}

          </div>

        ) : (

          <div style={{

            textAlign: 'center',

            padding: '2rem',

            background: '#16213e',

            borderRadius: '8px',

            border: '2px dashed #333'

          }}>

            <p style={{ color: '#aaa', fontSize: '1rem' }}>

              No {tool.displayName} services found

            </p>

            <p style={{ color: '#666', fontSize: '0.85rem' }}>

              Services will appear here when available

            </p>

          </div>

        )}

      </div>

    );

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff', display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar - Now Sticky */}

      <div style={{ 

        width: '250px', 

        background: '#16213e', 

        padding: '20px',

        borderRight: '2px solid #0f3460',

        display: 'flex',

        flexDirection: 'column',

        position: 'sticky',

        top: 0,

        height: '100vh',

        overflowY: 'auto'

      }}>

        <h2 style={{ marginBottom: '20px', color: '#e94560' }}>DevOps Tools</h2>

        

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>

          {TOOLS.map(tool => {

            const isChecked = toolsStatus[tool.name];

            const isChecking = checkingTools[tool.name];

            

            return (

              <button

                key={tool.name}

                onClick={() => checkTool(tool.name)}

                disabled={isChecking}

                style={{

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                  padding: '12px 15px',

                  background: '#0f3460',

                  border: `2px solid ${isChecked === true ? '#4ecca3' : isChecked === false ? '#e74c3c' : '#555'}`,

                  borderRadius: '6px',

                  color: '#fff',

                  cursor: isChecking ? 'wait' : 'pointer',

                  textAlign: 'left',

                  transition: 'all 0.3s ease'

                }}

                onMouseEnter={(e) => {

                  if (!isChecking) {

                    e.currentTarget.style.background = '#1a4d7a';

                    e.currentTarget.style.transform = 'translateX(5px)';

                  }

                }}

                onMouseLeave={(e) => {

                  e.currentTarget.style.background = '#0f3460';

                  e.currentTarget.style.transform = 'translateX(0)';

                }}

              >

                <span style={{ fontWeight: 'bold' }}>{tool.displayName}</span>

                {isChecking ? (

                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />

                ) : isChecked === true ? (

                  <CheckCircle size={18} style={{ color: '#4ecca3' }} />

                ) : isChecked === false ? (

                  <XCircle size={18} style={{ color: '#e74c3c' }} />

                ) : (

                  <AlertCircle size={18} style={{ color: '#888' }} />

                )}

              </button>

            );

          })}

        </div>



        {/* Navigation Buttons */}

        <div style={{ 

          marginTop: 'auto', 

          paddingTop: '20px', 

          borderTop: '2px solid #0f3460',

          display: 'flex',

          flexDirection: 'column',

          gap: '10px'

        }}>

          <button

            onClick={() => navigate('/upload-files')}

            style={{

              width: '100%',

              padding: '12px',

              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',

              border: 'none',

              borderRadius: '8px',

              color: '#fff',

              cursor: 'pointer',

              fontWeight: 'bold',

              fontSize: '0.95rem',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem',

              transition: 'all 0.3s ease',

              boxShadow: '0 4px 8px rgba(155, 89, 182, 0.3)'

            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.transform = 'translateY(-2px)';

              e.currentTarget.style.boxShadow = '0 6px 12px rgba(155, 89, 182, 0.4)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.transform = 'translateY(0)';

              e.currentTarget.style.boxShadow = '0 4px 8px rgba(155, 89, 182, 0.3)';

            }}

          >

            <Upload size={18} />

            Upload My Own Files

          </button>



          <button

            onClick={() => navigate('/file-examples')}

            style={{

              width: '100%',

              padding: '12px',

              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',

              border: 'none',

              borderRadius: '8px',

              color: '#fff',

              cursor: 'pointer',

              fontWeight: 'bold',

              fontSize: '0.95rem',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem',

              transition: 'all 0.3s ease',

              boxShadow: '0 4px 8px rgba(230, 126, 34, 0.3)'

            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.transform = 'translateY(-2px)';

              e.currentTarget.style.boxShadow = '0 6px 12px rgba(230, 126, 34, 0.4)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.transform = 'translateY(0)';

              e.currentTarget.style.boxShadow = '0 4px 8px rgba(230, 126, 34, 0.3)';

            }}

          >

            <BookOpen size={18} />

            File as Example

          </button>



          <button

            onClick={() => navigate('/files')}

            style={{

              width: '100%',

              padding: '15px',

              background: 'linear-gradient(135deg, #4ecca3 0%, #2d98da 100%)',

              border: 'none',

              borderRadius: '8px',

              color: '#fff',

              cursor: 'pointer',

              fontWeight: 'bold',

              fontSize: '1rem',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '0.5rem',

              transition: 'all 0.3s ease',

              boxShadow: '0 4px 8px rgba(78, 204, 163, 0.3)'

            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.transform = 'translateY(-2px)';

              e.currentTarget.style.boxShadow = '0 6px 12px rgba(78, 204, 163, 0.4)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.transform = 'translateY(0)';

              e.currentTarget.style.boxShadow = '0 4px 8px rgba(78, 204, 163, 0.3)';

            }}

          >

            <FileCode size={20} />

            File Generator

          </button>

        </div>

      </div>



      {/* Main Content */}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Navigation */}

        <nav style={{ 

          background: '#16213e', 

          padding: '1rem 2rem', 

          display: 'flex', 

          justifyContent: 'space-between', 

          alignItems: 'center',

          borderBottom: '2px solid #0f3460'

        }}>

          <div>

            <h1 style={{ margin: 0, color: '#4ecca3', fontSize: '1.5rem' }}>DevOps Dashboard</h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

              Welcome, {user?.username || 'User'}

            </p>

          </div>

          

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>

              Last refresh: {formatTime(lastRefresh)}

            </span>

            <button 

              onClick={handleRefresh}

              disabled={refreshing}

              style={{ 

                padding: '0.5rem 1rem', 

                background: '#4ecca3', 

                border: 'none', 

                borderRadius: '4px', 

                color: '#1a1a2e', 

                cursor: refreshing ? 'wait' : 'pointer',

                fontWeight: 'bold',

                display: 'flex',

                alignItems: 'center',

                gap: '0.5rem'

              }}

            >

              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />

              Refresh

            </button>

            <button 

              onClick={logout} 

              style={{ 

                padding: '0.5rem 1rem', 

                background: '#e94560', 

                border: 'none', 

                borderRadius: '4px', 

                color: '#fff', 

                cursor: 'pointer',

                fontWeight: 'bold'

              }}

            >

              Logout

            </button>

          </div>

        </nav>



        {/* Tool Rows Container */}

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

          {loading ? (

            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>

              <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite' }} />

              <p>Loading services...</p>

            </div>

          ) : (

            <div>

              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <h2 style={{ color: '#4ecca3' }}>DevOps Services</h2>

                <span style={{ fontSize: '0.9rem', color: '#4ecca3' }}>

                  🔄 Auto-refreshing every 5 seconds

                </span>

              </div>

              

              {TOOLS.map(tool => renderToolRow(tool))}

            </div>

          )}

        </div>

      </div>



      <style>{`

        @keyframes spin {

          from { transform: rotate(0deg); }

          to { transform: rotate(360deg); }

        }

        

        div[id^="scroll-"] {

          scrollbar-width: thin;

          scrollbar-color: #4ecca3 #16213e;

        }

        

        div[id^="scroll-"]::-webkit-scrollbar {

          height: 8px;

        }

        

        div[id^="scroll-"]::-webkit-scrollbar-track {

          background: #16213e;

          border-radius: 4px;

        }

        

        div[id^="scroll-"]::-webkit-scrollbar-thumb {

          background: #4ecca3;

          border-radius: 4px;

        }

        

        div[id^="scroll-"]::-webkit-scrollbar-thumb:hover {

          background: #3daa82;

        }

      `}</style>

    </div>

  );

}



export default Dashboard;

