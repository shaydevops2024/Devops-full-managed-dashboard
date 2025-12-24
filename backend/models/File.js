// backend/models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['docker', 'kubernetes', 'terraform', 'helm', 'argocd', 'ansible', 'jenkins', 'other'],
    default: 'other'
  },
  content: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ userId: 1 });

module.exports = mongoose.model('File', fileSchema);