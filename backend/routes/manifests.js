// backend/routes/manifests.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Manifest = require('../models/Manifest');
const manifestGenerator = require('../utils/manifestGenerator');
const logger = require('../utils/logger');

// Generate manifest
router.post('/generate', auth, async (req, res) => {
  try {
    const { type, subType, name, parameters } = req.body;
    
    let content;
    
    switch (type) {
      case 'docker':
        content = manifestGenerator.generateDockerfile(parameters);
        break;
      case 'kubernetes':
        switch (subType) {
          case 'deployment':
            content = manifestGenerator.generateKubernetesDeployment(parameters);
            break;
          case 'service':
            content = manifestGenerator.generateKubernetesService(parameters);
            break;
          case 'configmap':
            content = manifestGenerator.generateKubernetesConfigMap(parameters);
            break;
          case 'secret':
            content = manifestGenerator.generateKubernetesSecret(parameters);
            break;
          case 'ingress':
            content = manifestGenerator.generateKubernetesIngress(parameters);
            break;
          default:
            return res.status(400).json({ error: 'Invalid Kubernetes resource type' });
        }
        break;
      case 'terraform':
        content = manifestGenerator.generateTerraformMain(parameters);
        break;
      case 'helm':
        if (subType === 'chart') {
          content = manifestGenerator.generateHelmChart(parameters);
        } else if (subType === 'values') {
          content = manifestGenerator.generateHelmValues(parameters);
        }
        break;
      case 'ansible':
        content = manifestGenerator.generateAnsiblePlaybook(parameters);
        break;
      case 'jenkins':
        content = manifestGenerator.generateJenkinsfile(parameters);
        break;
      case 'argocd':
        content = manifestGenerator.generateArgoCD(parameters);
        break;
      case 'compose':
        content = manifestGenerator.generateDockerCompose(parameters);
        break;
      default:
        return res.status(400).json({ error: 'Invalid manifest type' });
    }
    
    // Save manifest to database
    const manifest = new Manifest({
      userId: req.user._id,
      name,
      type,
      subType,
      content,
      parameters
    });
    
    await manifest.save();
    
    logger.info(`Manifest generated: ${type} - ${name} by ${req.user.username}`);
    res.status(201).json({ manifest });
  } catch (error) {
    logger.error('Generate manifest error:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// Get all user manifests
router.get('/', auth, async (req, res) => {
  try {
    const { type, subType } = req.query;
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (subType) query.subType = subType;
    
    const manifests = await Manifest.find(query).sort({ createdAt: -1 });
    res.json({ manifests });
  } catch (error) {
    logger.error('Get manifests error:', error);
    res.status(500).json({ error: 'Failed to get manifests' });
  }
});

// Get single manifest
router.get('/:id', auth, async (req, res) => {
  try {
    const manifest = await Manifest.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }
    
    res.json({ manifest });
  } catch (error) {
    logger.error('Get manifest error:', error);
    res.status(500).json({ error: 'Failed to get manifest' });
  }
});

// Update manifest
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, content, parameters, tags } = req.body;
    
    const manifest = await Manifest.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }
    
    if (name) manifest.name = name;
    if (content) manifest.content = content;
    if (parameters) manifest.parameters = parameters;
    if (tags) manifest.tags = tags;
    manifest.lastModified = new Date();
    
    await manifest.save();
    
    logger.info(`Manifest updated: ${manifest._id} by ${req.user.username}`);
    res.json({ manifest });
  } catch (error) {
    logger.error('Update manifest error:', error);
    res.status(500).json({ error: 'Failed to update manifest' });
  }
});

// Delete manifest
router.delete('/:id', auth, async (req, res) => {
  try {
    const manifest = await Manifest.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }
    
    logger.info(`Manifest deleted: ${manifest._id} by ${req.user.username}`);
    res.json({ message: 'Manifest deleted successfully' });
  } catch (error) {
    logger.error('Delete manifest error:', error);
    res.status(500).json({ error: 'Failed to delete manifest' });
  }
});

// Get manifest templates (predefined examples)
router.get('/templates/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    const templates = {
      docker: {
        basic: {
          baseImage: 'ubuntu:latest',
          workdir: '/app',
          expose: [80],
          commands: ['apt-get update', 'apt-get install -y nginx']
        },
        node: {
          baseImage: 'node:18',
          workdir: '/app',
          copyFiles: [{ source: 'package*.json', destination: './' }, { source: '.', destination: './' }],
          commands: ['npm install'],
          expose: [3000],
          entrypoint: '["npm", "start"]'
        }
      },
      kubernetes: {
        deployment: {
          name: 'app',
          replicas: 3,
          image: 'nginx:latest',
          containerPort: 80
        },
        service: {
          name: 'app-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80
        }
      }
    };
    
    res.json({ templates: templates[type] || {} });
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

module.exports = router;