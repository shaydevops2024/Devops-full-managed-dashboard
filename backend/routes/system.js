// backend/routes/system.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const systemExecutor = require('../utils/systemExecutor');
const logger = require('../utils/logger');

// Get system information
router.get('/info', auth, async (req, res) => {
  try {
    const info = await systemExecutor.getSystemInfo();
    res.json(info);
  } catch (error) {
    logger.error('Get system info error:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Execute custom command (admin only for security)
router.post('/execute', auth, async (req, res) => {
  try {
    // Only allow for admin users in production
    if (process.env.NODE_ENV === 'production' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await systemExecutor.executeCommand(command);
    logger.info(`Command executed: ${command} by ${req.user.username}`);
    res.json(result);
  } catch (error) {
    logger.error('Execute command error:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

// Check hosts file
router.get('/hosts', auth, async (req, res) => {
  try {
    const hostsPath = process.env.HOSTS_FILE_PATH || '/etc/hosts';
    const result = await systemExecutor.executeCommand(`cat ${hostsPath}`);
    
    if (result.success) {
      res.json({ content: result.output });
    } else {
      res.status(500).json({ error: 'Failed to read hosts file' });
    }
  } catch (error) {
    logger.error('Read hosts file error:', error);
    res.status(500).json({ error: 'Failed to read hosts file' });
  }
});

module.exports = router;