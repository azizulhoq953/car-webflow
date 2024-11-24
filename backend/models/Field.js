const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({

  forumName: {
    type: String,
    required: true, 
    index: true, 
  },
  fields: [{
    name: {
      type: String,
      required: true, 
    },
    type: {
      type: String,
      enum: ['text', 'number', 'email', 'date', 'checkbox'], 
      required: true, 
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model and want to store the creator's ID
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


fieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
