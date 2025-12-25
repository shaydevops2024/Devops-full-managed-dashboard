
// /home/shayg/open-source-contribute/Devops-full-managed-dashboard/backend/routes/docker.js

const express = require('express');

const router = express.Router();

const Docker = require('dockerode');

const { exec } = require('child_process');

const { promisify } = require('util');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');



const execAsync = promisify(exec);

const docker = new Docker();



// Get all containers (both running and stopped, but only recent ones)

router.get('/containers', auth, async (req, res) => {

  try {

    // Get all containers including stopped ones

    const containers = await docker.listContainers({ all: true });

    

    // Filter out very old exited containers (older than 7 days)

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    const recentContainers = containers.filter(container => {

      // Keep running containers

      if (container.State === 'running') return true;

      // Keep recently stopped containers

      return container.Created > sevenDaysAgo;

    });

    

    const containerDetails = await Promise.all(

      recentContainers.map(async (container) => {

        try {

          const containerInfo = docker.getContainer(container.Id);

          const stats = await containerInfo.inspect();

          

          return {

            id: container.Id,

            shortId: container.Id.substring(0, 12),

            name: container.Names[0].replace('/', ''),

            image: container.Image,

            state: container.State,

            status: container.Status,

            ports: container.Ports,

            created: container.Created,

            isRunning: container.State === 'running',

            labels: container.Labels,

            networks: Object.keys(stats.NetworkSettings.Networks || {}),

          };

        } catch (error) {

          logger.error('Error getting container details:', error);

          return {

            id: container.Id,

            name: container.Names[0].replace('/', ''),

            error: 'Could not fetch details'

          };

        }

      })

    );



    // Sort by running first, then by creation date

    containerDetails.sort((a, b) => {

      if (a.isRunning && !b.isRunning) return -1;

      if (!a.isRunning && b.isRunning) return 1;

      return b.created - a.created;

    });



    res.json({ containers: containerDetails });

  } catch (error) {

    logger.error('Get containers error:', error);

    res.status(500).json({ error: 'Failed to fetch containers' });

  }

});



// Get Docker Compose services

router.get('/compose/services', auth, async (req, res) => {

  try {

    const containers = await docker.listContainers({ all: true });

    

    const composeServices = containers

      .filter(c => c.Labels && (c.Labels['com.docker.compose.project'] || c.Labels['com.docker.compose.service']))

      .map(container => ({

        id: container.Id,

        shortId: container.Id.substring(0, 12),

        name: container.Names[0].replace('/', ''),

        service: container.Labels['com.docker.compose.service'],

        project: container.Labels['com.docker.compose.project'],

        image: container.Image,

        state: container.State,

        status: container.Status,

        isRunning: container.State === 'running',

      }));



    res.json({ services: composeServices });

  } catch (error) {

    logger.error('Get compose services error:', error);

    res.status(500).json({ error: 'Failed to fetch compose services' });

  }

});



// Start a container

router.post('/containers/:id/start', auth, async (req, res) => {

  try {

    const { id } = req.params;

    const container = docker.getContainer(id);

    

    await container.start();

    logger.info(`Container started: ${id}`);

    

    res.json({ message: 'Container started successfully', id });

  } catch (error) {

    logger.error('Start container error:', error);

    res.status(500).json({ error: error.message || 'Failed to start container' });

  }

});



// Stop a container

router.post('/containers/:id/stop', auth, async (req, res) => {

  try {

    const { id } = req.params;

    const container = docker.getContainer(id);

    

    await container.stop();

    logger.info(`Container stopped: ${id}`);

    

    res.json({ message: 'Container stopped successfully', id });

  } catch (error) {

    logger.error('Stop container error:', error);

    res.status(500).json({ error: error.message || 'Failed to stop container' });

  }

});



// Restart a container

router.post('/containers/:id/restart', auth, async (req, res) => {

  try {

    const { id } = req.params;

    const container = docker.getContainer(id);

    

    await container.restart();

    logger.info(`Container restarted: ${id}`);

    

    res.json({ message: 'Container restarted successfully', id });

  } catch (error) {

    logger.error('Restart container error:', error);

    res.status(500).json({ error: error.message || 'Failed to restart container' });

  }

});



// Get container logs

router.get('/containers/:id/logs', auth, async (req, res) => {

  try {

    const { id } = req.params;

    const { tail = '100', follow = 'false' } = req.query;

    

    const container = docker.getContainer(id);

    

    if (follow === 'true') {

      const logStream = await container.logs({

        follow: true,

        stdout: true,

        stderr: true,

        tail: parseInt(tail)

      });



      res.setHeader('Content-Type', 'text/plain');

      res.setHeader('Transfer-Encoding', 'chunked');

      

      logStream.on('data', (chunk) => {

        res.write(chunk.toString('utf8'));

      });



      logStream.on('end', () => {

        res.end();

      });



      req.on('close', () => {

        logStream.destroy();

      });

    } else {

      const logs = await container.logs({

        stdout: true,

        stderr: true,

        tail: parseInt(tail)

      });



      res.json({ logs: logs.toString('utf8') });

    }

  } catch (error) {

    logger.error('Get container logs error:', error);

    res.status(500).json({ error: 'Failed to fetch container logs' });

  }

});



// Check Docker installation

router.get('/check', auth, async (req, res) => {

  try {

    const version = await docker.version();

    res.json({ 

      installed: true, 

      version: version.Version,

      apiVersion: version.ApiVersion 

    });

  } catch (error) {

    res.json({ installed: false, error: error.message });

  }

});



module.exports = router;

