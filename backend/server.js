const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const forumRoutes = require('./routes/forumRoutes');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const path = require('path');
const authenticateUser = require('./middleware/authenticateUser'); 
const Forum = require('./models/Forum');  // Make sure this import is at the top
const verifyAdmin = require('./middleware/verifyAdmin'); 
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const Field = require('./models/Field');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// this are fetch forum create user name
app.get('/api/forums', async (req, res) => {
  try {
    const forums = await Forum.find().populate('user', 'username'); // Populate user data with the 'username' field
    res.json(forums);
  } catch (err) {
    console.error('Error fetching forums:', err);
    res.status(500).json({ message: 'Error fetching forums' });
  }
});

app.get('/api/fields', async (req, res) => {
  try {
    const fields = await Field.find().populate('createdBy', 'username'); // Populate 'createdBy' field with the 'username'
    
    // Format the data for better presentation
    const formattedFields = fields.map(field => ({
      forumName: field.forumName,
      fields: field.fields,
      createdBy: field.createdBy.username,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt
    }));

    res.json(formattedFields); // Return the formatted data
  } catch (err) {
    console.error('Error fetching fields:', err);
    res.status(500).json({ message: 'Error fetching fields' });
  }
});

// app.delete('api/fields/id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const forum = await Field.findByIdAndDelete(id); // Adjust according to your ORM
//     if (!forum) {
//       return res.status(404).json({ message: 'Forum not found' });
//     }
//     res.status(200).json({ message: 'Forum deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting forum', error });
//   }
// });

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

    // Generate the JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the response with the token and isAdmin field
    res.json({
      message: 'Login successful',
      token,
      isAdmin: user.isAdmin, // Include isAdmin here
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
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
app.put('/api/forums/:id', async (req, res) => {
  try {
    const forumId = req.params.id;
    const forum = await Forum.findById(forumId);

    if (!forum) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Proceed with updating the forum post...
    forum.title = req.body.title;
    forum.note = req.body.note;
    // Handle image updates here...

    await forum.save();
    res.status(200).json({ updatedForum: forum });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use routes for forum and auth
app.use('/api/forums', forumRoutes);
app.use('/api/auth', authRoutes); // Use authRoutes for authentication
// Start the server
app.use('/api/fields', forumRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

