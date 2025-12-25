
// /home/claude/devops-dashboard/backend/routes/manifests.js

const express = require('express');

const router = express.Router();

const Manifest = require('../models/Manifest');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');

const {

  generateDockerCompose,

  generateKubernetesDeployment,

  generateAnsiblePlaybook,

  generateTerraformConfig

} = require('../utils/manifestGenerator');



router.post('/generate', auth, async (req, res) => {

  try {

    const { type, config, name, description, tags } = req.body;



    let content;

    switch (type) {

      case 'docker':

        content = generateDockerCompose(config);

        break;

      case 'kubernetes':

        content = generateKubernetesDeployment(config);

        break;

      case 'ansible':

        content = generateAnsiblePlaybook(config);

        break;

      case 'terraform':

        content = generateTerraformConfig(config);

        break;

      default:

        return res.status(400).json({ error: 'Invalid manifest type' });

    }



    const manifest = new Manifest({

      name: name || `${type}-manifest-${Date.now()}`,

      type,

      content,

      description,

      tags,

      createdBy: req.user._id

    });



    await manifest.save();



    logger.info(`Manifest generated: ${manifest.name}`);



    res.status(201).json({ 

      message: 'Manifest generated successfully',

      manifest 

    });

  } catch (error) {

    logger.error('Generate manifest error:', error);

    res.status(500).json({ error: 'Failed to generate manifest' });

  }

});



router.get('/', auth, async (req, res) => {

  try {

    const { type, search, limit = 50, page = 1 } = req.query;

    

    const query = { createdBy: req.user._id };

    if (type) query.type = type;

    if (search) {

      query.$or = [

        { name: new RegExp(search, 'i') },

        { description: new RegExp(search, 'i') }

      ];

    }



    const manifests = await Manifest.find(query)

      .sort({ createdAt: -1 })

      .limit(parseInt(limit))

      .skip((parseInt(page) - 1) * parseInt(limit));



    const total = await Manifest.countDocuments(query);



    res.json({ 

      manifests,

      pagination: {

        total,

        page: parseInt(page),

        pages: Math.ceil(total / parseInt(limit))

      }

    });

  } catch (error) {

    logger.error('Get manifests error:', error);

    res.status(500).json({ error: 'Failed to fetch manifests' });

  }

});



router.get('/:id', auth, async (req, res) => {

  try {

    const manifest = await Manifest.findOne({

      _id: req.params.id,

      createdBy: req.user._id

    });



    if (!manifest) {

      return res.status(404).json({ error: 'Manifest not found' });

    }



    res.json({ manifest });

  } catch (error) {

    logger.error('Get manifest error:', error);

    res.status(500).json({ error: 'Failed to fetch manifest' });

  }

});



router.put('/:id', auth, async (req, res) => {

  try {

    const { name, content, description, tags } = req.body;

    

    const manifest = await Manifest.findOne({

      _id: req.params.id,

      createdBy: req.user._id

    });



    if (!manifest) {

      return res.status(404).json({ error: 'Manifest not found' });

    }



    if (name) manifest.name = name;

    if (content) manifest.content = content;

    if (description) manifest.description = description;

    if (tags) manifest.tags = tags;



    await manifest.save();



    logger.info(`Manifest updated: ${manifest.name}`);



    res.json({ 

      message: 'Manifest updated successfully',

      manifest 

    });

  } catch (error) {

    logger.error('Update manifest error:', error);

    res.status(500).json({ error: 'Failed to update manifest' });

  }

});



router.delete('/:id', auth, async (req, res) => {

  try {

    const manifest = await Manifest.findOneAndDelete({

      _id: req.params.id,

      createdBy: req.user._id

    });



    if (!manifest) {

      return res.status(404).json({ error: 'Manifest not found' });

    }



    logger.info(`Manifest deleted: ${manifest.name}`);



    res.json({ message: 'Manifest deleted successfully' });

  } catch (error) {

    logger.error('Delete manifest error:', error);

    res.status(500).json({ error: 'Failed to delete manifest' });

  }

});



router.get('/templates/:type', auth, async (req, res) => {

  try {

    const { type } = req.params;

    

    const templates = {

      docker: {

        basic: { services: [{ name: 'app', image: 'nginx:latest', ports: ['80:80'] }] },

        database: { services: [{ name: 'postgres', image: 'postgres:15', environment: { POSTGRES_PASSWORD: 'password' } }] }

      },

      kubernetes: {

        deployment: { name: 'myapp', image: 'nginx:latest', replicas: 3, port: 80 },

        service: { name: 'myapp-service', port: 80, targetPort: 80 }

      },

      ansible: {

        install: { name: 'Install packages', hosts: 'all', tasks: [{ name: 'Install nginx', module: 'apt', params: { name: 'nginx', state: 'present' } }] }

      },

      terraform: {

        ec2: { provider: 'aws', resources: [{ type: 'aws_instance', name: 'example', config: { ami: 'ami-12345678', instance_type: 't2.micro' } }] }

      }

    };



    res.json({ templates: templates[type] || {} });

  } catch (error) {

    logger.error('Get templates error:', error);

    res.status(500).json({ error: 'Failed to fetch templates' });

  }

});



module.exports = router;

