
// /home/claude/Devops-full-managed-dashboard-main/backend/models/File.js

const mongoose = require('mongoose');



const fileSchema = new mongoose.Schema({

  filename: { type: String, required: true },

  fileName: { type: String, required: true },

  originalName: { type: String, required: true },

  path: { type: String, required: true },

  filePath: { type: String },

  size: { type: Number, required: true },

  mimeType: { type: String, required: true },

  type: { type: String, enum: ['docker', 'kubernetes', 'ansible', 'terraform', 'other'], default: 'other' },

  category: { type: String, enum: ['Docker', 'Terraform', 'Kubernetes', 'Helm', 'ArgoCD', 'Jenkins'], required: false },

  storageLocation: { type: String, enum: ['local', 's3'], default: 'local' },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  createdAt: { type: Date, default: Date.now }

});



module.exports = mongoose.model('File', fileSchema);

