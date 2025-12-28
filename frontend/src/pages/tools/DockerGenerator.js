
// frontend/src/pages/tools/DockerGenerator.js



import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Download, Copy, Check, Rocket, X, FolderOpen, Home, Plus, Minus, GripVertical } from 'lucide-react';

import toast from 'react-hot-toast';

import api from '../../services/api';



function DockerGenerator() {

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const [pathCopied, setPathCopied] = useState(false);

  const [deploying, setDeploying] = useState(false);

  const [showLogsPopup, setShowLogsPopup] = useState(false);

  const [deployLogs, setDeployLogs] = useState([]);

  const [deploySuccess, setDeploySuccess] = useState(null);

  const [filePath, setFilePath] = useState('');

  const [deployMode, setDeployMode] = useState('deploy-and-run');

  const [containerName, setContainerName] = useState('');

  const [draggedIndex, setDraggedIndex] = useState(null);

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [activityLog, setActivityLog] = useState([

    { id: 1, message: 'Dockerfile initialized', timestamp: new Date() }

  ]);



  const [dockerLines, setDockerLines] = useState([

    { id: 1, content: 'FROM node:18-alpine' },

    { id: 2, content: 'WORKDIR /app' },

    { id: 3, content: 'COPY package*.json ./' },

    { id: 4, content: 'RUN npm install' },

    { id: 5, content: 'COPY . .' },

    { id: 6, content: 'RUN npm run build' },

    { id: 7, content: 'EXPOSE 3000' },

    { id: 8, content: 'CMD ["npm", "start"]' }

  ]);



  const addToLog = (message) => {

    const newLog = {

      id: Date.now(),

      message,

      timestamp: new Date()

    };

    setActivityLog(prev => [newLog, ...prev].slice(0, 20));

  };



  const generateDockerfile = () => {

    return dockerLines.map(line => line.content).join('\n');

  };



  const handleDragStart = (e, index) => {

    setDraggedIndex(index);

    e.dataTransfer.effectAllowed = 'move';

  };



  const handleDragOver = (e, index) => {

    e.preventDefault();

    if (draggedIndex !== index) {

      setDragOverIndex(index);

    }

  };



  const handleDragLeave = () => {

    setDragOverIndex(null);

  };



  const handleDrop = (e, dropIndex) => {

    e.preventDefault();

    

    if (draggedIndex === null || draggedIndex === dropIndex) {

      setDraggedIndex(null);

      setDragOverIndex(null);

      return;

    }



    const newLines = [...dockerLines];

    const draggedLine = newLines[draggedIndex];

    

    newLines.splice(draggedIndex, 1);

    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;

    newLines.splice(insertIndex, 0, draggedLine);

    

    setDockerLines(newLines);

    addToLog(`Line dragged from position ${draggedIndex + 1} → ${insertIndex + 1}`);

    setDraggedIndex(null);

    setDragOverIndex(null);

  };



  const handleDragEnd = () => {

    setDraggedIndex(null);

    setDragOverIndex(null);

  };



  const addLine = (index) => {

    const newLines = [...dockerLines];

    const lineToCopy = newLines[index];

    const newId = Math.max(...dockerLines.map(l => l.id)) + 1;

    const newLine = { ...lineToCopy, id: newId };

    newLines.splice(index + 1, 0, newLine);

    setDockerLines(newLines);

    addToLog(`Line added: ${newLine.content}`);

    toast.success('Line added!');

  };



  const removeLine = (index) => {

    if (dockerLines.length <= 1) {

      toast.error('Must keep at least one line!');

      return;

    }

    const removedLine = dockerLines[index];

    const newLines = dockerLines.filter((_, i) => i !== index);

    setDockerLines(newLines);

    addToLog(`Line removed: ${removedLine.content}`);

    toast.success('Line removed!');

  };



  const updateLineContent = (index, newContent) => {

    const newLines = [...dockerLines];

    const oldContent = newLines[index].content;

    newLines[index].content = newContent;

    setDockerLines(newLines);

    if (oldContent !== newContent) {

      addToLog(`Line updated: ${newContent}`);

    }

  };



  const handleCopy = () => {

    navigator.clipboard.writeText(generateDockerfile());

    setCopied(true);

    addToLog('Dockerfile copied to clipboard');

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

    addToLog('Dockerfile downloaded');

    toast.success('Dockerfile downloaded!');

  };



  const handleCopyPath = () => {

    if (filePath) {

      const fullPath = filePath.replace('~', '/home/user');

      navigator.clipboard.writeText(fullPath);

      setPathCopied(true);

      toast.success('Path copied to clipboard!');

      setTimeout(() => setPathCopied(false), 2000);

    }

  };



  const handleDeploy = async () => {

    if (deployMode === 'deploy-and-run' && !containerName.trim()) {

      toast.error('Please enter a container name!');

      return;

    }



    if (deployMode === 'deploy-and-run') {

      const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;

      if (!nameRegex.test(containerName)) {

        toast.error('Container name can only contain letters, numbers, underscores, periods, and hyphens!');

        return;

      }

    }



    setDeploying(true);

    setShowLogsPopup(true);

    setDeployLogs([]);

    setDeploySuccess(null);

    setFilePath('');

    addToLog(`Deployment started: ${deployMode}`);



    try {

      const payload = {

        content: generateDockerfile(),

        mode: deployMode,

        containerName: containerName.trim() || `generated-app-${Date.now()}`

        // ✅ REMOVED HARDCODED PORT - Backend will handle it

      };



      const response = await api.post('/deploy/docker', payload);



      setDeployLogs(response.data.logs || []);

      setDeploySuccess(response.data.success);

      setFilePath(response.data.filePath || '');



      if (response.data.success) {

        if (deployMode === 'deploy-and-run') {

          addToLog(`Container "${containerName}" deployed successfully`);

          toast.success(`Container "${containerName}" deployed and running!`);

        } else {

          addToLog('Dockerfile deployed successfully');

          toast.success('Dockerfile deployed successfully!');

        }

      } else {

        addToLog('Deployment failed');

        toast.error('Deployment failed. Check logs for details.');

      }

    } catch (error) {

      console.error('Deployment error:', error);

      addToLog(`Deployment error: ${error.message}`);

      setDeployLogs([

        { type: 'stderr', message: `Error: ${error.response?.data?.error || error.message}\n`, timestamp: new Date() }

      ]);

      setDeploySuccess(false);

      toast.error('Deployment failed!');

    } finally {

      setDeploying(false);

    }

  };



  const formatTime = (date) => {

    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        borderBottom: '2px solid #2496ED',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'space-between'

      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

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

                Create and deploy production-ready Dockerfiles

              </p>

            </div>

          </div>

        </div>

        

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

      </nav>



      <div style={{ 

        padding: '2rem',

        maxWidth: '1600px',

        margin: '0 auto',

        display: 'grid',

        gridTemplateColumns: '1fr 1fr',

        gap: '2rem'

      }}>

        {/* LEFT: Dockerfile Editor */}

        <div style={{

          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',

          border: '2px solid #2496ED',

          borderRadius: '12px',

          padding: '2rem',

          display: 'flex',

          flexDirection: 'column',

          gap: '1.5rem'

        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <h2 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem' }}>Dockerfile Editor</h2>

          </div>



          <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>

            💡 Drag lines to reorder • Click + to duplicate • Click - to remove • Click line to edit

          </p>



          {/* All Dockerfile Lines */}

          <div style={{ 

            flex: 1,

            background: '#1a5490',

            border: '2px solid #2496ED60',

            borderRadius: '8px', 

            padding: '1rem',

            overflow: 'auto',

            maxHeight: '600px'

          }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

              {dockerLines.map((line, index) => (

                <div 

                  key={line.id} 

                  draggable 

                  onDragStart={(e) => handleDragStart(e, index)} 

                  onDragOver={(e) => handleDragOver(e, index)} 

                  onDragLeave={handleDragLeave} 

                  onDrop={(e) => handleDrop(e, index)} 

                  onDragEnd={handleDragEnd} 

                  style={{ 

                    display: 'flex', 

                    alignItems: 'center', 

                    gap: '0.5rem', 

                    padding: '0.5rem', 

                    background: draggedIndex === index ? '#2496ED50' : dragOverIndex === index ? '#4ecca350' : '#2567a8', 

                    borderRadius: '6px', 

                    border: dragOverIndex === index ? '2px dashed #4ecca3' : '2px solid transparent', 

                    transition: 'all 0.2s ease', 

                    cursor: 'grab' 

                  }}

                >

                  <button 

                    onClick={() => removeLine(index)} 

                    style={{ 

                      background: '#e9456030', 

                      border: '1px solid #e94560', 

                      borderRadius: '4px', 

                      width: '20px', 

                      height: '20px', 

                      display: 'flex', 

                      alignItems: 'center', 

                      justifyContent: 'center', 

                      cursor: 'pointer', 

                      flexShrink: 0, 

                      transition: 'all 0.2s ease' 

                    }} 

                    onMouseEnter={(e) => { 

                      e.currentTarget.style.background = '#e94560'; 

                      e.currentTarget.style.transform = 'scale(1.1)'; 

                    }} 

                    onMouseLeave={(e) => { 

                      e.currentTarget.style.background = '#e9456030'; 

                      e.currentTarget.style.transform = 'scale(1)'; 

                    }}

                  >

                    <Minus size={12} color="#fff" />

                  </button>

                  

                  <div style={{ color: '#8ab4f8', cursor: 'grab', flexShrink: 0, display: 'flex', alignItems: 'center' }}>

                    <GripVertical size={16} />

                  </div>

                  

                  <input 

                    type="text" 

                    value={line.content} 

                    onChange={(e) => updateLineContent(index, e.target.value)} 

                    style={{ 

                      flex: 1, 

                      background: 'transparent', 

                      border: 'none', 

                      color: '#e8f4f8', 

                      fontFamily: "'Courier New', monospace", 

                      fontSize: '0.95rem', 

                      padding: '0.25rem 0.5rem', 

                      outline: 'none',

                      fontWeight: '500'

                    }} 

                    onFocus={(e) => { 

                      e.currentTarget.style.background = '#ffffff15'; 

                      e.currentTarget.style.borderRadius = '4px'; 

                    }} 

                    onBlur={(e) => { 

                      e.currentTarget.style.background = 'transparent'; 

                    }} 

                  />

                  

                  <button 

                    onClick={() => addLine(index)} 

                    style={{ 

                      background: '#4ecca330', 

                      border: '1px solid #4ecca3', 

                      borderRadius: '4px', 

                      width: '20px', 

                      height: '20px', 

                      display: 'flex', 

                      alignItems: 'center', 

                      justifyContent: 'center', 

                      cursor: 'pointer', 

                      flexShrink: 0, 

                      transition: 'all 0.2s ease' 

                    }} 

                    onMouseEnter={(e) => { 

                      e.currentTarget.style.background = '#4ecca3'; 

                      e.currentTarget.style.transform = 'scale(1.1)'; 

                    }} 

                    onMouseLeave={(e) => { 

                      e.currentTarget.style.background = '#4ecca330'; 

                      e.currentTarget.style.transform = 'scale(1)'; 

                    }}

                  >

                    <Plus size={12} color="#fff" />

                  </button>

                </div>

              ))}

            </div>

          </div>



          {/* Deployment Mode */}

          <div style={{ padding: '1rem', background: '#0f3460', borderRadius: '8px', border: '2px solid #2496ED40' }}>

            <label style={{ display: 'block', marginBottom: '1rem', color: '#2496ED', fontSize: '1rem', fontWeight: 'bold' }}>Deployment Mode</label>

            

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: deployMode === 'deploy' ? '#2496ED20' : 'transparent', borderRadius: '6px', border: deployMode === 'deploy' ? '2px solid #2496ED' : '2px solid transparent' }}>

                <input type="radio" name="deployMode" value="deploy" checked={deployMode === 'deploy'} onChange={(e) => setDeployMode(e.target.value)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />

                <div>

                  <div style={{ color: '#fff', fontWeight: 'bold' }}>Deploy Only</div>

                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Save Dockerfile and validate syntax</div>

                </div>

              </label>



              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: deployMode === 'deploy-and-run' ? '#2496ED20' : 'transparent', borderRadius: '6px', border: deployMode === 'deploy-and-run' ? '2px solid #2496ED' : '2px solid transparent' }}>

                <input type="radio" name="deployMode" value="deploy-and-run" checked={deployMode === 'deploy-and-run'} onChange={(e) => setDeployMode(e.target.value)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />

                <div>

                  <div style={{ color: '#fff', fontWeight: 'bold' }}>Deploy & Run</div>

                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Build image and start container</div>

                </div>

              </label>

            </div>



            {deployMode === 'deploy-and-run' && (

              <div style={{ marginTop: '1rem' }}>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem', fontWeight: 'bold' }}>Container Name *</label>

                <input type="text" value={containerName} onChange={(e) => setContainerName(e.target.value)} placeholder="my-app" style={{ width: '100%', padding: '0.75rem', background: '#1a4d7a', border: '2px solid #2496ED', borderRadius: '6px', color: '#fff', fontSize: '1rem' }} />

              </div>

            )}

          </div>



          {/* Action Buttons */}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

              <button onClick={handleCopy} style={{ padding: '0.75rem', background: '#2496ED', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>

                {copied ? <Check size={16} /> : <Copy size={16} />}

                {copied ? 'Copied!' : 'Copy'}

              </button>

              <button onClick={handleDownload} style={{ padding: '0.75rem', background: '#4ecca3', border: 'none', borderRadius: '6px', color: '#1a1a2e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>

                <Download size={16} />Download

              </button>

            </div>

            

            <div style={{ display: 'flex', justifyContent: 'center' }}>

              <button onClick={handleDeploy} disabled={deploying} style={{ padding: '0.75rem 2rem', background: deploying ? '#666' : '#e94560', border: 'none', borderRadius: '6px', color: '#fff', cursor: deploying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', minWidth: '200px' }}>

                <Rocket size={16} />

                {deploying ? 'Deploying...' : deployMode === 'deploy-and-run' ? 'Deploy & Run' : 'Deploy'}

              </button>

            </div>

          </div>

        </div>



        {/* RIGHT: Summary / Change Log */}

        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)', border: '2px solid #2496ED', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>

            <h2 style={{ margin: '0 0 1rem 0', color: '#2496ED', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📋 Generated Dockerfile</h2>

            <pre style={{ background: '#0f3460', border: '2px solid #2496ED40', borderRadius: '8px', padding: '1rem', overflow: 'auto', fontFamily: "'Courier New', monospace", fontSize: '0.9rem', lineHeight: '1.6', color: '#4ecca3', margin: 0, maxHeight: '400px' }}>{generateDockerfile()}</pre>

          </div>



          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            <h3 style={{ margin: '0 0 1rem 0', color: '#2496ED', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📝 Activity Log</h3>

            <div style={{ flex: 1, background: '#0f3460', border: '2px solid #2496ED40', borderRadius: '8px', padding: '1rem', overflow: 'auto', maxHeight: '400px' }}>

              {activityLog.length === 0 ? (

                <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>No activity yet</p>

              ) : (

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                  {activityLog.map((log) => (

                    <div key={log.id} style={{ padding: '0.75rem', background: '#16213e', borderRadius: '6px', borderLeft: '3px solid #4ecca3' }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>

                        <span style={{ color: '#fff', fontSize: '0.9rem', flex: 1 }}>✓ {log.message}</span>

                        <span style={{ color: '#666', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatTime(log.timestamp)}</span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* Deployment Logs Popup */}

      {showLogsPopup && (

        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>

          <div style={{ background: '#16213e', border: '3px solid #2496ED', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

            <div style={{ padding: '1.5rem', borderBottom: '2px solid #2496ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)' }}>

              <div style={{ flex: 1 }}>

                <h3 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                  <Rocket size={24} />Deployment Logs

                </h3>

                {filePath && (

                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                    <span style={{ fontSize: '0.9rem', color: '#4ecca3' }}>📂 {filePath}</span>

                    <button onClick={handleCopyPath} style={{ padding: '0.25rem 0.75rem', background: pathCopied ? '#4ecca3' : '#2496ED', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>

                      {pathCopied ? <Check size={12} /> : <FolderOpen size={12} />}

                      {pathCopied ? 'Copied!' : 'Copy Path'}

                    </button>

                  </div>

                )}

              </div>

              <button onClick={() => setShowLogsPopup(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e9456040'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>

                <X size={24} />

              </button>

            </div>



            <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto', background: '#0a0a0a', fontFamily: "'Courier New', monospace", fontSize: '0.9rem' }}>

              {deployLogs.length === 0 && deploying && (<div style={{ color: '#4ecca3' }}>⚙️ Initializing deployment...</div>)}

              {deployLogs.map((log, index) => (

                <div key={index} style={{ color: log.type === 'stderr' ? '#e74c3c' : '#4ecca3', marginBottom: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>{log.message}</div>

              ))}

            </div>



            {!deploying && deploySuccess !== null && (

              <div style={{ padding: '1.5rem', borderTop: '2px solid #2496ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)' }}>

                <div style={{ color: deploySuccess ? '#4ecca3' : '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>

                  <span>{deploySuccess ? '✓ Deployment Successful!' : '✗ Deployment Failed'}</span>

                  {deploySuccess && deployMode === 'deploy-and-run' && containerName && (<span style={{ fontSize: '0.9rem', color: '#2496ED' }}>Container "{containerName}" is running on dashboard</span>)}

                </div>

                <button onClick={() => { setShowLogsPopup(false); if (deploySuccess && deployMode === 'deploy-and-run') { setTimeout(() => navigate('/dashboard'), 500); } }} style={{ padding: '0.75rem 1.5rem', background: deploySuccess && deployMode === 'deploy-and-run' ? '#4ecca3' : '#2496ED', border: 'none', borderRadius: '6px', color: deploySuccess && deployMode === 'deploy-and-run' ? '#1a1a2e' : '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>

                  {deploySuccess && deployMode === 'deploy-and-run' ? 'Go to Dashboard' : 'Close'}

                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

}



export default DockerGenerator;

