
// /home/claude/devops-dashboard/backend/models/File.js

const mongoose = require('mongoose');



const fileSchema = new mongoose.Schema({

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

  mimeType: {

    type: String,

    required: true

  },

  type: {

    type: String,

    enum: ['docker', 'kubernetes', 'ansible', 'terraform', 'other'],

    default: 'other'

  },

  uploadedBy: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    required: true

  },

  createdAt: {

    type: Date,

    default: Date.now

  }

});



module.exports = mongoose.model('File', fileSchema);

