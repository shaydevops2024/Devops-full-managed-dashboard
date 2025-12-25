
// /home/claude/devops-dashboard/backend/routes/system.js

const express = require('express');

const router = express.Router();

const si = require('systeminformation');

const { exec } = require('child_process');

const { promisify } = require('util');

const { auth, adminAuth } = require('../middleware/auth');

const logger = require('../utils/logger');



const execAsync = promisify(exec);



router.get('/info', auth, async (req, res) => {

  try {

    const [cpu, mem, osInfo, disk, network] = await Promise.all([

      si.cpu(),

      si.mem(),

      si.osInfo(),

      si.fsSize(),

      si.networkStats()

    ]);



    res.json({

      cpu: {

        manufacturer: cpu.manufacturer,

        brand: cpu.brand,

        cores: cpu.cores,

        speed: cpu.speed

      },

      memory: {

        total: mem.total,

        free: mem.free,

        used: mem.used,

        active: mem.active

      },

      os: {

        platform: osInfo.platform,

        distro: osInfo.distro,

        release: osInfo.release,

        arch: osInfo.arch

      },

      disk: disk.map(d => ({

        fs: d.fs,

        type: d.type,

        size: d.size,

        used: d.used,

        available: d.available,

        use: d.use

      })),

      network: network.map(n => ({

        iface: n.iface,

        rx_sec: n.rx_sec,

        tx_sec: n.tx_sec

      }))

    });

  } catch (error) {

    logger.error('System info error:', error);

    res.status(500).json({ error: 'Failed to fetch system info' });

  }

});



router.post('/execute', adminAuth, async (req, res) => {

  try {

    const { command } = req.body;



    if (!command) {

      return res.status(400).json({ error: 'Command is required' });

    }



    const allowedCommands = ['docker', 'kubectl', 'ansible', 'terraform'];

    const commandBase = command.split(' ')[0];



    if (!allowedCommands.includes(commandBase)) {

      return res.status(403).json({ error: 'Command not allowed' });

    }



    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });



    logger.info(`Command executed: ${command}`);



    res.json({

      success: true,

      stdout,

      stderr

    });

  } catch (error) {

    logger.error('Command execution error:', error);

    res.status(500).json({

      success: false,

      error: error.message,

      stderr: error.stderr

    });

  }

});



router.get('/hosts', auth, async (req, res) => {

  try {

    const hosts = [

      { name: 'localhost', ip: '127.0.0.1', status: 'active' }

    ];



    res.json({ hosts });

  } catch (error) {

    logger.error('Get hosts error:', error);

    res.status(500).json({ error: 'Failed to fetch hosts' });

  }

});



module.exports = router;

