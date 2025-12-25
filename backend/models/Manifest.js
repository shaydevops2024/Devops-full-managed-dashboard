
// /home/claude/devops-dashboard/backend/models/Manifest.js

const mongoose = require('mongoose');



const manifestSchema = new mongoose.Schema({

  name: {

    type: String,

    required: true

  },

  type: {

    type: String,

    enum: ['docker', 'kubernetes', 'ansible', 'terraform'],

    required: true

  },

  content: {

    type: String,

    required: true

  },

  description: {

    type: String

  },

  tags: [{

    type: String

  }],

  createdBy: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    required: true

  },

  createdAt: {

    type: Date,

    default: Date.now

  },

  updatedAt: {

    type: Date,

    default: Date.now

  }

});



manifestSchema.pre('save', function(next) {

  this.updatedAt = Date.now();

  next();

});



module.exports = mongoose.model('Manifest', manifestSchema);

