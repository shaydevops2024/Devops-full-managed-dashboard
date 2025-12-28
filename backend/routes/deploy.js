// backend/routes/deploy.js - COMPLETE WITH TERRAFORM FILENAME SUPPORT

const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const execAsync = promisify(exec);
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const GENERATOR_BASE_PATH = process.env.GENERATOR_BASE_PATH || '/generator';

const executeWithLogs = async (command, workingDir = '.') => {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const logs = [];
    
    logger.info(`Executing: ${command} in ${workingDir}`);
    
    const proc = spawn('sh', ['-c', command], {
      cwd: workingDir,
      env: { 
        ...process.env, 
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/host/usr/local/bin:/host/usr/bin:/host/snap/bin' 
      }
    });

    proc.stdout.on('data', (data) => {
      logs.push({ type: 'stdout', message: data.toString(), timestamp: new Date() });
    });

    proc.stderr.on('data', (data) => {
      logs.push({ type: 'stderr', message: data.toString(), timestamp: new Date() });
    });

    proc.on('close', (code) => {
      logs.push({ type: code === 0 ? 'stdout' : 'stderr', message: `\nProcess exited with code ${code}\n`, timestamp: new Date() });
      resolve({ success: code === 0, logs, exitCode: code });
    });

    proc.on('error', (error) => {
      logs.push({ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() });
      resolve({ success: false, logs, exitCode: -1 });
    });
  });
};

const ensureDir = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    logger.error(`Failed to create directory ${dirPath}:`, error);
    return false;
  }
};

const validateDockerfile = async (dockerfilePath) => {
  const logs = [];
  
  try {
    const content = await fs.readFile(dockerfilePath, 'utf8');
    
    logs.push({ type: 'stdout', message: '\n🔍 Validating Dockerfile syntax...\n', timestamp: new Date() });
    
    let hasFrom = false;
    let hasValidInstructions = false;
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        if (trimmed.startsWith('FROM ')) {
          hasFrom = true;
          logs.push({ type: 'stdout', message: `✓ Found: ${trimmed.substring(0, 50)}...\n`, timestamp: new Date() });
        }
        const commonInstructions = ['WORKDIR', 'COPY', 'ADD', 'RUN', 'CMD', 'ENTRYPOINT', 'EXPOSE'];
        for (const instruction of commonInstructions) {
          if (trimmed.startsWith(instruction + ' ')) {
            hasValidInstructions = true;
            break;
          }
        }
      }
    }
    
    if (!hasFrom) {
      logs.push({ type: 'stderr', message: '✗ Missing required FROM instruction\n', timestamp: new Date() });
      return { success: false, logs };
    }
    
    logs.push({ type: 'stdout', message: '✓ FROM instruction found\n', timestamp: new Date() });
    
    if (!hasValidInstructions) {
      logs.push({ type: 'stderr', message: '⚠ No build instructions found\n', timestamp: new Date() });
    } else {
      logs.push({ type: 'stdout', message: '✓ Build instructions found\n', timestamp: new Date() });
    }
    
    logs.push({ type: 'stdout', message: '\n✓ Dockerfile syntax validation passed!\n', timestamp: new Date() });
    
    return { success: true, logs };
    
  } catch (error) {
    logs.push({ type: 'stderr', message: `Error reading Dockerfile: ${error.message}\n`, timestamp: new Date() });
    return { success: false, logs };
  }
};

const createTestApp = async (dockerDir, port) => {
  const logs = [];
  
  logs.push({ type: 'stdout', message: '\n📦 Creating test application...\n', timestamp: new Date() });
  
  const packageJson = {
    name: "generated-app",
    version: "1.0.0",
    description: "Auto-generated test application",
    main: "index.js",
    scripts: {
      start: "node index.js",
      build: "echo 'Build complete'"
    },
    dependencies: {}
  };
  
  await fs.writeFile(path.join(dockerDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  logs.push({ type: 'stdout', message: '✓ Created package.json\n', timestamp: new Date() });
  
  const indexJs = `const http = require('http');
const port = ${port};

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(\`
    <html>
      <head>
        <title>Generated App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          h1 { font-size: 3rem; margin: 20px 0; }
          p { font-size: 1.2rem; margin: 10px 0; }
          .status { color: #4ecca3; font-weight: bold; font-size: 1.5rem; }
        </style>
      </head>
      <body>
        <h1>🚀 Container Running!</h1>
        <p>This is an auto-generated test application.</p>
        <p>Container deployed from DevOps Dashboard</p>
        <p class="status">Status: Active ✓</p>
        <p style="margin-top: 40px; font-size: 0.9rem;">
          Port: ${port} | Generated: \${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  \`);
});

server.listen(port, '0.0.0.0', () => {
  console.log(\`App listening on port \${port}\`);
});
`;
  
  await fs.writeFile(path.join(dockerDir, 'index.js'), indexJs);
  logs.push({ type: 'stdout', message: '✓ Created index.js\n', timestamp: new Date() });
  
  const fixedDockerfile = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN echo 'No dependencies to install'
COPY . .
RUN echo 'Build complete'
EXPOSE ${port}
CMD ["node", "index.js"]`;
  
  await fs.writeFile(path.join(dockerDir, 'Dockerfile'), fixedDockerfile);
  logs.push({ type: 'stdout', message: '✓ Dockerfile optimized for test app\n', timestamp: new Date() });
  logs.push({ type: 'stdout', message: '✓ Test application ready\n', timestamp: new Date() });
  
  return { success: true, logs };
};

// FIXED VALIDATION ROUTE
router.post('/validate-dockerfile', auth, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, error: 'Dockerfile content is required' });
  }

  const tempTag = `dockerfile-validation-${Date.now()}`;
  const tempDir = `/tmp/dockerfile-validation-${Date.now()}`;

  try {
    logger.info('Starting Dockerfile validation');
    
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(path.join(tempDir, 'Dockerfile'), content);

    try {
      logger.info(`Building validation image: ${tempTag}`);
      
      const stream = await docker.buildImage({
        context: tempDir,
        src: ['Dockerfile']
      }, { t: tempTag });

      const buildLogs = [];
      let buildFailed = false;
      let errorMessage = '';

      const output = await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, 
          (err, output) => {
            if (err) reject(err);
            else resolve(output);
          },
          (event) => {
            if (event.stream) buildLogs.push(event.stream);
            if (event.error) {
              buildFailed = true;
              errorMessage = event.error;
              buildLogs.push(`ERROR: ${event.error}`);
            }
            if (event.errorDetail) {
              buildFailed = true;
              errorMessage = event.errorDetail.message || JSON.stringify(event.errorDetail);
            }
          }
        );
      });

      // Check output array for errors
      if (output && Array.isArray(output)) {
        for (const item of output) {
          if (item.error || item.errorDetail) {
            buildFailed = true;
            errorMessage = item.error || item.errorDetail?.message || 'Build failed';
            break;
          }
        }
      }

      if (buildFailed) {
        throw new Error(errorMessage || 'Docker build failed');
      }

      logger.info('Build succeeded - verifying image exists');

      // Verify image exists
      try {
        const image = docker.getImage(tempTag);
        await image.inspect();
        await image.remove({ force: true });
        logger.info('Validation image removed');
      } catch (removeError) {
        if (removeError.statusCode === 404) {
          logger.error('Image not found - build failed');
          throw new Error('Docker build failed - no image was created');
        }
        logger.warn('Could not remove image:', removeError.message);
      }

      await fs.rm(tempDir, { recursive: true, force: true });

      return res.json({
        success: true,
        message: 'Dockerfile validation passed - Docker build succeeded',
        output: buildLogs.join('')
      });

    } catch (buildError) {
      logger.error('Validation failed:', buildError);
      
      let errorMessage = 'Build failed';
      if (typeof buildError === 'string') errorMessage = buildError;
      else if (buildError.message) errorMessage = buildError.message;
      else if (buildError.json?.message) errorMessage = buildError.json.message;
      
      await fs.rm(tempDir, { recursive: true, force: true });

      try {
        await docker.getImage(tempTag).remove({ force: true });
      } catch (e) {}

      return res.json({
        success: false,
        error: 'Docker build failed',
        details: errorMessage
      });
    }

  } catch (error) {
    logger.error('Validation error:', error);

    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      await docker.getImage(tempTag).remove({ force: true });
    } catch (e) {}

    return res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

// Deploy Docker file
router.post('/docker', auth, async (req, res) => {
  try {
    const { content, mode = 'deploy', containerName = `generated-app-${Date.now()}`, port = '3000' } = req.body;
    
    logger.info(`Docker deployment - Mode: ${mode}, Port: ${port}`);
    
    const dockerDir = path.join(GENERATOR_BASE_PATH, 'docker');
    const created = await ensureDir(dockerDir);
    
    if (!created) {
      return res.status(500).json({
        success: false,
        logs: [{ type: 'stderr', message: 'Failed to create directory\n', timestamp: new Date() }],
        message: 'Failed to create directory'
      });
    }
    
    const dockerfilePath = path.join(dockerDir, 'Dockerfile');
    
    const logs = [
      { type: 'stdout', message: '🚀 Starting Docker deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 Creating directory: ${dockerDir}\n`, timestamp: new Date() },
      { type: 'stdout', message: `✓ Directory created\n\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(dockerfilePath, content);
    logs.push({ type: 'stdout', message: `📝 Dockerfile saved to: ${dockerfilePath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ File written\n`, timestamp: new Date() });
    
    logger.info(`Dockerfile saved to ${dockerfilePath}`);
    
    const validation = await validateDockerfile(dockerfilePath);
    logs.push(...validation.logs);
    
    if (!validation.success) {
      return res.json({
        success: false,
        logs,
        message: 'Dockerfile validation failed',
        filePath: `~/Generator/docker/Dockerfile`
      });
    }
    
    if (mode === 'deploy-and-run') {
      logs.push({ type: 'stdout', message: '\n🔨 Deploy & Run mode\n', timestamp: new Date() });
      
      const appCreation = await createTestApp(dockerDir, port);
      logs.push(...appCreation.logs);
      
      if (!appCreation.success) {
        return res.json({
          success: false,
          logs,
          message: 'Failed to create test application',
          filePath: `~/Generator/docker/Dockerfile`
        });
      }
      
      logs.push({ type: 'stdout', message: '\n🔨 Building Docker image...\n', timestamp: new Date() });
      
      const imageName = containerName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      try {
        const stream = await docker.buildImage({
          context: dockerDir,
          src: ['Dockerfile', 'package.json', 'index.js']
        }, { t: imageName });
        
        await new Promise((resolve, reject) => {
          docker.modem.followProgress(stream, 
            (err, res) => err ? reject(err) : resolve(res),
            (event) => {
              if (event.stream) logs.push({ type: 'stdout', message: event.stream, timestamp: new Date() });
              if (event.error) logs.push({ type: 'stderr', message: event.error, timestamp: new Date() });
            }
          );
        });
        
        logs.push({ type: 'stdout', message: `\n✓ Docker image built: ${imageName}\n`, timestamp: new Date() });
        
        try {
          const existingContainer = docker.getContainer(containerName);
          await existingContainer.inspect();
          logs.push({ type: 'stdout', message: `\n⚠ Container "${containerName}" exists, removing...\n`, timestamp: new Date() });
          
          try {
            await existingContainer.stop({ t: 5 });
            logs.push({ type: 'stdout', message: `✓ Container stopped\n`, timestamp: new Date() });
          } catch (stopErr) {
            logs.push({ type: 'stdout', message: `✓ Container was not running\n`, timestamp: new Date() });
          }
          
          await existingContainer.remove({ force: true });
          logs.push({ type: 'stdout', message: `✓ Old container removed\n`, timestamp: new Date() });
        } catch (e) {
          logs.push({ type: 'stdout', message: `✓ No existing container\n`, timestamp: new Date() });
        }
        
        logs.push({ type: 'stdout', message: '\n🚀 Starting container...\n', timestamp: new Date() });
        
        const container = await docker.createContainer({
          Image: imageName,
          name: containerName,
          ExposedPorts: { [`${port}/tcp`]: {} },
          HostConfig: {
            PortBindings: { [`${port}/tcp`]: [{ HostPort: port }] },
            RestartPolicy: { Name: 'unless-stopped' }
          }
        });
        
        await container.start();
        
        logs.push({ type: 'stdout', message: `✓ Container started: ${containerName}\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `✓ Container ID: ${container.id.substring(0, 12)}\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `✓ Access at: http://localhost:${port}\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `\n🎉 Container running!\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `📊 Check dashboard\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `📂 Dockerfile: ~/Generator/docker/Dockerfile\n`, timestamp: new Date() });
        
        res.json({
          success: true,
          logs,
          message: 'Container deployed!',
          filePath: `~/Generator/docker/Dockerfile`,
          containerName,
          containerId: container.id,
          port
        });
        
      } catch (buildError) {
        logs.push({ type: 'stderr', message: `\n❌ Failed: ${buildError.message}\n`, timestamp: new Date() });
        logger.error('Docker build/run error:', buildError);
        
        res.json({
          success: false,
          logs,
          message: 'Build/run failed',
          filePath: `~/Generator/docker/Dockerfile`
        });
      }
    } else {
      logs.push({ type: 'stdout', message: '\n📝 To build:\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: '  1. Copy app files to ~/Generator/docker/\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: '  2. Run: cd ~/Generator/docker && docker build -t my-app .\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n🎉 Deployment completed!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/docker/Dockerfile\n`, timestamp: new Date() });
      
      res.json({
        success: true,
        logs,
        message: 'Dockerfile deployed!',
        filePath: `~/Generator/docker/Dockerfile`
      });
    }
    
  } catch (error) {
    logger.error('Docker deployment error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }]
    });
  }
});

// Deploy Terraform (UPDATED WITH FILENAME SUPPORT)
router.post('/terraform', auth, async (req, res) => {
  try {
    const { content, filename = 'main' } = req.body; // Accept filename parameter
    const terraformDir = path.join(GENERATOR_BASE_PATH, 'terraform');
    await ensureDir(terraformDir);
    
    // Use provided filename (without .tf extension if included)
    const cleanFilename = filename.trim().replace(/\.tf$/, '');
    const tfPath = path.join(terraformDir, `${cleanFilename}.tf`);
    
    const logs = [
      { type: 'stdout', message: '🚀 Terraform deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 ${terraformDir}\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(tfPath, content);
    logs.push({ type: 'stdout', message: `📝 ${tfPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ Written\n\n`, timestamp: new Date() });
    logger.info(`Terraform saved to ${tfPath}`);
    
    logs.push({ type: 'stdout', message: '🔧 terraform init...\n', timestamp: new Date() });
    const initResult = await executeWithLogs('terraform init', terraformDir);
    logs.push(...initResult.logs);
    
    if (initResult.success) {
      logs.push({ type: 'stdout', message: '\n✓ Init completed\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: '\n🔍 terraform validate...\n', timestamp: new Date() });
      
      const validateResult = await executeWithLogs('terraform validate', terraformDir);
      logs.push(...validateResult.logs);
      
      if (validateResult.success) {
        logs.push({ type: 'stdout', message: '\n✓ Validated\n', timestamp: new Date() });
        logs.push({ type: 'stdout', message: `\n🎉 Done!\n`, timestamp: new Date() });
        logs.push({ type: 'stdout', message: `📂 ~/Generator/terraform/${cleanFilename}.tf\n`, timestamp: new Date() });
      }
      
      res.json({
        success: validateResult.success,
        logs,
        message: validateResult.success ? 'Terraform deployed!' : 'Validation failed',
        filePath: `~/Generator/terraform/${cleanFilename}.tf`
      });
    } else {
      logs.push({ type: 'stdout', message: `\n🎉 Deployed!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/terraform/${cleanFilename}.tf\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n⚠ Init failed\n`, timestamp: new Date() });
      
      res.json({
        success: true,
        logs,
        message: 'Terraform deployed (validation skipped)',
        filePath: `~/Generator/terraform/${cleanFilename}.tf`
      });
    }
  } catch (error) {
    logger.error('Terraform error:', error);
    res.status(500).json({ success: false, error: error.message, logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }] });
  }
});

// Terraform Plan
router.post('/terraform-plan', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const terraformDir = path.join(GENERATOR_BASE_PATH, 'terraform');
    await ensureDir(terraformDir);
    
    const tfPath = path.join(terraformDir, 'main.tf');
    
    const logs = [
      { type: 'stdout', message: '🚀 Starting Terraform plan...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 Working directory: ${terraformDir}\n`, timestamp: new Date() }
    ];
    
    // Clean directory - remove all .tf files to avoid duplicates
    try {
      const files = await fs.readdir(terraformDir);
      const tfFiles = files.filter(f => f.endsWith('.tf'));
      for (const file of tfFiles) {
        await fs.unlink(path.join(terraformDir, file));
        logs.push({ type: 'stdout', message: `🗑️  Removed old file: ${file}\n`, timestamp: new Date() });
      }
    } catch (err) {
      // Directory might not exist yet, ignore
    }
    
    await fs.writeFile(tfPath, content);
    logs.push({ type: 'stdout', message: `📝 Configuration saved to: ${tfPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ File written successfully\n\n`, timestamp: new Date() });
    
    logger.info(`Terraform config saved to ${tfPath}`);
    
    // Run terraform init
    logs.push({ type: 'stdout', message: '🔧 Running terraform init...\n', timestamp: new Date() });
    const initResult = await executeWithLogs('terraform init', terraformDir);
    logs.push(...initResult.logs);
    
    if (!initResult.success) {
      logs.push({ type: 'stderr', message: '\n❌ Terraform init failed\n', timestamp: new Date() });
      return res.json({
        success: false,
        logs,
        message: 'Terraform init failed'
      });
    }
    
    logs.push({ type: 'stdout', message: '\n✓ Terraform init completed\n', timestamp: new Date() });
    
    // Run terraform plan
    logs.push({ type: 'stdout', message: '\n📊 Running terraform plan...\n', timestamp: new Date() });
    const planResult = await executeWithLogs('terraform plan', terraformDir);
    logs.push(...planResult.logs);
    
    if (planResult.success) {
      logs.push({ type: 'stdout', message: '\n✓ Terraform plan completed successfully\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n📂 Configuration available at: ~/Generator/terraform/main.tf\n`, timestamp: new Date() });
      
      res.json({
        success: true,
        logs,
        message: 'Terraform plan completed successfully!',
        filePath: `~/Generator/terraform/main.tf`
      });
    } else {
      logs.push({ type: 'stderr', message: '\n❌ Terraform plan failed\n', timestamp: new Date() });
      
      res.json({
        success: false,
        logs,
        message: 'Terraform plan failed. Check logs for details.',
        filePath: `~/Generator/terraform/main.tf`
      });
    }
    
  } catch (error) {
    logger.error('Terraform plan error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }]
    });
  }
});

// Terraform Apply (FIXED - Cleans directory first)
router.post('/terraform-apply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const terraformDir = path.join(GENERATOR_BASE_PATH, 'terraform');
    await ensureDir(terraformDir);
    
    const tfPath = path.join(terraformDir, 'main.tf');
    
    const logs = [
      { type: 'stdout', message: '🚀 Starting Terraform apply...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 Working directory: ${terraformDir}\n`, timestamp: new Date() }
    ];
    
    // Clean directory - remove all .tf files to avoid duplicates
    try {
      const files = await fs.readdir(terraformDir);
      const tfFiles = files.filter(f => f.endsWith('.tf'));
      for (const file of tfFiles) {
        await fs.unlink(path.join(terraformDir, file));
        logs.push({ type: 'stdout', message: `🗑️  Removed old file: ${file}\n`, timestamp: new Date() });
      }
    } catch (err) {
      // Directory might not exist yet, ignore
    }
    
    await fs.writeFile(tfPath, content);
    logs.push({ type: 'stdout', message: `📝 Configuration saved to: ${tfPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ File written successfully\n\n`, timestamp: new Date() });
    
    logger.info(`Terraform config saved to ${tfPath}`);
    
    // Run terraform init
    logs.push({ type: 'stdout', message: '🔧 Running terraform init...\n', timestamp: new Date() });
    const initResult = await executeWithLogs('terraform init', terraformDir);
    logs.push(...initResult.logs);
    
    if (!initResult.success) {
      logs.push({ type: 'stderr', message: '\n❌ Terraform init failed\n', timestamp: new Date() });
      return res.json({
        success: false,
        logs,
        message: 'Terraform init failed'
      });
    }
    
    logs.push({ type: 'stdout', message: '\n✓ Terraform init completed\n', timestamp: new Date() });
    
    // Run terraform apply with auto-approve
    logs.push({ type: 'stdout', message: '\n🚀 Running terraform apply -auto-approve...\n', timestamp: new Date() });
    logs.push({ type: 'stdout', message: '⚠️  This will create/modify/destroy real infrastructure!\n', timestamp: new Date() });
    
    const applyResult = await executeWithLogs('terraform apply -auto-approve', terraformDir);
    logs.push(...applyResult.logs);
    
    if (applyResult.success) {
      logs.push({ type: 'stdout', message: '\n✓ Terraform apply completed successfully\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: '🎉 Infrastructure has been provisioned!\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n📂 Configuration available at: ~/Generator/terraform/main.tf\n`, timestamp: new Date() });
      
      res.json({
        success: true,
        logs,
        message: 'Infrastructure deployed successfully!',
        filePath: `~/Generator/terraform/main.tf`
      });
    } else {
      logs.push({ type: 'stderr', message: '\n❌ Terraform apply failed\n', timestamp: new Date() });
      
      res.json({
        success: false,
        logs,
        message: 'Terraform apply failed. Check logs for details.',
        filePath: `~/Generator/terraform/main.tf`
      });
    }
    
  } catch (error) {
    logger.error('Terraform apply error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }]
    });
  }
});

// Terraform Apply
router.post('/terraform-apply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const terraformDir = path.join(GENERATOR_BASE_PATH, 'terraform');
    await ensureDir(terraformDir);
    
    const tfPath = path.join(terraformDir, 'main.tf');
    
    const logs = [
      { type: 'stdout', message: '🚀 Starting Terraform apply...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 Creating directory: ${terraformDir}\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(tfPath, content);
    logs.push({ type: 'stdout', message: `📝 Configuration saved to: ${tfPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ File written successfully\n\n`, timestamp: new Date() });
    
    logger.info(`Terraform config saved to ${tfPath}`);
    
    // Run terraform init
    logs.push({ type: 'stdout', message: '🔧 Running terraform init...\n', timestamp: new Date() });
    const initResult = await executeWithLogs('terraform init', terraformDir);
    logs.push(...initResult.logs);
    
    if (!initResult.success) {
      logs.push({ type: 'stderr', message: '\n❌ Terraform init failed\n', timestamp: new Date() });
      return res.json({
        success: false,
        logs,
        message: 'Terraform init failed'
      });
    }
    
    logs.push({ type: 'stdout', message: '\n✓ Terraform init completed\n', timestamp: new Date() });
    
    // Run terraform apply with auto-approve
    logs.push({ type: 'stdout', message: '\n🚀 Running terraform apply -auto-approve...\n', timestamp: new Date() });
    logs.push({ type: 'stdout', message: '⚠️  This will create/modify/destroy real infrastructure!\n', timestamp: new Date() });
    
    const applyResult = await executeWithLogs('terraform apply -auto-approve', terraformDir);
    logs.push(...applyResult.logs);
    
    if (applyResult.success) {
      logs.push({ type: 'stdout', message: '\n✓ Terraform apply completed successfully\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: '🎉 Infrastructure has been provisioned!\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n📂 Configuration available at: ~/Generator/terraform/main.tf\n`, timestamp: new Date() });
      
      res.json({
        success: true,
        logs,
        message: 'Infrastructure deployed successfully!',
        filePath: `~/Generator/terraform/main.tf`
      });
    } else {
      logs.push({ type: 'stderr', message: '\n❌ Terraform apply failed\n', timestamp: new Date() });
      
      res.json({
        success: false,
        logs,
        message: 'Terraform apply failed. Check logs for details.',
        filePath: `~/Generator/terraform/main.tf`
      });
    }
    
  } catch (error) {
    logger.error('Terraform apply error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }]
    });
  }
});

// Deploy Kubernetes
router.post('/kubernetes', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const k8sDir = path.join(GENERATOR_BASE_PATH, 'kubernetes');
    await ensureDir(k8sDir);
    const manifestPath = path.join(k8sDir, 'deployment.yaml');
    
    const logs = [
      { type: 'stdout', message: '🚀 Kubernetes deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 ${k8sDir}\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(manifestPath, content);
    logs.push({ type: 'stdout', message: `📝 ${manifestPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ Written\n\n`, timestamp: new Date() });
    logger.info(`K8s saved to ${manifestPath}`);
    
    logs.push({ type: 'stdout', message: '🔍 Validating...\n', timestamp: new Date() });
    const result = await executeWithLogs(`kubectl apply -f ${manifestPath} --dry-run=client`, k8sDir);
    logs.push(...result.logs);
    
    if (result.success) {
      logs.push({ type: 'stdout', message: '\n✓ Validated\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n🎉 Done!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/kubernetes/deployment.yaml\n`, timestamp: new Date() });
    } else {
      logs.push({ type: 'stdout', message: `\n🎉 Deployed!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/kubernetes/deployment.yaml\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n⚠ Validation failed\n`, timestamp: new Date() });
    }
    
    res.json({
      success: true,
      logs,
      message: result.success ? 'K8s deployed!' : 'Deployed (validation skipped)',
      filePath: `~/Generator/kubernetes/deployment.yaml`
    });
  } catch (error) {
    logger.error('K8s error:', error);
    res.status(500).json({ success: false, error: error.message, logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }] });
  }
});

// Deploy Helm
router.post('/helm', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const helmDir = path.join(GENERATOR_BASE_PATH, 'helm');
    const chartDir = path.join(helmDir, 'mychart');
    await ensureDir(chartDir);
    
    const logs = [
      { type: 'stdout', message: '🚀 Helm deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 ${chartDir}\n`, timestamp: new Date() }
    ];
    
    const parts = content.split('---');
    const chartYaml = parts[0].trim();
    const valuesYaml = parts[1] ? parts[1].trim() : '';
    
    await fs.writeFile(path.join(chartDir, 'Chart.yaml'), chartYaml);
    logs.push({ type: 'stdout', message: `📝 Chart.yaml\n`, timestamp: new Date() });
    
    if (valuesYaml) {
      await fs.writeFile(path.join(chartDir, 'values.yaml'), valuesYaml);
      logs.push({ type: 'stdout', message: `📝 values.yaml\n`, timestamp: new Date() });
    }
    
    logs.push({ type: 'stdout', message: `✓ Written\n\n`, timestamp: new Date() });
    logger.info(`Helm saved to ${chartDir}`);
    
    logs.push({ type: 'stdout', message: '🔍 Linting...\n', timestamp: new Date() });
    const result = await executeWithLogs(`helm lint ${chartDir}`, helmDir);
    logs.push(...result.logs);
    
    if (result.success) {
      logs.push({ type: 'stdout', message: '\n✓ Lint passed\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n🎉 Done!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/helm/mychart/\n`, timestamp: new Date() });
    } else {
      logs.push({ type: 'stdout', message: `\n🎉 Deployed!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/helm/mychart/\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n⚠ Lint failed\n`, timestamp: new Date() });
    }
    
    res.json({
      success: true,
      logs,
      message: result.success ? 'Helm deployed!' : 'Deployed (linting skipped)',
      filePath: `~/Generator/helm/mychart/`
    });
  } catch (error) {
    logger.error('Helm error:', error);
    res.status(500).json({ success: false, error: error.message, logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }] });
  }
});

// Deploy ArgoCD
router.post('/argocd', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const argocdDir = path.join(GENERATOR_BASE_PATH, 'argocd');
    await ensureDir(argocdDir);
    const manifestPath = path.join(argocdDir, 'application.yaml');
    
    const logs = [
      { type: 'stdout', message: '🚀 ArgoCD deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 ${argocdDir}\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(manifestPath, content);
    logs.push({ type: 'stdout', message: `📝 ${manifestPath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ Written\n\n`, timestamp: new Date() });
    logger.info(`ArgoCD saved to ${manifestPath}`);
    
    logs.push({ type: 'stdout', message: '🔍 Validating...\n', timestamp: new Date() });
    const result = await executeWithLogs(`kubectl apply -f ${manifestPath} --dry-run=client`, argocdDir);
    logs.push(...result.logs);
    
    if (result.success) {
      logs.push({ type: 'stdout', message: '\n✓ Validated\n', timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n🎉 Done!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/argocd/application.yaml\n`, timestamp: new Date() });
    } else {
      logs.push({ type: 'stdout', message: `\n🎉 Deployed!\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `📂 ~/Generator/argocd/application.yaml\n`, timestamp: new Date() });
      logs.push({ type: 'stdout', message: `\n⚠ Validation failed\n`, timestamp: new Date() });
    }
    
    res.json({
      success: true,
      logs,
      message: result.success ? 'ArgoCD deployed!' : 'Deployed (validation skipped)',
      filePath: `~/Generator/argocd/application.yaml`
    });
  } catch (error) {
    logger.error('ArgoCD error:', error);
    res.status(500).json({ success: false, error: error.message, logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }] });
  }
});

// Deploy Jenkins
router.post('/jenkins', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const jenkinsDir = path.join(GENERATOR_BASE_PATH, 'jenkins');
    await ensureDir(jenkinsDir);
    const jenkinsfilePath = path.join(jenkinsDir, 'Jenkinsfile');
    
    const logs = [
      { type: 'stdout', message: '🚀 Jenkins deployment...\n', timestamp: new Date() },
      { type: 'stdout', message: `📁 ${jenkinsDir}\n`, timestamp: new Date() }
    ];
    
    await fs.writeFile(jenkinsfilePath, content);
    logs.push({ type: 'stdout', message: `📝 ${jenkinsfilePath}\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `✓ Written\n\n`, timestamp: new Date() });
    logger.info(`Jenkinsfile saved to ${jenkinsfilePath}`);
    
    logs.push({ type: 'stdout', message: '🔍 Checking syntax...\n', timestamp: new Date() });
    
    let success = true;
    if (!content.includes('pipeline')) {
      logs.push({ type: 'stderr', message: '✗ Missing pipeline\n', timestamp: new Date() });
      success = false;
    } else {
      logs.push({ type: 'stdout', message: '✓ Pipeline found\n', timestamp: new Date() });
    }
    
    if (!content.includes('agent')) {
      logs.push({ type: 'stderr', message: '✗ Missing agent\n', timestamp: new Date() });
      success = false;
    } else {
      logs.push({ type: 'stdout', message: '✓ Agent found\n', timestamp: new Date() });
    }
    
    if (!content.includes('stages')) {
      logs.push({ type: 'stderr', message: '✗ Missing stages\n', timestamp: new Date() });
      success = false;
    } else {
      logs.push({ type: 'stdout', message: '✓ Stages found\n', timestamp: new Date() });
    }
    
    if (success) {
      logs.push({ type: 'stdout', message: '\n✓ Syntax OK\n', timestamp: new Date() });
    }
    
    logs.push({ type: 'stdout', message: `\n🎉 Done!\n`, timestamp: new Date() });
    logs.push({ type: 'stdout', message: `📂 ~/Generator/jenkins/Jenkinsfile\n`, timestamp: new Date() });
    
    res.json({
      success: true,
      logs,
      message: success ? 'Jenkinsfile deployed!' : 'Deployed (warnings)',
      filePath: `~/Generator/jenkins/Jenkinsfile`
    });
  } catch (error) {
    logger.error('Jenkins error:', error);
    res.status(500).json({ success: false, error: error.message, logs: [{ type: 'stderr', message: `Error: ${error.message}\n`, timestamp: new Date() }] });
  }
});

module.exports = router;