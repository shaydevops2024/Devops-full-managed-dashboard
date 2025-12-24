// backend/routes/tools.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const systemExecutor = require('../utils/systemExecutor');
const logger = require('../utils/logger');

// Check if a specific tool is installed
router.get('/check/:toolName', auth, async (req, res) => {
  try {
    const { toolName } = req.params;
    const result = await systemExecutor.checkToolInstalled(toolName);
    
    // Update user's installed tools
    const toolIndex = req.user.installedTools.findIndex(t => t.name === toolName);
    if (toolIndex >= 0) {
      req.user.installedTools[toolIndex] = {
        name: toolName,
        version: result.version,
        isInstalled: result.installed,
        lastChecked: new Date()
      };
    } else {
      req.user.installedTools.push({
        name: toolName,
        version: result.version,
        isInstalled: result.installed,
        lastChecked: new Date()
      });
    }
    await req.user.save();
    
    res.json(result);
  } catch (error) {
    logger.error('Tool check error:', error);
    res.status(500).json({ error: 'Failed to check tool installation' });
  }
});

// Check all tools
router.get('/check-all', auth, async (req, res) => {
  try {
    const tools = ['docker', 'kubernetes', 'helm', 'terraform', 'ansible', 'jenkins', 'argocd'];
    const results = {};
    
    for (const tool of tools) {
      results[tool] = await systemExecutor.checkToolInstalled(tool);
      
      // Update user's installed tools
      const toolIndex = req.user.installedTools.findIndex(t => t.name === tool);
      if (toolIndex >= 0) {
        req.user.installedTools[toolIndex] = {
          name: tool,
          version: results[tool].version,
          isInstalled: results[tool].installed,
          lastChecked: new Date()
        };
      } else {
        req.user.installedTools.push({
          name: tool,
          version: results[tool].version,
          isInstalled: results[tool].installed,
          lastChecked: new Date()
        });
      }
    }
    
    await req.user.save();
    res.json(results);
  } catch (error) {
    logger.error('Check all tools error:', error);
    res.status(500).json({ error: 'Failed to check tools' });
  }
});

// Get user's installed tools
router.get('/installed', auth, async (req, res) => {
  res.json({ tools: req.user.installedTools });
});

module.exports = router;