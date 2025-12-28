// frontend/src/pages/tools/TerraformGenerator.js - WITH FILENAME POPUP & FOLDER PATH

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check, Rocket, X, FolderOpen, Home, Plus, Minus, GripVertical, ChevronDown, ChevronRight, Play, CheckCircle, AlertTriangle, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Resource library organized by provider and category
const RESOURCE_LIBRARY = {
  aws: {
    name: "AWS",
    provider: "hashicorp/aws",
    categories: {
      "Compute": [
        { name: "aws_instance", label: "EC2 Instance" },
        { name: "aws_launch_template", label: "Launch Template" },
        { name: "aws_autoscaling_group", label: "Auto Scaling Group" },
        { name: "aws_lambda_function", label: "Lambda Function" }
      ],
      "Networking": [
        { name: "aws_vpc", label: "VPC" },
        { name: "aws_subnet", label: "Subnet" },
        { name: "aws_internet_gateway", label: "Internet Gateway" },
        { name: "aws_route_table", label: "Route Table" },
        { name: "aws_security_group", label: "Security Group" }
      ],
      "Storage": [
        { name: "aws_s3_bucket", label: "S3 Bucket" },
        { name: "aws_ebs_volume", label: "EBS Volume" },
        { name: "aws_efs_file_system", label: "EFS File System" }
      ],
      "Database": [
        { name: "aws_db_instance", label: "RDS Instance" },
        { name: "aws_dynamodb_table", label: "DynamoDB Table" },
        { name: "aws_elasticache_cluster", label: "ElastiCache Cluster" }
      ],
      "IAM & Security": [
        { name: "aws_iam_user", label: "IAM User" },
        { name: "aws_iam_role", label: "IAM Role" },
        { name: "aws_iam_policy", label: "IAM Policy" },
        { name: "aws_kms_key", label: "KMS Key" }
      ],
      "Monitoring": [
        { name: "aws_cloudwatch_log_group", label: "CloudWatch Log Group" },
        { name: "aws_cloudwatch_metric_alarm", label: "CloudWatch Alarm" }
      ]
    }
  },
  gcp: {
    name: "GCP",
    provider: "hashicorp/google",
    categories: {
      "Compute": [
        { name: "google_compute_instance", label: "Compute Instance" },
        { name: "google_compute_instance_group", label: "Instance Group" },
        { name: "google_cloudfunctions_function", label: "Cloud Function" }
      ],
      "Networking": [
        { name: "google_compute_network", label: "Network" },
        { name: "google_compute_subnetwork", label: "Subnetwork" },
        { name: "google_compute_firewall", label: "Firewall" }
      ],
      "Storage": [
        { name: "google_storage_bucket", label: "Storage Bucket" },
        { name: "google_filestore_instance", label: "Filestore Instance" }
      ],
      "Database": [
        { name: "google_sql_database_instance", label: "Cloud SQL Instance" },
        { name: "google_spanner_instance", label: "Spanner Instance" }
      ],
      "IAM & Security": [
        { name: "google_project_iam_member", label: "IAM Member" },
        { name: "google_service_account", label: "Service Account" }
      ],
      "Kubernetes": [
        { name: "google_container_cluster", label: "GKE Cluster" },
        { name: "google_container_node_pool", label: "Node Pool" }
      ]
    }
  },
  azure: {
    name: "Azure",
    provider: "hashicorp/azurerm",
    categories: {
      "Compute": [
        { name: "azurerm_virtual_machine", label: "Virtual Machine" },
        { name: "azurerm_linux_virtual_machine", label: "Linux VM" },
        { name: "azurerm_function_app", label: "Function App" }
      ],
      "Networking": [
        { name: "azurerm_virtual_network", label: "Virtual Network" },
        { name: "azurerm_subnet", label: "Subnet" },
        { name: "azurerm_network_security_group", label: "Network Security Group" }
      ],
      "Storage": [
        { name: "azurerm_storage_account", label: "Storage Account" },
        { name: "azurerm_storage_container", label: "Storage Container" }
      ],
      "Database": [
        { name: "azurerm_mssql_server", label: "SQL Server" },
        { name: "azurerm_postgresql_flexible_server", label: "PostgreSQL Server" }
      ],
      "IAM & Security": [
        { name: "azurerm_role_assignment", label: "Role Assignment" },
        { name: "azurerm_key_vault", label: "Key Vault" }
      ],
      "Containers": [
        { name: "azurerm_kubernetes_cluster", label: "AKS Cluster" },
        { name: "azurerm_container_registry", label: "Container Registry" }
      ]
    }
  }
};

// Provider-specific initial blocks
const PROVIDER_INITIAL_BLOCKS = {
  aws: [
    { 
      id: 1, 
      content: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}` 
    },
    { 
      id: 2, 
      content: `provider "aws" {
  region = "us-east-1"
}` 
    },
    { 
      id: 3, 
      content: `resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "MyInstance"
  }
}` 
    }
  ],
  gcp: [
    { 
      id: 1, 
      content: `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}` 
    },
    { 
      id: 2, 
      content: `provider "google" {
  project = "my-project-id"
  region  = "us-central1"
}` 
    },
    { 
      id: 3, 
      content: `resource "google_compute_instance" "example" {
  name         = "my-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
  }
}` 
    }
  ],
  azure: [
    { 
      id: 1, 
      content: `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}` 
    },
    { 
      id: 2, 
      content: `provider "azurerm" {
  features {}
}` 
    },
    { 
      id: 3, 
      content: `resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "East US"
}` 
    }
  ]
};

// Resource templates
const RESOURCE_TEMPLATES = {
  // AWS
  "aws_instance": `resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "MyInstance"
  }
}`,
  "aws_lambda_function": `resource "aws_lambda_function" "example" {
  function_name = "my_function"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  filename      = "lambda.zip"
}`,
  "aws_vpc": `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "main-vpc"
  }
}`,
  "aws_subnet": `resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "main-subnet"
  }
}`,
  "aws_security_group": `resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`,
  "aws_s3_bucket": `resource "aws_s3_bucket" "example" {
  bucket = "my-unique-bucket-name"
  
  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}`,
  "aws_db_instance": `resource "aws_db_instance" "default" {
  allocated_storage    = 10
  db_name              = "mydb"
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = "change_me"
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
}`,
  "aws_iam_role": `resource "aws_iam_role" "example" {
  name = "example_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}`,
  
  // GCP
  "google_compute_instance": `resource "google_compute_instance" "default" {
  name         = "my-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
  }
}`,
  "google_compute_network": `resource "google_compute_network" "vpc_network" {
  name = "my-custom-network"
  auto_create_subnetworks = false
}`,
  "google_storage_bucket": `resource "google_storage_bucket" "default" {
  name          = "my-unique-bucket-name"
  location      = "US"
  force_destroy = true
}`,
  
  // Azure
  "azurerm_virtual_machine": `resource "azurerm_virtual_machine" "example" {
  name                  = "example-vm"
  location              = azurerm_resource_group.example.location
  resource_group_name   = azurerm_resource_group.example.name
  network_interface_ids = [azurerm_network_interface.example.id]
  vm_size               = "Standard_DS1_v2"

  storage_os_disk {
    name              = "myosdisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  os_profile {
    computer_name  = "hostname"
    admin_username = "adminuser"
    admin_password = "Password1234!"
  }
}`,
  "azurerm_virtual_network": `resource "azurerm_virtual_network" "example" {
  name                = "example-network"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
}`,
  "azurerm_storage_account": `resource "azurerm_storage_account" "example" {
  name                     = "examplestorageaccount"
  resource_group_name      = azurerm_resource_group.example.name
  location                 = azurerm_resource_group.example.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}`
};

function TerraformGenerator() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [pendingProvider, setPendingProvider] = useState(null);
  const [showProviderConfirm, setShowProviderConfirm] = useState(false);
  const [showFilenamePopup, setShowFilenamePopup] = useState(false);
  const [filename, setFilename] = useState('main');  // ← YOU WERE MISSING THIS LINE!
  const [showApplyFilenamePopup, setShowApplyFilenamePopup] = useState(false);
  const [applyFilename, setApplyFilename] = useState('main');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [copied, setCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [folderPathCopied, setFolderPathCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showLogsPopup, setShowLogsPopup] = useState(false);
  const [deployLogs, setDeployLogs] = useState([]);
  const [deploySuccess, setDeploySuccess] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activityLog, setActivityLog] = useState([
    { id: 1, message: 'Terraform configuration initialized (AWS)', timestamp: new Date() }
  ]);

  const [terraformBlocks, setTerraformBlocks] = useState(PROVIDER_INITIAL_BLOCKS.aws);



  const TERRAFORM_FOLDER_PATH = '~/Generator/terraform';

  const addToLog = (message) => {
    const newLog = {
      id: Date.now(),
      message,
      timestamp: new Date()
    };
    setActivityLog(prev => [newLog, ...prev].slice(0, 20));
  };

  const generateTerraformConfig = () => {
    return terraformBlocks.map(block => block.content).join('\n\n');
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleProviderChange = (newProvider) => {
    if (newProvider === selectedProvider) return;
    
    setPendingProvider(newProvider);
    setShowProviderConfirm(true);
  };

  const confirmProviderChange = () => {
    const providerName = RESOURCE_LIBRARY[pendingProvider].name;
    
    setTerraformBlocks(PROVIDER_INITIAL_BLOCKS[pendingProvider]);
    setSelectedProvider(pendingProvider);
    
    addToLog(`Provider changed to ${providerName} - configuration reset`);
    toast.success(`Switched to ${providerName}!`);
    
    setShowProviderConfirm(false);
    setPendingProvider(null);
  };

  const cancelProviderChange = () => {
    setShowProviderConfirm(false);
    setPendingProvider(null);
  };

  const addResourceBlock = (resourceName) => {
    const template = RESOURCE_TEMPLATES[resourceName] || `resource "${resourceName}" "example" {\n  # Configure this resource\n}`;
    
    const newBlock = {
      id: Math.max(...terraformBlocks.map(b => b.id), 0) + 1,
      content: template
    };
    
    setTerraformBlocks(prev => [...prev, newBlock]);
    addToLog(`Resource added: ${resourceName}`);
    toast.success(`Added ${resourceName}!`);
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

    const newBlocks = [...terraformBlocks];
    const draggedBlock = newBlocks[draggedIndex];
    
    newBlocks.splice(draggedIndex, 1);
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newBlocks.splice(insertIndex, 0, draggedBlock);
    
    setTerraformBlocks(newBlocks);
    addToLog(`Block dragged from position ${draggedIndex + 1} → ${insertIndex + 1}`);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addBlock = (index) => {
    const newBlocks = [...terraformBlocks];
    const blockToCopy = newBlocks[index];
    const newId = Math.max(...terraformBlocks.map(b => b.id)) + 1;
    const newBlock = { ...blockToCopy, id: newId };
    newBlocks.splice(index + 1, 0, newBlock);
    setTerraformBlocks(newBlocks);
    addToLog('Block duplicated');
    toast.success('Block added!');
  };

  const removeBlock = (index) => {
    if (terraformBlocks.length <= 1) {
      toast.error('Must keep at least one block!');
      return;
    }
    const newBlocks = terraformBlocks.filter((_, i) => i !== index);
    setTerraformBlocks(newBlocks);
    addToLog('Block removed');
    toast.success('Block removed!');
  };

  const updateBlockContent = (index, newContent) => {
    const newBlocks = [...terraformBlocks];
    const oldContent = newBlocks[index].content;
    newBlocks[index].content = newContent;
    setTerraformBlocks(newBlocks);
    if (oldContent !== newContent) {
      addToLog('Block updated');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTerraformConfig());
    setCopied(true);
    addToLog('Configuration copied to clipboard');
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateTerraformConfig()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'main'}.tf`;
    a.click();
    URL.revokeObjectURL(url);
    addToLog('Configuration downloaded');
    toast.success('Configuration downloaded!');
  };

  const handleCopyPath = () => {
  if (filePath) {
    navigator.clipboard.writeText(filePath);
    setPathCopied(true);
    toast.success('Path copied to clipboard!');
    setTimeout(() => setPathCopied(false), 2000);
  }
};

  const handleCopyFolderPath = () => {
    const fullPath = TERRAFORM_FOLDER_PATH.replace('~', process.env.HOME || '/home/user');
    navigator.clipboard.writeText(fullPath);
    setFolderPathCopied(true);
    addToLog('Folder path copied to clipboard');
    toast.success('Folder path copied!');
    setTimeout(() => setFolderPathCopied(false), 2000);
  };

  const handleDeployClick = () => {
    setFilename('main');
    setShowFilenamePopup(true);
  };

  const confirmDeploy = async () => {
    if (!filename.trim()) {
      toast.error('Please enter a filename!');
      return;
    }

    const cleanFilename = filename.trim().replace(/\.tf$/, '');
    
    setShowFilenamePopup(false);
    setDeploying(true);
    setShowLogsPopup(true);
    setDeployLogs([]);
    setDeploySuccess(null);
    setFilePath('');
    addToLog(`Deployment started: ${cleanFilename}.tf`);

    try {
      const response = await api.post('/deploy/terraform', {
        content: generateTerraformConfig(),
        filename: cleanFilename
      });

      setDeployLogs(response.data.logs || []);
      setDeploySuccess(response.data.success);
      setFilePath(response.data.filePath || '');

      if (response.data.success) {
        addToLog(`Deployment successful: ${cleanFilename}.tf`);
        toast.success('Terraform configuration deployed!');
      } else {
        addToLog('Deployment failed');
        toast.error('Deployment failed. Check logs.');
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

  const handlePlan = async () => {
    setPlanning(true);
    setShowLogsPopup(true);
    setDeployLogs([]);
    setDeploySuccess(null);
    addToLog('Running terraform plan...');

    try {
      const response = await api.post('/deploy/terraform-plan', {
        content: generateTerraformConfig()
      });

      setDeployLogs(response.data.logs || []);
      setDeploySuccess(response.data.success);

      if (response.data.success) {
        addToLog('Terraform plan completed');
        toast.success('Terraform plan completed!');
      } else {
        addToLog('Terraform plan failed');
        toast.error('Plan failed. Check logs.');
      }
    } catch (error) {
      console.error('Plan error:', error);
      addToLog(`Plan error: ${error.message}`);
      setDeployLogs([
        { type: 'stderr', message: `Error: ${error.response?.data?.error || error.message}\n`, timestamp: new Date() }
      ]);
      setDeploySuccess(false);
      toast.error('Plan failed!');
    } finally {
      setPlanning(false);
    }
  };

  const handleApply = async () => {
    // Show filename popup first
    setShowApplyFilenamePopup(true);
  };

  const confirmApply = async () => {
    if (!applyFilename || !applyFilename.trim()) {
      toast.error('Please enter a filename!');
      return;
    }

    if (!window.confirm('Are you sure you want to apply this Terraform configuration? This will create/modify real infrastructure!')) {
      setShowApplyFilenamePopup(false);
      return;
    }

    const cleanFilename = applyFilename.trim().replace(/\.tf$/, '');
    
    setShowApplyFilenamePopup(false);
    setApplying(true);
    setShowLogsPopup(true);
    setDeployLogs([]);
    setDeploySuccess(null);
    addToLog(`Running terraform apply for ${cleanFilename}.tf...`);

    try {
      const response = await api.post('/deploy/terraform-apply', {
        content: generateTerraformConfig(),
        filename: cleanFilename
      });

      setDeployLogs(response.data.logs || []);
      setDeploySuccess(response.data.success);

      if (response.data.success) {
        addToLog(`Terraform apply completed: ${cleanFilename}.tf`);
        toast.success('Infrastructure deployed!');
      } else {
        addToLog('Terraform apply failed');
        toast.error('Apply failed. Check logs.');
      }
    } catch (error) {
      console.error('Apply error:', error);
      addToLog(`Apply error: ${error.message}`);
      setDeployLogs([
        { type: 'stderr', message: `Error: ${error.response?.data?.error || error.message}\n`, timestamp: new Date() }
      ]);
      setDeploySuccess(false);
      toast.error('Apply failed!');
    } finally {
      setApplying(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const currentProvider = RESOURCE_LIBRARY[selectedProvider];

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
            <span style={{ fontSize: '2rem' }}>🔧</span>
            <div>
              <h1 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem' }}>
                Terraform Configuration Generator
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
                Create infrastructure as code configurations
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
        maxWidth: '1800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '250px 1fr 1fr',
        gap: '1.5rem'
      }}>
        {/* LEFT: Resource Library */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',
          border: '2px solid #2496ED',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: 'calc(100vh - 180px)',
          overflow: 'auto'
        }}>
          <h2 style={{ margin: 0, color: '#2496ED', fontSize: '1.2rem' }}>Resource Library</h2>
          
          {/* Provider Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem', fontWeight: 'bold' }}>
              🔍 Select Provider
            </label>
            <select 
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                background: '#1a5490', 
                border: '2px solid #2496ED', 
                borderRadius: '6px', 
                color: '#fff', 
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {Object.entries(RESOURCE_LIBRARY).map(([key, provider]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
          </div>

          {/* Resource Categories */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {Object.entries(currentProvider.categories).map(([category, resources]) => (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => toggleCategory(category)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f3460',
                    border: '2px solid #2496ED40',
                    borderRadius: '6px',
                    color: '#2496ED',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1a4d7a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0f3460'}
                >
                  <span>{category}</span>
                  {collapsedCategories[category] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {!collapsedCategories[category] && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {resources.map((resource) => (
                      <button
                        key={resource.name}
                        onClick={() => addResourceBlock(resource.name)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#16213e',
                          border: '1px solid #2496ED20',
                          borderRadius: '4px',
                          color: '#e8f4f8',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2496ED40';
                          e.currentTarget.style.borderColor = '#2496ED';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#16213e';
                          e.currentTarget.style.borderColor = '#2496ED20';
                        }}
                      >
                        {resource.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE: Editor */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',
          border: '2px solid #2496ED',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem' }}>Configuration Editor</h2>

          <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
            💡 Drag blocks to reorder • Click + to duplicate • Click - to remove • Edit blocks directly
          </p>

          {/* Terraform Blocks */}
          <div style={{ 
            flex: 1,
            background: '#1a5490',
            border: '2px solid #2496ED60',
            borderRadius: '8px', 
            padding: '1rem',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {terraformBlocks.map((block, index) => (
                <div 
                  key={block.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, index)} 
                  onDragOver={(e) => handleDragOver(e, index)} 
                  onDragLeave={handleDragLeave} 
                  onDrop={(e) => handleDrop(e, index)} 
                  onDragEnd={handleDragEnd} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.5rem', 
                    padding: '0.75rem', 
                    background: draggedIndex === index ? '#2496ED50' : dragOverIndex === index ? '#4ecca350' : '#2567a8', 
                    borderRadius: '6px', 
                    border: dragOverIndex === index ? '2px dashed #4ecca3' : '2px solid transparent', 
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => removeBlock(index)} 
                      style={{ 
                        background: '#e9456030', 
                        border: '1px solid #e94560', 
                        borderRadius: '4px', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        flexShrink: 0
                      }} 
                    >
                      <Minus size={14} color="#fff" />
                    </button>
                    
                    <div style={{ color: '#8ab4f8', cursor: 'grab', flexShrink: 0 }}>
                      <GripVertical size={16} />
                    </div>
                    
                    <span style={{ flex: 1, color: '#4ecca3', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Block {index + 1}
                    </span>

                    <button 
                      onClick={() => addBlock(index)} 
                      style={{ 
                        background: '#4ecca330', 
                        border: '1px solid #4ecca3', 
                        borderRadius: '4px', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        flexShrink: 0
                      }} 
                    >
                      <Plus size={14} color="#fff" />
                    </button>
                  </div>

                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(index, e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      background: '#16213e',
                      border: '2px solid #2496ED40',
                      borderRadius: '6px',
                      color: '#e8f4f8',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.9rem',
                      padding: '0.75rem',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2496ED'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#2496ED40'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <button onClick={handleCopy} style={{ padding: '0.75rem', background: '#2496ED', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownload} style={{ padding: '0.75rem', background: '#4ecca3', border: 'none', borderRadius: '6px', color: '#1a1a2e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <Download size={16} />Download
              </button>
              <button onClick={handleCopyFolderPath} style={{ padding: '0.75rem', background: folderPathCopied ? '#4ecca3' : '#9c27b0', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {folderPathCopied ? <Check size={16} /> : <Folder size={16} />}
                {folderPathCopied ? 'Copied!' : 'Folder'}
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button onClick={handleDeployClick} disabled={deploying} style={{ padding: '0.75rem', background: deploying ? '#666' : '#ffa726', border: 'none', borderRadius: '6px', color: '#fff', cursor: deploying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>
                <Rocket size={16} />
                {deploying ? 'Deploying...' : 'Deploy & Save'}
              </button>
              <button onClick={handlePlan} disabled={planning} style={{ padding: '0.75rem', background: planning ? '#666' : '#9c27b0', border: 'none', borderRadius: '6px', color: '#fff', cursor: planning ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>
                <Play size={16} />
                {planning ? 'Planning...' : 'Plan'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={handleApply} disabled={applying} style={{ padding: '0.75rem 2rem', background: applying ? '#666' : '#e94560', border: 'none', borderRadius: '6px', color: '#fff', cursor: applying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', minWidth: '200px' }}>
                <CheckCircle size={16} />
                {applying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Preview & Log */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)', border: '2px solid #2496ED', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ margin: '0 0 1rem 0', color: '#2496ED', fontSize: '1.5rem' }}>📋 Generated Configuration</h2>
            <pre style={{ background: '#0f3460', border: '2px solid #2496ED40', borderRadius: '8px', padding: '1rem', overflow: 'auto', fontFamily: "'Courier New', monospace", fontSize: '0.9rem', lineHeight: '1.6', color: '#4ecca3', margin: 0, maxHeight: '400px' }}>{generateTerraformConfig()}</pre>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2496ED', fontSize: '1.2rem' }}>📝 Activity Log</h3>
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

      {/* Filename Input Popup */}
      {showFilenamePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#16213e', border: '3px solid #2496ED', borderRadius: '12px', padding: '2rem', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#2496ED', fontSize: '1.5rem' }}>Enter Filename</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem' }}>
                Filename (without .tf extension)
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="main"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && confirmDeploy()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#1a5490',
                  border: '2px solid #2496ED',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <p style={{ margin: '0.5rem 0 0 0', color: '#aaa', fontSize: '0.85rem' }}>
                File will be saved as: <strong style={{ color: '#4ecca3' }}>{filename || 'main'}.tf</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFilenamePopup(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeploy}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ffa726',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Deploy & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Filename Input Popup */}
      {showApplyFilenamePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#16213e', border: '3px solid #e94560', borderRadius: '12px', padding: '2rem', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e94560', fontSize: '1.5rem' }}>Apply Terraform Configuration</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem' }}>
                Filename (without .tf extension)
              </label>
              <input
                type="text"
                value={applyFilename}
                onChange={(e) => setApplyFilename(e.target.value)}
                placeholder="main"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && confirmApply()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#8b1a2e',
                  border: '2px solid #e94560',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <p style={{ margin: '0.5rem 0 0 0', color: '#aaa', fontSize: '0.85rem' }}>
                File will be created/updated as: <strong style={{ color: '#4ecca3' }}>{applyFilename || 'main'}.tf</strong>
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#ffa726', fontSize: '0.85rem', fontWeight: 'bold' }}>
                ⚠️ This will provision REAL infrastructure!
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowApplyFilenamePopup(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmApply}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e94560',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Change Confirmation Dialog */}
      {showProviderConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#16213e', border: '3px solid #ffa726', borderRadius: '12px', padding: '2rem', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <AlertTriangle size={32} color="#ffa726" />
              <h3 style={{ margin: 0, color: '#ffa726', fontSize: '1.5rem' }}>Change Provider?</h3>
            </div>
            
            <p style={{ color: '#ddd', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Changing to <strong style={{ color: '#4ecca3' }}>{RESOURCE_LIBRARY[pendingProvider]?.name}</strong> will reset your configuration. All current blocks will be replaced with the default {RESOURCE_LIBRARY[pendingProvider]?.name} template.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelProviderChange}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmProviderChange}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ffa726',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                OK, Reset Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Popup */}
      {showLogsPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#16213e', border: '3px solid #2496ED', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '2px solid #2496ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#2496ED', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Rocket size={24} />Terraform Logs
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
              <button onClick={() => setShowLogsPopup(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto', background: '#0a0a0a', fontFamily: "'Courier New', monospace", fontSize: '0.9rem' }}>
              {deployLogs.length === 0 && (deploying || planning || applying) && (<div style={{ color: '#4ecca3' }}>⚙️ Processing...</div>)}
              {deployLogs.map((log, index) => (
                <div key={index} style={{ color: log.type === 'stderr' ? '#e74c3c' : '#4ecca3', marginBottom: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>{log.message}</div>
              ))}
            </div>

            {!deploying && !planning && !applying && deploySuccess !== null && (
              <div style={{ padding: '1.5rem', borderTop: '2px solid #2496ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)' }}>
                <div style={{ color: deploySuccess ? '#4ecca3' : '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {deploySuccess ? '✓ Success!' : '✗ Failed'}
                </div>
                <button onClick={() => setShowLogsPopup(false)} style={{ padding: '0.75rem 1.5rem', background: '#2496ED', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TerraformGenerator;