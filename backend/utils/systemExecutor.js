// backend/utils/systemExecutor.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('./logger');

class SystemExecutor {
  async executeCommand(command, timeout = 30000) {
    try {
      logger.info(`Executing command: ${command}`);
      const { stdout, stderr } = await execPromise(command, { timeout });
      
      if (stderr && !stderr.includes('warning')) {
        logger.warn(`Command stderr: ${stderr}`);
      }
      
      return { success: true, output: stdout, error: stderr };
    } catch (error) {
      logger.error(`Command execution error: ${error.message}`);
      return { success: false, output: '', error: error.message };
    }
  }

  async checkToolInstalled(toolName) {
    const commands = {
      docker: 'docker --version',
      kubernetes: 'kubectl version --client',
      helm: 'helm version',
      terraform: 'terraform version',
      ansible: 'ansible --version',
      jenkins: 'jenkins --version || java -jar jenkins.war --version',
      argocd: 'argocd version --client'
    };

    const command = commands[toolName.toLowerCase()];
    if (!command) {
      return { installed: false, version: null, error: 'Unknown tool' };
    }

    const result = await this.executeCommand(command);
    
    if (result.success) {
      const version = this.extractVersion(result.output);
      return { installed: true, version, output: result.output };
    }
    
    return { installed: false, version: null, error: result.error };
  }

  extractVersion(output) {
    const versionRegex = /(\d+\.\d+\.\d+)/;
    const match = output.match(versionRegex);
    return match ? match[1] : 'unknown';
  }

  async getSystemInfo() {
    try {
      const si = require('systeminformation');
      
      const [cpu, mem, osInfo, dockerInfo] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.dockerInfo().catch(() => null)
      ]);

      return {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          speed: cpu.speed
        },
        memory: {
          total: Math.round(mem.total / 1024 / 1024 / 1024), // GB
          free: Math.round(mem.free / 1024 / 1024 / 1024), // GB
          used: Math.round(mem.used / 1024 / 1024 / 1024), // GB
          usagePercent: Math.round((mem.used / mem.total) * 100)
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch
        },
        docker: dockerInfo
      };
    } catch (error) {
      logger.error('Error getting system info:', error);
      throw error;
    }
  }

  async getKubernetesPods() {
    const result = await this.executeCommand('kubectl get pods --all-namespaces -o json');
    if (result.success) {
      try {
        return JSON.parse(result.output);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async getDockerContainers() {
    const result = await this.executeCommand('docker ps -a --format "{{json .}}"');
    if (result.success) {
      try {
        const containers = result.output.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
        return containers;
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  async getServiceStatus(serviceName) {
    const result = await this.executeCommand(`systemctl is-active ${serviceName}`);
    return {
      service: serviceName,
      active: result.output.trim() === 'active',
      status: result.output.trim()
    };
  }
}

module.exports = new SystemExecutor();