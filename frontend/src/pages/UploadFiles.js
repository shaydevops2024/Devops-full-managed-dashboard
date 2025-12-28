
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import api from '../services/api';

import { Upload, X, Folder, File, Trash2, Download, ArrowLeft } from 'lucide-react';

import toast from 'react-hot-toast';



const CATEGORIES = ['Docker', 'Terraform', 'Kubernetes', 'Helm', 'ArgoCD', 'Jenkins'];



function UploadFiles() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const [files, setFiles] = useState({});

  const [loading, setLoading] = useState(true);

  const [fileName, setFileName] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);

  const [filePath, setFilePath] = useState('');

  const [storageLocation, setStorageLocation] = useState('local');

  const [category, setCategory] = useState('Docker');

  const [uploading, setUploading] = useState(false);



  useEffect(() => {

    loadFiles();

  }, []);



  const loadFiles = async () => {

    try {

      const response = await api.get('/files/user-uploads');

      const filesByCategory = {};

      CATEGORIES.forEach(cat => {

        filesByCategory[cat] = [];

      });

      

      if (response.data.files) {

        response.data.files.forEach(file => {

          if (filesByCategory[file.category]) {

            filesByCategory[file.category].push(file);

          }

        });

      }

      

      setFiles(filesByCategory);

    } catch (error) {

      console.error('Error loading files:', error);

      toast.error('Failed to load files');

    } finally {

      setLoading(false);

    }

  };



  const handleFileSelect = (e) => {

    const file = e.target.files[0];

    if (file) {

      setSelectedFile(file);

      if (!fileName) {

        setFileName(file.name);

      }

    }

  };



  const handleUpload = async () => {

    if (!fileName.trim()) {

      toast.error('Please enter a file name');

      return;

    }



    if (!selectedFile && !filePath.trim()) {

      toast.error('Please select a file or enter a file path');

      return;

    }



    setUploading(true);



    try {

      const formData = new FormData();

      formData.append('fileName', fileName);

      formData.append('category', category);

      formData.append('storageLocation', storageLocation);

      

      if (selectedFile) {

        formData.append('file', selectedFile);

      }

      

      if (filePath.trim()) {

        formData.append('filePath', filePath);

      }



      await api.post('/files/upload-custom', formData, {

        headers: {

          'Content-Type': 'multipart/form-data',

        },

      });



      toast.success('File uploaded successfully!');

      setShowModal(false);

      resetForm();

      loadFiles();

    } catch (error) {

      console.error('Upload error:', error);

      toast.error(error.response?.data?.error || 'Failed to upload file');

    } finally {

      setUploading(false);

    }

  };



  const resetForm = () => {

    setFileName('');

    setSelectedFile(null);

    setFilePath('');

    setStorageLocation('local');

    setCategory('Docker');

  };



  const handleDelete = async (fileId, category) => {

    if (!window.confirm('Are you sure you want to delete this file?')) {

      return;

    }



    try {

      await api.delete(`/files/user-uploads/${fileId}`);

      toast.success('File deleted successfully');

      loadFiles();

    } catch (error) {

      console.error('Delete error:', error);

      toast.error('Failed to delete file');

    }

  };



  const handleDownload = async (fileId, fileName) => {

    try {

      const response = await api.get(`/files/user-uploads/${fileId}/download`, {

        responseType: 'blob',

      });

      

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', fileName);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      

      toast.success('File downloaded');

    } catch (error) {

      console.error('Download error:', error);

      toast.error('Failed to download file');

    }

  };



  const formatFileSize = (bytes) => {

    if (bytes === 0) return '0 Bytes';

    const k = 1024;

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];

  };



  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleString();

  };



  return (

    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>

      <nav style={{ 

        background: '#16213e', 

        padding: '1rem 2rem', 

        display: 'flex', 

        justifyContent: 'space-between', 

        alignItems: 'center',

        borderBottom: '2px solid #0f3460'

      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          <button

            onClick={() => navigate('/dashboard')}

            style={{

              background: '#0f3460',

              border: '2px solid #4ecca3',

              borderRadius: '6px',

              color: '#fff',

              padding: '8px 12px',

              cursor: 'pointer',

              display: 'flex',

              alignItems: 'center',

              gap: '0.5rem',

              transition: 'all 0.3s ease'

            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.background = '#1a4d7a';

              e.currentTarget.style.transform = 'translateX(-3px)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.background = '#0f3460';

              e.currentTarget.style.transform = 'translateX(0)';

            }}

          >

            <ArrowLeft size={20} />

            Back to Dashboard

          </button>

          

          <div>

            <h1 style={{ margin: 0, color: '#4ecca3', fontSize: '1.5rem' }}>Upload My Own Files</h1>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>

              Manage your custom DevOps files

            </p>

          </div>

        </div>

        

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <span style={{ color: '#aaa' }}>Welcome, {user?.username}</span>

          <button 

            onClick={logout}

            style={{

              padding: '0.5rem 1rem',

              background: '#e94560',

              border: 'none',

              borderRadius: '6px',

              color: '#fff',

              cursor: 'pointer',

              transition: 'all 0.3s ease'

            }}

            onMouseEnter={(e) => e.currentTarget.style.background = '#c23653'}

            onMouseLeave={(e) => e.currentTarget.style.background = '#e94560'}

          >

            Logout

          </button>

        </div>

      </nav>



      <div style={{ padding: '2rem' }}>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>

          <button

            onClick={() => setShowModal(true)}

            style={{

              padding: '15px 40px',

              background: 'linear-gradient(135deg, #4ecca3 0%, #2d98da 100%)',

              border: 'none',

              borderRadius: '8px',

              color: '#fff',

              cursor: 'pointer',

              fontWeight: 'bold',

              fontSize: '1.1rem',

              display: 'inline-flex',

              alignItems: 'center',

              gap: '0.75rem',

              transition: 'all 0.3s ease',

              boxShadow: '0 4px 12px rgba(78, 204, 163, 0.3)'

            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.transform = 'translateY(-3px)';

              e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 204, 163, 0.4)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.transform = 'translateY(0)';

              e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 204, 163, 0.3)';

            }}

          >

            <Upload size={24} />

            Upload My Own Files

          </button>

        </div>



        <div style={{ 

          display: 'grid', 

          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 

          gap: '2rem' 

        }}>

          {CATEGORIES.map(cat => (

            <div 

              key={cat}

              style={{

                background: '#16213e',

                borderRadius: '12px',

                padding: '1.5rem',

                border: '2px solid #0f3460',

                minHeight: '300px'

              }}

            >

              <div style={{ 

                display: 'flex', 

                alignItems: 'center', 

                gap: '0.75rem', 

                marginBottom: '1.5rem',

                paddingBottom: '1rem',

                borderBottom: '2px solid #0f3460'

              }}>

                <Folder size={24} style={{ color: '#4ecca3' }} />

                <h2 style={{ margin: 0, color: '#4ecca3', fontSize: '1.3rem' }}>{cat}</h2>

                <span style={{ 

                  marginLeft: 'auto', 

                  background: '#0f3460', 

                  padding: '4px 12px', 

                  borderRadius: '12px',

                  fontSize: '0.85rem',

                  color: '#aaa'

                }}>

                  {files[cat]?.length || 0} files

                </span>

              </div>



              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {loading ? (

                  <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>

                    Loading...

                  </div>

                ) : files[cat]?.length > 0 ? (

                  files[cat].map(file => (

                    <div

                      key={file._id}

                      style={{

                        background: '#0f3460',

                        padding: '1rem',

                        borderRadius: '8px',

                        border: '1px solid #1a4d7a',

                        transition: 'all 0.3s ease'

                      }}

                      onMouseEnter={(e) => {

                        e.currentTarget.style.background = '#1a4d7a';

                        e.currentTarget.style.borderColor = '#4ecca3';

                      }}

                      onMouseLeave={(e) => {

                        e.currentTarget.style.background = '#0f3460';

                        e.currentTarget.style.borderColor = '#1a4d7a';

                      }}

                    >

                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>

                        <File size={20} style={{ color: '#4ecca3', marginTop: '2px' }} />

                        <div style={{ flex: 1, minWidth: 0 }}>

                          <div style={{ 

                            fontWeight: 'bold', 

                            marginBottom: '0.5rem',

                            overflow: 'hidden',

                            textOverflow: 'ellipsis',

                            whiteSpace: 'nowrap'

                          }}>

                            {file.fileName}

                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>

                            {file.originalName && file.originalName !== file.fileName && (

                              <div>Original: {file.originalName}</div>

                            )}

                            <div>Size: {formatFileSize(file.size || 0)}</div>

                            <div>Storage: {file.storageLocation || 'local'}</div>

                            <div>Uploaded: {formatDate(file.createdAt)}</div>

                          </div>

                          

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>

                            <button

                              onClick={() => handleDownload(file._id, file.fileName)}

                              style={{

                                padding: '6px 12px',

                                background: '#2d98da',

                                border: 'none',

                                borderRadius: '4px',

                                color: '#fff',

                                cursor: 'pointer',

                                fontSize: '0.85rem',

                                display: 'flex',

                                alignItems: 'center',

                                gap: '0.5rem',

                                transition: 'all 0.2s ease'

                              }}

                              onMouseEnter={(e) => e.currentTarget.style.background = '#1e7bb8'}

                              onMouseLeave={(e) => e.currentTarget.style.background = '#2d98da'}

                            >

                              <Download size={14} />

                              Download

                            </button>

                            

                            <button

                              onClick={() => handleDelete(file._id, cat)}

                              style={{

                                padding: '6px 12px',

                                background: '#e94560',

                                border: 'none',

                                borderRadius: '4px',

                                color: '#fff',

                                cursor: 'pointer',

                                fontSize: '0.85rem',

                                display: 'flex',

                                alignItems: 'center',

                                gap: '0.5rem',

                                transition: 'all 0.2s ease'

                              }}

                              onMouseEnter={(e) => e.currentTarget.style.background = '#c23653'}

                              onMouseLeave={(e) => e.currentTarget.style.background = '#e94560'}

                            >

                              <Trash2 size={14} />

                              Delete

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  ))

                ) : (

                  <div style={{ 

                    textAlign: 'center', 

                    padding: '2rem', 

                    color: '#aaa',

                    fontSize: '0.9rem'

                  }}>

                    No files uploaded yet

                  </div>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>



      {showModal && (

        <div

          style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            background: 'rgba(0, 0, 0, 0.8)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 1000,

            padding: '2rem'

          }}

          onClick={(e) => {

            if (e.target === e.currentTarget) {

              setShowModal(false);

              resetForm();

            }

          }}

        >

          <div

            style={{

              background: '#16213e',

              borderRadius: '12px',

              padding: '2rem',

              maxWidth: '600px',

              width: '100%',

              maxHeight: '90vh',

              overflowY: 'auto',

              border: '2px solid #0f3460',

              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'

            }}

          >

            <div style={{ 

              display: 'flex', 

              justifyContent: 'space-between', 

              alignItems: 'center', 

              marginBottom: '2rem' 

            }}>

              <h2 style={{ margin: 0, color: '#4ecca3' }}>Upload File</h2>

              <button

                onClick={() => {

                  setShowModal(false);

                  resetForm();

                }}

                style={{

                  background: 'none',

                  border: 'none',

                  color: '#e94560',

                  cursor: 'pointer',

                  padding: '0.5rem',

                  borderRadius: '4px',

                  transition: 'all 0.2s ease'

                }}

                onMouseEnter={(e) => e.currentTarget.style.background = '#0f3460'}

                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}

              >

                <X size={24} />

              </button>

            </div>



            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>

                  File Name *

                </label>

                <input

                  type="text"

                  value={fileName}

                  onChange={(e) => setFileName(e.target.value)}

                  placeholder="Enter file name"

                  style={{

                    width: '100%',

                    padding: '0.75rem',

                    background: '#0f3460',

                    border: '2px solid #1a4d7a',

                    borderRadius: '6px',

                    color: '#fff',

                    fontSize: '1rem',

                    outline: 'none',

                    transition: 'border-color 0.3s ease'

                  }}

                  onFocus={(e) => e.currentTarget.style.borderColor = '#4ecca3'}

                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a4d7a'}

                />

              </div>



              <div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>

                  Browse File

                </label>

                <input

                  type="file"

                  onChange={handleFileSelect}

                  style={{

                    width: '100%',

                    padding: '0.75rem',

                    background: '#0f3460',

                    border: '2px solid #1a4d7a',

                    borderRadius: '6px',

                    color: '#fff',

                    fontSize: '1rem',

                    cursor: 'pointer'

                  }}

                />

                {selectedFile && (

                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#4ecca3' }}>

                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})

                  </div>

                )}

              </div>



              <div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>

                  Or Enter Full File Path

                </label>

                <input

                  type="text"

                  value={filePath}

                  onChange={(e) => setFilePath(e.target.value)}

                  placeholder="/path/to/your/file"

                  style={{

                    width: '100%',

                    padding: '0.75rem',

                    background: '#0f3460',

                    border: '2px solid #1a4d7a',

                    borderRadius: '6px',

                    color: '#fff',

                    fontSize: '1rem',

                    outline: 'none',

                    transition: 'border-color 0.3s ease'

                  }}

                  onFocus={(e) => e.currentTarget.style.borderColor = '#4ecca3'}

                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a4d7a'}

                />

              </div>



              <div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>

                  Storage Location *

                </label>

                <select

                  value={storageLocation}

                  onChange={(e) => setStorageLocation(e.target.value)}

                  style={{

                    width: '100%',

                    padding: '0.75rem',

                    background: '#0f3460',

                    border: '2px solid #1a4d7a',

                    borderRadius: '6px',

                    color: '#fff',

                    fontSize: '1rem',

                    cursor: 'pointer',

                    outline: 'none',

                    transition: 'border-color 0.3s ease'

                  }}

                  onFocus={(e) => e.currentTarget.style.borderColor = '#4ecca3'}

                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a4d7a'}

                >

                  <option value="local">Local Machine</option>

                  <option value="s3">S3 Bucket</option>

                </select>

              </div>



              <div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>

                  Category *

                </label>

                <select

                  value={category}

                  onChange={(e) => setCategory(e.target.value)}

                  style={{

                    width: '100%',

                    padding: '0.75rem',

                    background: '#0f3460',

                    border: '2px solid #1a4d7a',

                    borderRadius: '6px',

                    color: '#fff',

                    fontSize: '1rem',

                    cursor: 'pointer',

                    outline: 'none',

                    transition: 'border-color 0.3s ease'

                  }}

                  onFocus={(e) => e.currentTarget.style.borderColor = '#4ecca3'}

                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a4d7a'}

                >

                  {CATEGORIES.map(cat => (

                    <option key={cat} value={cat}>{cat}</option>

                  ))}

                </select>

              </div>



              <button

                onClick={handleUpload}

                disabled={uploading}

                style={{

                  width: '100%',

                  padding: '1rem',

                  background: uploading ? '#555' : 'linear-gradient(135deg, #4ecca3 0%, #2d98da 100%)',

                  border: 'none',

                  borderRadius: '8px',

                  color: '#fff',

                  cursor: uploading ? 'not-allowed' : 'pointer',

                  fontWeight: 'bold',

                  fontSize: '1.1rem',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  gap: '0.75rem',

                  transition: 'all 0.3s ease',

                  marginTop: '1rem'

                }}

                onMouseEnter={(e) => {

                  if (!uploading) {

                    e.currentTarget.style.transform = 'translateY(-2px)';

                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 204, 163, 0.4)';

                  }

                }}

                onMouseLeave={(e) => {

                  e.currentTarget.style.transform = 'translateY(0)';

                  e.currentTarget.style.boxShadow = 'none';

                }}

              >

                <Upload size={20} />

                {uploading ? 'Uploading...' : 'Upload File'}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}



export default UploadFiles;

