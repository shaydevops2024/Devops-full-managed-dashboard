
// /home/claude/devops-dashboard/backend/routes/monitoring.js

const express = require('express');

const router = express.Router();

const Docker = require('dockerode');

const si = require('systeminformation');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');



const docker = new Docker();



router.get('/docker/containers', auth, async (req, res) => {

  try {

    const containers = await docker.listContainers({ all: true });

    

    const containerDetails = containers.map(container => ({

      id: container.Id,

      name: container.Names[0].replace('/', ''),

      image: container.Image,

      state: container.State,

      status: container.Status,

      ports: container.Ports,

      created: container.Created

    }));



    res.json({ containers: containerDetails });

  } catch (error) {

    logger.error('Get containers error:', error);

    res.status(500).json({ error: 'Failed to fetch containers' });

  }

});



router.get('/docker/containers/:id/logs', auth, async (req, res) => {

  try {

    const { id } = req.params;

    const { lines = 100 } = req.query;

    

    const container = docker.getContainer(id);

    const logs = await container.logs({

      stdout: true,

      stderr: true,

      tail: parseInt(lines)

    });



    res.json({ logs: logs.toString('utf8') });

  } catch (error) {

    logger.error('Get container logs error:', error);

    res.status(500).json({ error: 'Failed to fetch container logs' });

  }

});



router.get('/metrics', auth, async (req, res) => {

  try {

    const [cpu, mem, currentLoad, processes, disk] = await Promise.all([

      si.cpu(),

      si.mem(),

      si.currentLoad(),

      si.processes(),

      si.fsSize()

    ]);



    res.json({

      cpu: {

        usage: currentLoad.currentLoad,

        cores: cpu.cores,

        speed: cpu.speed

      },

      memory: {

        total: mem.total,

        used: mem.used,

        free: mem.free,

        usagePercent: (mem.used / mem.total) * 100

      },

      processes: {

        all: processes.all,

        running: processes.running,

        blocked: processes.blocked

      },

      disk: disk.map(d => ({

        fs: d.fs,

        size: d.size,

        used: d.used,

        available: d.available,

        usagePercent: d.use

      }))

    });

  } catch (error) {

    logger.error('Get metrics error:', error);

    res.status(500).json({ error: 'Failed to fetch metrics' });

  }

});



router.get('/kubernetes/pods', auth, async (req, res) => {

  try {

    res.json({ 

      pods: [],

      message: 'Kubernetes integration not configured'

    });

  } catch (error) {

    logger.error('Get pods error:', error);

    res.status(500).json({ error: 'Failed to fetch pods' });

  }

});



router.get('/kubernetes/services', auth, async (req, res) => {

  try {

    res.json({ 

      services: [],

      message: 'Kubernetes integration not configured'

    });

  } catch (error) {

    logger.error('Get services error:', error);

    res.status(500).json({ error: 'Failed to fetch services' });

  }

});



router.get('/kubernetes/nodes', auth, async (req, res) => {

  try {

    res.json({ 

      nodes: [],

      message: 'Kubernetes integration not configured'

    });

  } catch (error) {

    logger.error('Get nodes error:', error);

    res.status(500).json({ error: 'Failed to fetch nodes' });

  }

});



router.post('/start-realtime', auth, async (req, res) => {

  try {

    const io = req.app.get('io');

    

    const interval = setInterval(async () => {

      try {

        const [currentLoad, mem] = await Promise.all([

          si.currentLoad(),

          si.mem()

        ]);



        io.emit('metrics-update', {

          cpu: currentLoad.currentLoad,

          memory: (mem.used / mem.total) * 100,

          timestamp: new Date()

        });

      } catch (error) {

        logger.error('Real-time metrics error:', error);

      }

    }, 2000);



    req.app.set('metricsInterval', interval);



    res.json({ message: 'Real-time monitoring started' });

  } catch (error) {

    logger.error('Start monitoring error:', error);

    res.status(500).json({ error: 'Failed to start monitoring' });

  }

});



router.post('/stop-realtime', auth, async (req, res) => {

  try {

    const interval = req.app.get('metricsInterval');

    if (interval) {

      clearInterval(interval);

      req.app.set('metricsInterval', null);

    }



    res.json({ message: 'Real-time monitoring stopped' });

  } catch (error) {

    logger.error('Stop monitoring error:', error);

    res.status(500).json({ error: 'Failed to stop monitoring' });

  }

});



module.exports = router;

