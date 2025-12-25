
// /home/shayg/open-source-contribute/Devops-full-managed-dashboard/backend/routes/tools.js

const express = require('express');

const router = express.Router();

const { exec } = require('child_process');

const { promisify } = require('util');

const fs = require('fs');

const Docker = require('dockerode');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');



const execAsync = promisify(exec);

const docker = new Docker();



const checkToolInstalled = async (toolName) => {

  // Special handling for Docker - check socket access

  if (toolName === 'docker') {

    try {

      await docker.ping();

      return true;

    } catch {

      return false;

    }

  }

  

  // Special handling for kubectl - check regular first, then minikube

  if (toolName === 'kubectl') {

    // First check for regular kubectl (not the minikube alias)

    const hostPaths = [

      `/host/snap/bin/kubectl`,

      `/host/usr/local/bin/kubectl`,

      `/host/usr/bin/kubectl`,

      `/host/bin/kubectl`,

    ];

    

    for (const p of hostPaths) {

      try {

        await fs.promises.access(p, fs.constants.X_OK);

        // Make sure it's not just a symlink to minikube

        const { stdout } = await execAsync(`${p} version --client --short 2>&1`, { timeout: 5000 });

        if (stdout && !stdout.includes('command not found')) {

          logger.info(`Found regular kubectl at ${p}`);

          return true;

        }

      } catch {

        // Continue

      }

    }

    

    // If regular kubectl not found, check for minikube

    const minikubePaths = [

      `/host/snap/bin/minikube`,

      `/host/usr/local/bin/minikube`,

      `/host/usr/bin/minikube`,

      `/host/bin/minikube`,

    ];

    

    for (const p of minikubePaths) {

      try {

        await fs.promises.access(p, fs.constants.X_OK);

        logger.info(`Found minikube at ${p}, using for kubectl`);

        return true;

      } catch {

        // Continue

      }

    }

    

    return false;

  }

  

  // For other tools, check standard paths

  const hostPaths = [

    `/host/snap/bin/${toolName}`,

    `/host/usr/local/bin/${toolName}`,

    `/host/usr/bin/${toolName}`,

    `/host/bin/${toolName}`,

  ];

  

  for (const p of hostPaths) {

    try {

      await fs.promises.access(p, fs.constants.X_OK);

      logger.info(`Found ${toolName} at ${p}`);

      return true;

    } catch {

      // Continue

    }

  }

  

  logger.warn(`${toolName} not found in any standard path`);

  return false;

};



const getToolVersion = async (toolName) => {

  if (toolName === 'docker') {

    try {

      const info = await docker.version();

      return info.Version;

    } catch {

      return null;

    }

  }

  

  // Special handling for kubectl

  if (toolName === 'kubectl') {

    // First try regular kubectl

    const kubectlPaths = [

      `/host/snap/bin/kubectl`,

      `/host/usr/local/bin/kubectl`,

      `/host/usr/bin/kubectl`,

      `/host/bin/kubectl`,

    ];

    

    for (const p of kubectlPaths) {

      try {

        await fs.promises.access(p, fs.constants.X_OK);

        const { stdout } = await execAsync(`${p} version --client --short 2>&1`, { timeout: 5000 });

        if (stdout && !stdout.includes('command not found')) {

          const version = stdout.trim().split('\n')[0].trim();

          logger.info(`Got regular kubectl version: ${version}`);

          return version;

        }

      } catch {

        // Continue

      }

    }

    

    // If regular kubectl not found, try minikube

    const minikubePaths = [

      `/host/snap/bin/minikube`,

      `/host/usr/local/bin/minikube`,

      `/host/usr/bin/minikube`,

      `/host/bin/minikube`,

    ];

    

    for (const p of minikubePaths) {

      try {

        await fs.promises.access(p, fs.constants.X_OK);

        

        // Get minikube version

        const { stdout: minikubeVersion } = await execAsync(`${p} version --short 2>&1`, { timeout: 5000 });

        const minikubeVer = minikubeVersion.trim().split('\n')[0].trim();

        

        // Get kubectl version from minikube

        const { stdout: kubectlVersion } = await execAsync(`${p} kubectl version --client --short 2>&1`, { timeout: 5000 });

        const kubectlVer = kubectlVersion.trim().split('\n')[0].trim();

        

        const combinedVersion = `via Minikube ${minikubeVer} | kubectl ${kubectlVer}`;

        logger.info(`Got kubectl via minikube: ${combinedVersion}`);

        return combinedVersion;

      } catch (error) {

        logger.warn(`Error getting minikube kubectl version: ${error.message}`);

        // Continue

      }

    }

    

    return null;

  }

  

  // Special version commands for other tools

  const versionCommands = {

    'minikube': 'version --short 2>&1 | head -1',

    'helm': 'version --short 2>&1 | head -1',

    'terraform': 'version 2>&1 | head -1',

    'ansible': '--version 2>&1 | head -1',

    'argocd': 'version --client --short 2>&1 | head -1',

    'jenkins': '--version 2>&1 | head -1',

    'git': '--version 2>&1 | head -1'

  };

  

  const versionCmd = versionCommands[toolName] || '--version 2>&1 | head -1';

  

  // Try all host paths

  const hostPaths = [

    `/host/snap/bin/${toolName}`,

    `/host/usr/local/bin/${toolName}`,

    `/host/usr/bin/${toolName}`,

    `/host/bin/${toolName}`,

  ];

  

  for (const p of hostPaths) {

    try {

      await fs.promises.access(p, fs.constants.X_OK);

      const { stdout } = await execAsync(`${p} ${versionCmd}`, { timeout: 5000 });

      const version = stdout.trim().split('\n')[0].trim();

      logger.info(`Got version for ${toolName} from ${p}: ${version}`);

      return version;

    } catch (error) {

      // Continue

    }

  }

  

  logger.warn(`Could not get version for ${toolName}`);

  return null;

};



router.get('/check/:toolName', auth, async (req, res) => {

  try {

    const { toolName } = req.params;

    logger.info(`Checking tool: ${toolName}`);

    

    const installed = await checkToolInstalled(toolName);

    

    let version = null;

    if (installed) {

      version = await getToolVersion(toolName);

    }

    

    logger.info(`Tool check result: ${toolName} - Installed: ${installed}, Version: ${version}`);

    

    res.json({ 

      tool: toolName, 

      installed,

      status: installed ? 'available' : 'not found',

      version: version

    });

  } catch (error) {

    logger.error(`Tool check error for ${toolName}:`, error);

    res.status(500).json({ error: 'Failed to check tool' });

  }

});



router.get('/check-all', auth, async (req, res) => {

  try {

    const tools = ['docker', 'kubectl', 'minikube', 'ansible', 'terraform', 'git', 'helm', 'argocd', 'jenkins'];

    

    const results = await Promise.all(

      tools.map(async (tool) => {

        const installed = await checkToolInstalled(tool);

        const version = installed ? await getToolVersion(tool) : null;

        return {

          name: tool,

          installed,

          version

        };

      })

    );



    res.json({ tools: results });

  } catch (error) {

    logger.error('Check all tools error:', error);

    res.status(500).json({ error: 'Failed to check tools' });

  }

});



router.get('/installed', auth, async (req, res) => {

  try {

    const tools = ['docker', 'kubectl', 'minikube', 'ansible', 'terraform', 'git', 'helm', 'argocd', 'jenkins'];

    

    const installed = await Promise.all(

      tools.map(async (tool) => {

        const isInstalled = await checkToolInstalled(tool);

        if (isInstalled) {

          const version = await getToolVersion(tool);

          return { name: tool, version: version || 'unknown' };

        }

        return null;

      })

    );



    res.json({ 

      tools: installed.filter(t => t !== null) 

    });

  } catch (error) {

    logger.error('Get installed tools error:', error);

    res.status(500).json({ error: 'Failed to get installed tools' });

  }

});



module.exports = router;

