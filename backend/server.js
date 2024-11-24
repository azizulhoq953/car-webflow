
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const forumRoutes = require('./routes/forumRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const authenticateUser = require('./middleware/authenticateUser'); 
const verifyAdmin = require('./middleware/verifyAdmin'); 
const Forum = require('./models/Forum');
const Field = require('./models/Field');
const User = require('./models/User');

dotenv.config();

const app = express();

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Server uploaded files

// Fetch all forums with user names
app.get('/api/forums', async (req, res) => {
  try {
    const forums = await Forum.find().populate('user', 'username');
    res.json(forums);
  } catch (err) {
    console.error('Error fetching forums:', err);
    res.status(500).json({ message: 'Error fetching forums' });
  }
});

// Fetch fields and format data
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await Field.find().populate('createdBy', 'username');
    const formattedFields = fields.map(field => ({
      forumName: field.forumName,
      fields: field.fields,
      createdBy: field.createdBy.username,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    }));
    res.json(formattedFields);
  } catch (err) {
    console.error('Error fetching fields:', err);
    res.status(500).json({ message: 'Error fetching fields' });
  }
});

// User authentication and token generation
app.post('/api/signing', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, isAdmin: user.isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a forum post
app.post('/createForum', async (req, res) => {
  try {
    const { title, user, note } = req.body;
    if (!title || !user || !note) {
      return res.status(400).json({ error: 'Title, user, and note are required.' });
    }
    const newForum = new Forum({ title, user, note });
    await newForum.save();
    res.status(201).json(newForum);
  } catch (err) {
    console.error('Error creating forum:', err);
    res.status(500).json({ error: 'Server error', details: err });
  }
});

// Delete a forum post
app.delete('/api/forums/:id', authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const forumPost = await Forum.findByIdAndDelete(req.params.id);
    if (!forumPost) {
      return res.status(404).json({ message: 'Forum post not found' });
    }
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ message: 'Error deleting forum post' });
  }
});

// Update a forum post
app.put('/api/forums/:id', upload.array('images'), async (req, res) => {
  try {
    const forumId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(forumId)) {
      return res.status(400).json({ message: 'Invalid forum ID' });
    }
    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum post not found' });
    }
    console.log('Request Body:', req.body);
    console.log('Uploaded Files:', req.files);
    forum.title = req.body.title || forum.title;
    forum.note = req.body.note || forum.note;
    if (req.files && req.files.length > 0) {
      forum.images = req.files.map(file => file.filename);
    }
    await forum.save();
    res.status(200).json({ updatedForum: forum });
  } catch (err) {
    console.error('Error updating forum post:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api/forums', forumRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/fields', forumRoutes); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
