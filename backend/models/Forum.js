
const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
