


// Custom file upload route with all metadata

router.post('/upload-custom', auth, upload.single('file'), async (req, res) => {

  try {

    const { fileName, category, storageLocation, filePath } = req.body;

    if (!fileName) return res.status(400).json({ error: 'File name is required' });

    if (!category) return res.status(400).json({ error: 'Category is required' });



    let fileData = {};

    if (req.file) {

      fileData = { filename: req.file.filename, originalName: req.file.originalname, path: req.file.path, size: req.file.size, mimeType: req.file.mimetype };

    } else if (filePath) {

      try {

        const stats = await fs.stat(filePath);

        const uploadDir = path.join(__dirname, '../uploads');

        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        const filename = uniqueSuffix + '-' + path.basename(filePath);

        const destPath = path.join(uploadDir, filename);

        await fs.copyFile(filePath, destPath);

        fileData = { filename: filename, originalName: path.basename(filePath), path: destPath, size: stats.size, mimeType: 'application/octet-stream' };

      } catch (error) {

        logger.error('Error copying file from path:', error);

        return res.status(400).json({ error: 'Failed to access file at provided path' });

      }

    } else {

      return res.status(400).json({ error: 'Either upload a file or provide a file path' });

    }



    const file = new File({

      filename: fileData.filename, fileName: fileName, originalName: fileData.originalName, path: fileData.path, filePath: filePath || null,

      size: fileData.size, mimeType: fileData.mimeType, category: category, storageLocation: storageLocation || 'local', uploadedBy: req.user._id

    });

    await file.save();

    logger.info(\`Custom file uploaded: \${fileName} (\${category}) by \${req.user.email}\`);

    res.status(201).json({ message: 'File uploaded successfully', file });

  } catch (error) {

    logger.error('Custom file upload error:', error);

    res.status(500).json({ error: error.message || 'Failed to upload file' });

  }

});



// Get user's custom uploads

router.get('/user-uploads', auth, async (req, res) => {

  try {

    const files = await File.find({ uploadedBy: req.user._id, category: { \$exists: true, \$ne: null } }).sort({ createdAt: -1 });

    res.json({ files });

  } catch (error) {

    logger.error('Get user uploads error:', error);

    res.status(500).json({ error: 'Failed to fetch files' });

  }

});



// Get custom upload by ID

router.get('/user-uploads/:id', auth, async (req, res) => {

  try {

    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });

    if (!file) return res.status(404).json({ error: 'File not found' });

    res.json({ file });

  } catch (error) {

    logger.error('Get user upload error:', error);

    res.status(500).json({ error: 'Failed to fetch file' });

  }

});



// Download custom upload

router.get('/user-uploads/:id/download', auth, async (req, res) => {

  try {

    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });

    if (!file) return res.status(404).json({ error: 'File not found' });

    res.download(file.path, file.fileName || file.originalName);

  } catch (error) {

    logger.error('Download user upload error:', error);

    res.status(500).json({ error: 'Failed to download file' });

  }

});



// Delete custom upload

router.delete('/user-uploads/:id', auth, async (req, res) => {

  try {

    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });

    if (!file) return res.status(404).json({ error: 'File not found' });

    try { await fs.unlink(file.path); } catch (error) { logger.warn(\`Could not delete physical file: \${error.message}\`); }

    await file.deleteOne();

    logger.info(\`Custom file deleted: \${file.fileName} by \${req.user.email}\`);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {

    logger.error('Delete user upload error:', error);

    res.status(500).json({ error: 'Failed to delete file' });

  }

});



module.exports = router;

