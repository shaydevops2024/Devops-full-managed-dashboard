
// /home/claude/devops-dashboard/backend/routes/files.js

const express = require('express');

const router = express.Router();

const multer = require('multer');

const path = require('path');

const fs = require('fs').promises;

const File = require('../models/File');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');



const storage = multer.diskStorage({

  destination: async (req, file, cb) => {

    const uploadDir = path.join(__dirname, '../uploads');

    try {

      await fs.mkdir(uploadDir, { recursive: true });

      cb(null, uploadDir);

    } catch (error) {

      cb(error);

    }

  },

  filename: (req, file, cb) => {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, uniqueSuffix + '-' + file.originalname);

  }

});



const upload = multer({

  storage,

  limits: {

    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024

  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [

      'application/x-yaml',

      'text/yaml',

      'application/json',

      'text/plain',

      'application/octet-stream'

    ];

    

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(yml|yaml|json|tf|sh)$/)) {

      cb(null, true);

    } else {

      cb(new Error('Invalid file type'));

    }

  }

});



router.post('/upload', auth, upload.single('file'), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({ error: 'No file uploaded' });

    }



    const { type = 'other' } = req.body;



    const file = new File({

      filename: req.file.filename,

      originalName: req.file.originalname,

      path: req.file.path,

      size: req.file.size,

      mimeType: req.file.mimetype,

      type,

      uploadedBy: req.user._id

    });



    await file.save();



    logger.info(`File uploaded: ${file.originalName} by ${req.user.email}`);



    res.status(201).json({

      message: 'File uploaded successfully',

      file

    });

  } catch (error) {

    logger.error('File upload error:', error);

    res.status(500).json({ error: 'Failed to upload file' });

  }

});



router.get('/', auth, async (req, res) => {

  try {

    const { type, search, limit = 50, page = 1 } = req.query;

    

    const query = { uploadedBy: req.user._id };

    if (type) query.type = type;

    if (search) {

      query.originalName = new RegExp(search, 'i');

    }



    const files = await File.find(query)

      .sort({ createdAt: -1 })

      .limit(parseInt(limit))

      .skip((parseInt(page) - 1) * parseInt(limit));



    const total = await File.countDocuments(query);



    res.json({

      files,

      pagination: {

        total,

        page: parseInt(page),

        pages: Math.ceil(total / parseInt(limit))

      }

    });

  } catch (error) {

    logger.error('Get files error:', error);

    res.status(500).json({ error: 'Failed to fetch files' });

  }

});



router.get('/:id', auth, async (req, res) => {

  try {

    const file = await File.findOne({

      _id: req.params.id,

      uploadedBy: req.user._id

    });



    if (!file) {

      return res.status(404).json({ error: 'File not found' });

    }



    res.json({ file });

  } catch (error) {

    logger.error('Get file error:', error);

    res.status(500).json({ error: 'Failed to fetch file' });

  }

});



router.get('/:id/download', auth, async (req, res) => {

  try {

    const file = await File.findOne({

      _id: req.params.id,

      uploadedBy: req.user._id

    });



    if (!file) {

      return res.status(404).json({ error: 'File not found' });

    }



    res.download(file.path, file.originalName);

  } catch (error) {

    logger.error('Download file error:', error);

    res.status(500).json({ error: 'Failed to download file' });

  }

});



router.delete('/:id', auth, async (req, res) => {

  try {

    const file = await File.findOne({

      _id: req.params.id,

      uploadedBy: req.user._id

    });



    if (!file) {

      return res.status(404).json({ error: 'File not found' });

    }



    await fs.unlink(file.path);

    await file.deleteOne();



    logger.info(`File deleted: ${file.originalName}`);



    res.json({ message: 'File deleted successfully' });

  } catch (error) {

    logger.error('Delete file error:', error);

    res.status(500).json({ error: 'Failed to delete file' });

  }

});



module.exports = router;

