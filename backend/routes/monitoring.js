// backend/routes/monitoring.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const systemExecutor = require('../utils/systemExecutor');
const logger = require('../utils/logger');

// Get Docker containers status
router.get('/docker/containers', auth, async (req, res) => {
  try {
    const containers = await systemExecutor.getDockerContainers();
    res.json({ containers });
  } catch (error) {
    logger.error('Get Docker containers error:', error);
    res.status(500).json({ error: 'Failed to get Docker containers' });
  }
});

// Get Docker container logs
router.get('/docker/containers/:id/logs', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { lines = 100 } = req.query;
    
    const result = await systemExecutor.executeCommand(`docker logs --tail ${lines} ${id}`);
    
    if (result.success) {
      res.json({ logs: result.output });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Get container logs error:', error);
    res.status(500).json({ error: 'Failed to get container logs' });
  }
});

// Get Kubernetes pods
router.get('/kubernetes/pods', auth, async (req, res) => {
  try {
    const pods = await systemExecutor.getKubernetesPods();
    res.json({ pods });
  } catch (error) {
    logger.error('Get Kubernetes pods error:', error);
    res.status(500).json({ error: 'Failed to get Kubernetes pods' });
  }
});

// Get Kubernetes pod logs
router.get('/kubernetes/pods/:namespace/:name/logs', auth, async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const { lines = 100, container } = req.query;
    
    let command = `kubectl logs -n ${namespace} ${name} --tail=${lines}`;
    if (container) {
      command += ` -c ${container}`;
    }
    
    const result = await systemExecutor.executeCommand(command);
    
    if (result.success) {
      res.json({ logs: result.output });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Get pod logs error:', error);
    res.status(500).json({ error: 'Failed to get pod logs' });
  }
});

// Get Kubernetes services
router.get('/kubernetes/services', auth, async (req, res) => {
  try {
    const result = await systemExecutor.executeCommand('kubectl get services --all-namespaces -o json');
    
    if (result.success) {
      const services = JSON.parse(result.output);
      res.json({ services });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Get Kubernetes services error:', error);
    res.status(500).json({ error: 'Failed to get Kubernetes services' });
  }
});

// Get Kubernetes nodes
router.get('/kubernetes/nodes', auth, async (req, res) => {
  try {
    const result = await systemExecutor.executeCommand('kubectl get nodes -o json');
    
    if (result.success) {
      const nodes = JSON.parse(result.output);
      res.json({ nodes });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Get Kubernetes nodes error:', error);
    res.status(500).json({ error: 'Failed to get Kubernetes nodes' });
  }
});

// Get system service status
router.get('/services/:serviceName', auth, async (req, res) => {
  try {
    const { serviceName } = req.params;
    const status = await systemExecutor.getServiceStatus(serviceName);
    res.json(status);
  } catch (error) {
    logger.error('Get service status error:', error);
    res.status(500).json({ error: 'Failed to get service status' });
  }
});

// Get real-time system metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    const si = require('systeminformation');
    
    const [currentLoad, mem, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats()
    ]);

    res.json({
      cpu: {
        usage: currentLoad.currentLoad.toFixed(2),
        cores: currentLoad.cpus.map(cpu => ({
          usage: cpu.load.toFixed(2)
        }))
      },
      memory: {
        total: Math.round(mem.total / 1024 / 1024 / 1024), // GB
        used: Math.round(mem.used / 1024 / 1024 / 1024), // GB
        free: Math.round(mem.free / 1024 / 1024 / 1024), // GB
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      network: networkStats.map(stat => ({
        interface: stat.iface,
        rx: stat.rx_sec,
        tx: stat.tx_sec
      }))
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

// Start real-time monitoring (WebSocket)
router.post('/start-realtime', auth, (req, res) => {
  const io = req.app.get('io');
  const userId = req.user._id.toString();
  
  // Create monitoring interval
  const interval = setInterval(async () => {
    try {
      const si = require('systeminformation');
      const [currentLoad, mem] = await Promise.all([
        si.currentLoad(),
        si.mem()
      ]);

      io.emit(`monitoring:${userId}`, {
        cpu: currentLoad.currentLoad.toFixed(2),
        memory: ((mem.used / mem.total) * 100).toFixed(2),
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Real-time monitoring error:', error);
    }
  }, 5000); // Update every 5 seconds

  // Store interval ID (in production, use Redis or similar)
  req.app.set(`monitoring:${userId}`, interval);

  res.json({ message: 'Real-time monitoring started' });
});

// Stop real-time monitoring
router.post('/stop-realtime', auth, (req, res) => {
  const userId = req.user._id.toString();
  const interval = req.app.get(`monitoring:${userId}`);
  
  if (interval) {
    clearInterval(interval);
    req.app.set(`monitoring:${userId}`, null);
  }

  res.json({ message: 'Real-time monitoring stopped' });
});

module.exports = router;