
// /home/shayg/open-source-contribute/Devops-full-managed-dashboard/frontend/src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';

import { dockerAPI, toolsAPI, getLogsUrl } from '../services/api';

import { 

  Play, 

  Square, 

  FileText, 

  RefreshCw, 

  CheckCircle, 

  XCircle,

  AlertCircle

} from 'lucide-react';

import toast from 'react-hot-toast';



const TOOLS = [

  { name: 'docker', displayName: 'Docker', docs: 'https://docs.docker.com/get-docker/' },

  { name: 'terraform', displayName: 'Terraform', docs: 'https://learn.hashicorp.com/tutorials/terraform/install-cli' },

  { name: 'kubectl', displayName: 'Kubernetes', docs: 'https://kubernetes.io/docs/tasks/tools/' },

  { name: 'helm', displayName: 'Helm', docs: 'https://helm.sh/docs/intro/install/' },

  { name: 'argocd', displayName: 'ArgoCD', docs: 'https://argo-cd.readthedocs.io/en/stable/getting_started/' },

  { name: 'ansible', displayName: 'Ansible', docs: 'https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html' },

  { name: 'jenkins', displayName: 'Jenkins', docs: 'https://www.jenkins.io/doc/book/installing/' },

];



function Dashboard() {

  const { user, logout } = useAuth();

  const [containers, setContainers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [toolsStatus, setToolsStatus] = useState({});

  const [checkingTools, setCheckingTools] = useState({});

  const [refreshing, setRefreshing] = useState(false);

  const [lastRefresh, setLastRefresh] = useState(new Date());



  useEffect(() => {

    loadContainers();

    const interval = setInterval(() => {

      loadContainers();

    }, 5000); // Auto-refresh every 5 seconds

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

    try {

      await dockerAPI.startContainer(container.id);

      toast.success(`Started ${container.name}`);

      loadContainers();

    } catch (error) {

      toast.error(`Failed to start ${container.name}: ${error.response?.data?.error || error.message}`);

    }

  };



  const handleStop = async (container) => {

    try {

      await dockerAPI.stopContainer(container.id);

      toast.success(`Stopped ${container.name}`);

      loadContainers();

    } catch (error) {

      toast.error(`Failed to stop ${container.name}: ${error.response?.data?.error || error.message}`);

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



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff', display: 'flex' }}>

      {/* Sidebar */}

      <div style={{ 

        width: '250px', 

        background: '#16213e', 

        padding: '20px',

        borderRight: '2px solid #0f3460',

        overflowY: 'auto'

      }}>

        <h2 style={{ marginBottom: '20px', color: '#e94560' }}>DevOps Tools</h2>

        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '20px' }}>

          Click to check installation status

        </p>

        

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {TOOLS.map(tool => (

            <button

              key={tool.name}

              onClick={() => checkTool(tool.name)}

              disabled={checkingTools[tool.name]}

              style={{

                padding: '12px',

                background: toolsStatus[tool.name] === true ? '#0f3460' : 

                           toolsStatus[tool.name] === false ? '#2d1e2f' : '#1a1a2e',

                border: `1px solid ${toolsStatus[tool.name] === true ? '#4ecca3' : 

                                    toolsStatus[tool.name] === false ? '#e74c3c' : '#333'}`,

                borderRadius: '6px',

                color: '#fff',

                cursor: checkingTools[tool.name] ? 'wait' : 'pointer',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between',

                transition: 'all 0.2s'

              }}

            >

              <span>{tool.displayName}</span>

              {checkingTools[tool.name] ? (

                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />

              ) : toolsStatus[tool.name] === true ? (

                <CheckCircle size={16} color="#4ecca3" />

              ) : toolsStatus[tool.name] === false ? (

                <XCircle size={16} color="#e74c3c" />

              ) : (

                <AlertCircle size={16} color="#aaa" />

              )}

            </button>

          ))}

        </div>

      </div>



      {/* Main Content */}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}

        <nav style={{ 

          background: '#16213e', 

          padding: '1rem 2rem', 

          display: 'flex', 

          justifyContent: 'space-between', 

          alignItems: 'center',

          borderBottom: '2px solid #0f3460'

        }}>

          <h1 style={{ margin: 0 }}>Docker Management Dashboard</h1>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>

              Last refresh: {formatTime(lastRefresh)}

            </span>

            <span style={{ color: '#aaa' }}>Welcome, {user?.username}</span>

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



        {/* Containers Grid */}

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <h2>Docker Containers ({containers.length})</h2>

            <span style={{ fontSize: '0.9rem', color: '#4ecca3' }}>

              🔄 Auto-refreshing every 5 seconds

            </span>

          </div>



          {loading ? (

            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>

              <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite' }} />

              <p>Loading containers...</p>

            </div>

          ) : containers.length === 0 ? (

            <div style={{ 

              textAlign: 'center', 

              padding: '3rem', 

              background: '#16213e', 

              borderRadius: '8px',

              border: '2px dashed #333'

            }}>

              <p style={{ color: '#aaa', fontSize: '1.2rem' }}>No Docker containers found</p>

              <p style={{ color: '#666', fontSize: '0.9rem' }}>Start some containers to see them here</p>

            </div>

          ) : (

            <div style={{ 

              display: 'grid', 

              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 

              gap: '1.5rem' 

            }}>

              {containers.map(container => (

                <div 

                  key={container.id}

                  style={{ 

                    background: '#16213e', 

                    padding: '1.5rem', 

                    borderRadius: '8px',

                    border: `2px solid ${container.isRunning ? '#4ecca3' : '#666'}`,

                    transition: 'transform 0.2s, box-shadow 0.2s',

                    overflow: 'hidden'

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

                  {/* Container Header */}

                  <div style={{ marginBottom: '1rem' }}>

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



                  {/* Action Buttons */}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>

                    <button

                      onClick={() => handleStart(container)}

                      disabled={container.isRunning}

                      style={{

                        flex: 1,

                        padding: '0.75rem',

                        background: container.isRunning ? '#333' : '#4ecca3',

                        border: 'none',

                        borderRadius: '4px',

                        color: container.isRunning ? '#666' : '#1a1a2e',

                        cursor: container.isRunning ? 'not-allowed' : 'pointer',

                        fontWeight: 'bold',

                        display: 'flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                        gap: '0.5rem'

                      }}

                    >

                      <Play size={16} />

                      Start

                    </button>

                    

                    <button

                      onClick={() => handleStop(container)}

                      disabled={!container.isRunning}

                      style={{

                        flex: 1,

                        padding: '0.75rem',

                        background: !container.isRunning ? '#333' : '#e94560',

                        border: 'none',

                        borderRadius: '4px',

                        color: !container.isRunning ? '#666' : '#fff',

                        cursor: !container.isRunning ? 'not-allowed' : 'pointer',

                        fontWeight: 'bold',

                        display: 'flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                        gap: '0.5rem'

                      }}

                    >

                      <Square size={16} />

                      Stop

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

              ))}

            </div>

          )}

        </div>

      </div>



      <style>{`

        @keyframes spin {

          from { transform: rotate(0deg); }

          to { transform: rotate(360deg); }

        }

      `}</style>

    </div>

  );

}



export default Dashboard;

