
// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // Ensure you have a User model defined
const jwt = require('jsonwebtoken'); // Add this for generating JWT tokens
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');


// POST: /api/auth/signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Validation: Ensure username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();
    
    // Respond with success
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create and sign JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET, // Your secret key
      { expiresIn: '1h' }
    );

    res.json({ token, isAdmin: user.isAdmin });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;



router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user;  // The user is attached by the authenticateUser middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Make sure to return the relevant fields (e.g., username, name, address, image)
    res.json({
      username: user.username,
      name: user.name,  // Assuming you have 'name' in your User model
      address: user.address,  // Assuming you have 'address' in your User model
      image: user.image,  // Assuming you have 'image' in your User model
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, address, email, phone, image } = req.body;
    const user = req.user;  // User attached by the authenticateUser middleware

    // Only update fields that are provided
    user.name = name || user.name;
    user.address = address || user.address;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.image = image || user.image;

    // Save the updated user
    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/forums/:id', authenticateUser, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Forum post not found' });

    await forum.remove(); // Or any logic you use to delete
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
