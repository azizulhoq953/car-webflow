// // models/Field.js
// const mongoose = require('mongoose');

// const fieldSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ['text', 'number', 'date', 'textarea', 'email'], // Defining possible field types
//     required: true,
//   },
//   form: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Forum', // Reference to Form model
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   }
// });

// module.exports = mongoose.model('Field', fieldSchema);
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({

  forumName: {
    type: String,
    required: true, // Forum name is required
    index: true, // Index for fast search
  },
  fields: [{
    name: {
      type: String,
      required: true, // Field name is required
    },
    type: {
      type: String,
      enum: ['text', 'number', 'email', 'date', 'checkbox'], // Field types: text, number, email, etc.
      required: true, // Field type is required
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model and want to store the creator's ID
    required: true, // User ID is required to link the forum to a user
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set updated date
  },
});

// Automatically update `updatedAt` when the document is modified
fieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
