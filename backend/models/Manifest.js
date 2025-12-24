// backend/models/Manifest.js
const mongoose = require('mongoose');

const manifestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['docker', 'kubernetes', 'terraform', 'helm', 'argocd', 'ansible', 'jenkins', 'compose']
  },
  subType: {
    type: String,
    // For kubernetes: deployment, service, configmap, secret, ingress, etc.
    // For terraform: main, variables, outputs, etc.
  },
  content: {
    type: String,
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  version: {
    type: String,
    default: '1.0.0'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
manifestSchema.index({ userId: 1, type: 1 });
manifestSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Manifest', manifestSchema);