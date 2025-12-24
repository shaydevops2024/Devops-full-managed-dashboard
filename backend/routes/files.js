// backend/routes/files.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const userDir = path.join(uploadDir, req.user._id.toString());
    
    try {
      await fs.mkdir(userDir, { recursive: true });
      cb(null, userDir);
    } catch (error) {
      cb(error, null);
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common DevOps file types
    const allowedTypes = [
      'text/plain',
      'text/yaml',
      'application/x-yaml',
      'application/json',
      'application/xml',
      'text/x-dockerfile'
    ];
    
    const allowedExtensions = ['.yaml', '.yml', '.json', '.txt', '.tf', '.dockerfile', '.xml', '.conf', '.sh'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only DevOps configuration files are allowed.'));
    }
  }
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;

    // Read file content
    const content = await fs.readFile(req.file.path, 'utf-8');

    const file = new File({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: type || 'other',
      content
    });

    await file.save();

    logger.info(`File uploaded: ${req.file.originalname} by ${req.user.username}`);
    res.status(201).json({ file });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get all user files
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    
    const files = await File.find(query).sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Get single file
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ file });
  } catch (error) {
    logger.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

// Update file content
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, type } = req.body;
    
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (content) {
      file.content = content;
      // Update physical file
      await fs.writeFile(file.path, content, 'utf-8');
    }
    if (type) file.type = type;
    
    await file.save();
    
    logger.info(`File updated: ${file._id} by ${req.user.username}`);
    res.json({ file });
  } catch (error) {
    logger.error('Update file error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (err) {
      logger.warn('Failed to delete physical file:', err);
    }
    
    await File.deleteOne({ _id: file._id });
    
    logger.info(`File deleted: ${file._id} by ${req.user.username}`);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Download file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
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

module.exports = router;