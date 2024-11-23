const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   name: { type: String },
//   address: { type: String },
//   image: { type: String },  // Image URL or path to the profile image
//   isAdmin: { type: Boolean, default: false },
//   password: { type: String, required: true },
// });
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Ensure it's a boolean
});


module.exports = mongoose.model('User', userSchema);
