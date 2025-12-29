// frontend/src/pages/Dashboard.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dockerAPI, toolsAPI, deployAPI, getLogsUrl } from '../services/api';
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
  ChevronRight,
  Trash2,
  Layers,
  HelpCircle,
  Check
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

const TOOL_COLOR = '#4ecca3';

// Tutorial steps configuration
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    target: 'dashboard-title',
    title: 'Welcome to DevOps Dashboard! 👋',
    description: 'This dashboard helps you manage Docker containers, Terraform resources, and DevOps tools all in one place. Let me show you around!',
    position: 'bottom'
  },
  {
    id: 'tool-checks',
    target: 'tools-sidebar',
    title: 'Tool Installation Checker',
    description: 'Click on any tool to check if it\'s installed on your system. Green checkmark = installed, Red X = not installed.',
    position: 'right'
  },
  {
    id: 'generate-files',
    target: 'generate-files-btn',
    title: 'Generate Configuration Files',
    description: 'Quickly generate Dockerfile, Terraform, Kubernetes, Helm, ArgoCD, and Jenkins files with our built-in generator.',
    position: 'right'
  },
  {
    id: 'upload-files',
    target: 'upload-files-btn',
    title: 'Upload Your Own Files',
    description: 'Upload your existing configuration files to store and manage them in the dashboard.',
    position: 'right'
  },
  {
    id: 'docker-section',
    target: 'docker-section',
    title: 'Docker Container Management',
    description: 'View all your Docker containers here. Start, stop, view logs, or delete containers with a single click.',
    position: 'top'
  },
  {
    id: 'navigation-controls',
    target: 'nav-controls',
    title: 'Navigation Controls',
    description: 'Use these arrows to scroll through containers horizontally, and the Expand button to view them in a grid layout.',
    position: 'left'
  },
  {
    id: 'terraform-section',
    target: 'terraform-section',
    title: 'Terraform Resources',
    description: 'After running "terraform apply", your resources will appear here. You can destroy resources directly from the dashboard.',
    position: 'top'
  },
  {
    id: 'refresh',
    target: 'refresh-btn',
    title: 'Refresh Dashboard',
    description: 'The dashboard auto-refreshes every 5 seconds, but you can manually refresh anytime with this button.',
    position: 'bottom'
  },
  {
    id: 'complete',
    target: 'dashboard-title',
    title: 'You\'re All Set! 🎉',
    description: 'You can restart this tour anytime by clicking the help icon in the top-right corner. Happy DevOps-ing!',
    position: 'bottom'
  }
];

// Tutorial Bubble Component
function TutorialBubble({ step, onNext, onSkip, targetRef }) {
  const bubbleRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState('top');

  useEffect(() => {
    if (targetRef?.current && bubbleRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const bubbleRect = bubbleRef.current.getBoundingClientRect();
      const padding = 20;

      let top, left, arrow;

      switch (step.position) {
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;
          arrow = 'top';
          break;
        case 'top':
          top = targetRect.top - bubbleRect.height - padding;
          left = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;
          arrow = 'bottom';
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - bubbleRect.height / 2;
          left = targetRect.right + padding;
          arrow = 'left';
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - bubbleRect.height / 2;
          left = targetRect.left - bubbleRect.width - padding;
          arrow = 'right';
          break;
        default:
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;
          arrow = 'top';
      }

      // Keep bubble within viewport
      if (left < padding) left = padding;
      if (left + bubbleRect.width > window.innerWidth - padding) {
        left = window.innerWidth - bubbleRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + bubbleRect.height > window.innerHeight - padding) {
        top = window.innerHeight - bubbleRect.height - padding;
      }

      setPosition({ top, left });
      setArrowPosition(arrow);
    }
  }, [step, targetRef]);

  if (!targetRef?.current) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
        animation: 'fadeIn 0.3s ease'
      }} onClick={onSkip} />

      {/* Spotlight on target */}
      <div style={{
        position: 'fixed',
        top: targetRef.current.getBoundingClientRect().top - 8,
        left: targetRef.current.getBoundingClientRect().left - 8,
        width: targetRef.current.getBoundingClientRect().width + 16,
        height: targetRef.current.getBoundingClientRect().height + 16,
        border: '2px solid #4ecca3',
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'pulse 2s ease-in-out infinite'
      }} />

      {/* Tutorial bubble */}
      <div
        ref={bubbleRef}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          maxWidth: '400px',
          background: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
          border: '2px solid #4ecca3',
          borderRadius: '12px',
          padding: '1.5rem',
          zIndex: 10000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'slideIn 0.3s ease'
        }}
      >
        {/* Arrow */}
        <div style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderStyle: 'solid',
          ...(arrowPosition === 'top' && {
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 12px 12px 12px',
            borderColor: 'transparent transparent #4ecca3 transparent'
          }),
          ...(arrowPosition === 'bottom' && {
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '12px 12px 0 12px',
            borderColor: '#4ecca3 transparent transparent transparent'
          }),
          ...(arrowPosition === 'left' && {
            left: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '12px 12px 12px 0',
            borderColor: 'transparent #4ecca3 transparent transparent'
          }),
          ...(arrowPosition === 'right' && {
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '12px 0 12px 12px',
            borderColor: 'transparent transparent transparent #4ecca3'
          })
        }} />

        <div style={{ marginBottom: '0.5rem', color: '#4ecca3', fontSize: '1.1rem', fontWeight: 'bold' }}>
          {step.title}
        </div>
        
        <div style={{ marginBottom: '1.5rem', color: '#ccc', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {step.description}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onSkip}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #666',
              borderRadius: '6px',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#666';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            Skip Tour
          </button>
          
          <button
            onClick={onNext}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'linear-gradient(135deg, #4ecca3 0%, #3daa82 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#1a1a2e',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(78, 204, 163, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 204, 163, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 204, 163, 0.3)';
            }}
          >
            <Check size={18} />
            Got it!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px #4ecca3;
          }
          50% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px #4ecca3;
          }
        }
      `}</style>
    </>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [containers, setContainers] = useState([]);
  const [terraformResources, setTerraformResources] = useState([]);
  const [terraformGroups, setTerraformGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolsStatus, setToolsStatus] = useState({});
  const [checkingTools, setCheckingTools] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [actionInProgress, setActionInProgress] = useState({});
  const [hoveredDelete, setHoveredDelete] = useState(null);
  const [deletingContainer, setDeletingContainer] = useState(null);
  const [destroyingResource, setDestroyingResource] = useState(null);
  const [expandedTool, setExpandedTool] = useState(null);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Refs for tutorial targets
  const dashboardTitleRef = useRef(null);
  const toolsSidebarRef = useRef(null);
  const generateFilesBtnRef = useRef(null);
  const uploadFilesBtnRef = useRef(null);
  const dockerSectionRef = useRef(null);
  const navControlsRef = useRef(null);
  const terraformSectionRef = useRef(null);
  const refreshBtnRef = useRef(null);

  useEffect(() => {
    loadContainers();
    loadTerraformResources();
    
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 1000);
    }

    const interval = setInterval(() => {
      loadContainers();
      loadTerraformResources();
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

  const loadTerraformResources = async () => {
    try {
      const response = await deployAPI.getTerraformResources();
      if (response.data && response.data.success) {
        setTerraformResources(response.data.resources || []);
        setTerraformGroups(response.data.groupedResources || []);
      }
    } catch (error) {
      console.log('Terraform resources not available:', error.message);
      setTerraformResources([]);
      setTerraformGroups([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadContainers();
    loadTerraformResources();
  };

  const handleTutorialNext = () => {
    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      handleTutorialComplete();
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
    toast.success('You can restart the tour anytime from the help icon!');
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentTutorialStep(0);
    localStorage.setItem('hasSeenTutorial', 'true');
    toast.success('Tutorial complete! Welcome aboard! 🎉');
  };

  const restartTutorial = () => {
    setCurrentTutorialStep(0);
    setShowTutorial(true);
  };

  const getTutorialTargetRef = (targetId) => {
    const refs = {
      'dashboard-title': dashboardTitleRef,
      'tools-sidebar': toolsSidebarRef,
      'generate-files-btn': generateFilesBtnRef,
      'upload-files-btn': uploadFilesBtnRef,
      'docker-section': dockerSectionRef,
      'nav-controls': navControlsRef,
      'terraform-section': terraformSectionRef,
      'refresh-btn': refreshBtnRef
    };
    return refs[targetId];
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
      toast.error('Stop the container first before deleting');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete container "${container.name}"?`)) {
      return;
    }

    setDeletingContainer(container.id);
    
    try {
      const response = await dockerAPI.deleteContainer(container.id);
      
      if (response.data.success) {
        toast.success(`Deleted ${container.name}`);
        loadContainers();
      } else {
        toast.error(response.data.error || 'Failed to delete container');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to delete ${container.name}: ${errorMsg}`);
    } finally {
      setDeletingContainer(null);
    }
  };

  const handleDestroyResource = async (resource) => {
    if (!window.confirm(`Are you sure you want to destroy resource "${resource.fullName}"?\n\nType: ${resource.type}\nID: ${resource.id}`)) {
      return;
    }

    setDestroyingResource(resource.fullName);
    
    try {
      const response = await deployAPI.destroyTerraformResource(resource.fullName);
      
      if (response.data.success) {
        toast.success(`Destroyed ${resource.fullName}`);
        setTimeout(() => {
          loadTerraformResources();
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to destroy resource');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to destroy ${resource.fullName}: ${errorMsg}`);
    } finally {
      setDestroyingResource(null);
    }
  };

  const handleLogs = (container) => {
    const logsUrl = getLogsUrl(container.id);
    const token = localStorage.getItem('token');
    
    const logsWindow = window.open('', '_blank', 'width=1000,height=700');
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
              color: #4ecca3;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
            #logs {
              white-space: pre-wrap;
              word-wrap: break-word;
              line-height: 1.5;
            }
            h2 {
              color: #e94560;
              margin-top: 0;
            }
          </style>
        </head>
        <body>
          <h2>Container Logs: ${container.name}</h2>
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
    if (toolName === 'terraform') {
      return terraformGroups;
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
            {container.image}
          </p>
          <p style={{ 
            margin: '0.25rem 0', 
            fontSize: '0.8rem', 
            color: container.isRunning ? '#4ecca3' : '#e74c3c',
            fontWeight: 'bold'
          }}>
            {container.status}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!container.isRunning ? (
            <button
              onClick={() => handleStart(container)}
              disabled={isStarting || isDeleting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: isStarting ? '#666' : '#4ecca3',
                border: 'none',
                borderRadius: '4px',
                color: '#1a1a2e',
                cursor: (isStarting || isDeleting) ? 'wait' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isStarting ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Starting...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleStop(container)}
              disabled={isStopping || isDeleting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: isStopping ? '#666' : '#e94560',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: (isStopping || isDeleting) ? 'wait' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isStopping ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Stopping...
                </>
              ) : (
                <>
                  <Square size={16} />
                  Stop
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => handleLogs(container)}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#0f3460',
              border: `2px solid ${TOOL_COLOR}`,
              borderRadius: '4px',
              color: '#fff',
              cursor: isDeleting ? 'wait' : 'pointer',
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

  const renderTerraformResourceCard = (resource, isExpanded) => {
    const isDestroying = destroyingResource === resource.fullName;

    return (
      <div 
        key={resource.fullName}
        style={{ 
          background: '#16213e', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: `2px solid ${resource.isActive ? '#4ecca3' : '#666'}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          minWidth: isExpanded ? 'auto' : '300px',
          maxWidth: isExpanded ? 'auto' : '300px',
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
          onClick={() => handleDestroyResource(resource)}
          disabled={isDestroying}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: '#e94560',
            border: 'none',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDestroying ? 'wait' : 'pointer',
            opacity: isDestroying ? 0.5 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(233, 69, 96, 0.4)',
            zIndex: 10
          }}
          title="Destroy resource"
        >
          <Trash2 size={18} color="#fff" />
        </button>

        <div style={{ marginBottom: '1rem', paddingRight: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: resource.isActive ? '#4ecca3' : '#e74c3c',
              flexShrink: 0
            }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#4ecca3'
            }}>{resource.name}</h3>
          </div>
          
          <div style={{ 
            margin: '0.75rem 0',
            padding: '0.75rem',
            background: '#0f3460',
            borderRadius: '6px',
            border: '1px solid #4ecca3'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#888',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>Resource Type</span>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.85rem', 
                color: '#fff',
                fontFamily: 'monospace'
              }}>
                {resource.type}
              </p>
            </div>
            
            <div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#888',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>Resource ID</span>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.85rem', 
                color: '#4ecca3',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={resource.id}>
                {resource.id}
              </p>
            </div>
          </div>

          {resource.attributes && resource.attributes.tags && (
            <div style={{ 
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#aaa'
            }}>
              <strong>Tags:</strong> {Object.keys(resource.attributes.tags).length}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTerraformGroup = (group, isExpanded) => {
    if (group.resources.length === 1) {
      return renderTerraformResourceCard(group.resources[0], isExpanded);
    }

    return (
      <div 
        key={group.id}
        style={{ 
          background: '#0f3460', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: `2px solid #4ecca3`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          minWidth: isExpanded ? 'auto' : '400px',
          maxWidth: isExpanded ? 'auto' : '400px',
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #4ecca3'
        }}>
          <Layers size={20} color="#4ecca3" />
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1rem',
            color: '#4ecca3'
          }}>
            Related Resources ({group.resources.length})
          </h3>
        </div>

        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {group.resources.map(resource => (
            <div 
              key={resource.fullName}
              style={{ 
                background: '#16213e', 
                padding: '1rem', 
                borderRadius: '6px',
                border: `1px solid ${resource.isActive ? '#4ecca3' : '#666'}`,
                position: 'relative'
              }}
            >
              <button
                onClick={() => handleDestroyResource(resource)}
                disabled={destroyingResource === resource.fullName}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: '#e94560',
                  border: 'none',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: destroyingResource === resource.fullName ? 'wait' : 'pointer',
                  opacity: destroyingResource === resource.fullName ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(233, 69, 96, 0.4)',
                  zIndex: 10
                }}
                title="Destroy resource"
              >
                <Trash2 size={14} color="#fff" />
              </button>

              <div style={{ paddingRight: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: resource.isActive ? '#4ecca3' : '#e74c3c',
                    flexShrink: 0
                  }} />
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '0.95rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#4ecca3'
                  }}>{resource.name}</h4>
                </div>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: '#888',
                      textTransform: 'uppercase'
                    }}>Type: </span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#fff',
                      fontFamily: 'monospace'
                    }}>
                      {resource.type}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: '#888',
                      textTransform: 'uppercase'
                    }}>ID: </span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#4ecca3',
                      fontFamily: 'monospace'
                    }} title={resource.id}>
                      {resource.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderToolRow = (tool) => {
    const toolContainers = getToolContainers(tool.name);
    const isExpanded = expandedTool === tool.name;
    const hasContainers = toolContainers.length > 0;
    const isDocker = tool.name === 'docker';
    const isTerraform = tool.name === 'terraform';

    return (
      <div 
        key={tool.name} 
        style={{ marginBottom: '2rem' }}
        ref={isDocker ? dockerSectionRef : isTerraform ? terraformSectionRef : null}
      >
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
          
          <div 
            style={{ display: 'flex', gap: '0.5rem' }}
            ref={isDocker && hasContainers ? navControlsRef : null}
          >
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
            {tool.name === 'docker' && toolContainers.map(container => renderContainerCard(container, isExpanded))}
            {tool.name === 'terraform' && toolContainers.map(group => renderTerraformGroup(group, isExpanded))}
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
              No {tool.displayName} {tool.name === 'terraform' ? 'resources' : 'services'} found
            </p>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>
              {tool.name === 'terraform' 
                ? 'Resources will appear here after terraform apply' 
                : 'Services will appear here when available'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Tutorial Bubble */}
      {showTutorial && (
        <TutorialBubble
          step={TUTORIAL_STEPS[currentTutorialStep]}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
          targetRef={getTutorialTargetRef(TUTORIAL_STEPS[currentTutorialStep].target)}
        />
      )}

      <div 
        ref={toolsSidebarRef}
        style={{ 
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
        }}
      >
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

        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '20px', 
          borderTop: '2px solid #0f3460',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            ref={uploadFilesBtnRef}
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
            ref={generateFilesBtnRef}
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
            Generate Files
          </button>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '2px solid #e94560',
              borderRadius: '8px',
              color: '#e94560',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e94560';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#e94560';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <nav style={{ 
          background: '#16213e', 
          padding: '1rem 2rem', 
          borderBottom: '2px solid #0f3460',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div ref={dashboardTitleRef}>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>DevOps Dashboard</h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
              Welcome, <span style={{ color: '#4ecca3', fontWeight: 'bold' }}>{user?.username}</span>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={restartTutorial}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: `2px solid ${TOOL_COLOR}`,
                borderRadius: '6px',
                color: TOOL_COLOR,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Restart Tutorial"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOOL_COLOR;
                e.currentTarget.style.color = '#1a1a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = TOOL_COLOR;
              }}
            >
              <HelpCircle size={20} />
            </button>

            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Last refresh: {formatTime(lastRefresh)}
            </span>
            <button 
              ref={refreshBtnRef}
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