
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Forum = require('../models/Forum');
// const Forums = require('../models/CreateForum');
// const authenticateUser = require('../middleware/authenticateUser');  // Adjust the path as necessary
// const Field = require('../models/Field');
// // const Forum = require('../models/Forum'); // If it's Forum model you're using
// const router = express.Router();
// const CreateForum = require('../models/CreateForum');

// // Existing multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });


// router.post('/', upload.array('images', 5), authenticateUser, async (req, res) => {
//   try {
//     const { title, note } = req.body;
//     const images = req.files ? req.files.map((file) => file.path) : [];

//     // Ensure that user is set properly
//     const userId = req.user ? req.user._id : null;  // The user is set by authenticateUser middleware

//     // If user is not authenticated, return an error
//     if (!userId) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     // Handle multiple forum posts
//     const forumsData = Array.isArray(title) ? title.map((_, index) => ({
//       title: title[index],
//       note: note[index],
//       images: images.slice(index * 5, (index + 1) * 5), // Handling images in batches
//       user: userId,
//     })) : [{
//       title,
//       note,
//       images,
//       user: userId,
//     }];

//     // Create forum posts
//     const newForums = await Forum.insertMany(forumsData);

//     res.status(201).json({
//       message: 'Forum submitted successfully!',
//       forums: newForums,
//     });
//   } catch (error) {
//     console.error('Error during forum submission:', error);  // Detailed log
//     res.status(500).json({
//       message: 'Error submitting forum',
//       error: error.message,
//     });
//   }
// });

// // Create a new forum
// router.post('/', authenticateUser, async (req, res) => {
//   const { forumName, fields } = req.body;

//   if (!forumName || !fields || fields.length === 0) {
//     return res.status(400).json({ message: 'Forum name and fields are required' });
//   }

//   try {
//     // Create a new forum
//     const forum = new Forum({
//       forumName,
//       createdBy: req.user._id,
//     });

//     // Save forum
//     await forum.save();

//     // Create fields and link them to the forum
//     const fieldPromises = fields.map(async (field) => {
//       const newField = new Field({
//         name: field.name,
//         type: field.type,
//         form: forum._id, // Link field to the forum
//       });
//       await newField.save();
//       return newField._id;
//     });

//     // Wait for all fields to be created
//     const fieldIds = await Promise.all(fieldPromises);

//     // Link the field IDs to the forum
//     forum.fields = fieldIds;
//     await forum.save();

//     res.status(201).json({
//       message: 'Forum created successfully',
//       forum,
//     });
//   } catch (error) {
//     console.error('Error creating forum:', error.message);
//     res.status(500).json({ message: 'Error creating forum', error: error.message });
//   }
// });

// // Route to get all forums
// router.get('/', async (req, res) => {
//   try {
//     const forums = await Forum.find(); // Fetch all forums from MongoDB
//     res.status(200).json(forums);
//   } catch (error) {
//     console.error('Error fetching forums:', error);
//     res.status(500).json({ message: 'Error fetching forums', error: error.message });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const forumPost = await Forum.findByIdAndDelete(req.params.id);
//     if (!forumPost) {
//       return res.status(404).json({ message: 'Forum post not found' });
//     }
//     res.status(200).json({ message: 'Forum post deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting forum post' });
//   }
// });

// module.exports = router;

const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require('multer');
const path = require('path');
const Forum = require('../models/Forum');  // Correct model import
const authenticateUser = require('../middleware/authenticateUser');  // Adjust the path as necessary
const Field = require('../models/Field');  // Make sure this is the correct path for your Field model
const router = express.Router();
const forumsController = require('../controller/forumsController');
const verifyAdmin = require('../middleware/verifyAdmin');
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route to create a forum post
router.post('/', upload.array('images', 5), authenticateUser, async (req, res) => {
  try {
    const { title, note } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Handle multiple forum posts (if title is an array)
    const forumsData = Array.isArray(title) ? title.map((_, index) => ({
      title: title[index],
      note: note[index],
      images: images.slice(index * 5, (index + 1) * 5),
      user: userId,
    })) : [{
      title,
      note,
      images,
      user: userId,
    }];

    const newForums = await Forum.insertMany(forumsData);

    res.status(201).json({
      message: 'Forum submitted successfully!',
      forums: newForums,
    });
  } catch (error) {
    console.error('Error during forum submission:', error);
    res.status(500).json({
      message: 'Error submitting forum',
      error: error.message,
    });
  }
});

// added middlewre
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

router.post('/create', authenticate, async (req, res) => {
  const { forumName, fields } = req.body;

  if (!forumName) {
    return res.status(400).json({ message: 'Forum name is required.' });
  }

  if (!fields || fields.length === 0) {
    return res.status(400).json({ message: 'At least one field is required.' });
  }

  if (fields.some(field => !field.name || !field.type)) {
    return res.status(400).json({ message: 'All fields must have a name and type.' });
  }

  try {
    const newField = new Field({
      forumName,
      fields,
      createdBy: req.user.id,
    });

    await newField.save();
    return res.status(201).json({ message: 'Forum created successfully', field: newField });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating forum', error: error.message });
  }
});
// Route to get all forums
router.get('/', async (req, res) => {
  try {
    const forums = await Forum.find();
    res.status(200).json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ message: 'Error fetching forums', error: error.message });
  }
});


// router.delete('/api/fields/:id', verifyAdmin, async (req, res) => {
//   try {
//     const { forumId } = req.params;

//     // Find and delete the forum by ID
//     const deletedForum = await Field.findByIdAndDelete(forumId);

//     if (!deletedForum) {
//       return res.status(404).json({ message: 'Forum not found' });
//     }

//     // Return success message
//     res.status(200).json({ message: 'Forum deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting forum:', err);
//     res.status(500).json({ message: 'Error deleting forum' });
//   }
// });

// router.delete('/api/fields/id', async (req, res) => {
//   const { fields } = req.params;

//   try {
//     // Delete the forum document by its `forumName`
//     const deletedForum = await Field.deleteOne({ fields });

//     if (deletedForum.deletedCount === 0) {
//       return res.status(404).json({ message: 'Forum not found' });
//     }

//     res.status(200).json({ message: `Forum "${forumName}" deleted successfully.` });
//   } catch (error) {
//     console.error('Error deleting forum:', error);
//     res.status(500).json({ message: 'Failed to delete forum', error });
//   }
// });

router.delete('/:forumName', async (req, res) => {
  const { forumName } = req.params;
  try {
    const deletedForum = await Field.findOneAndDelete({ forumName });

    if (!deletedForum) {
      return res.status(404).json({ message: `Forum "${forumName}" not found.` });
    }

    res.status(200).json({ message: `Forum "${forumName}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting forum:', error);
    res.status(500).json({ message: 'Failed to delete forum', error });
  }
});


router.get('api/fields', forumsController.getForums);
// Route to delete a forum by ID
router.delete('/:id', async (req, res) => {
  try {
    const forumPost = await Forum.findByIdAndDelete(req.params.id);
    if (!forumPost) {
      return res.status(404).json({ message: 'Forum post not found' });
    }
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting forum post' });
  }
});

router.get('/api/forums', async (req, res) => {
  try {
    const fields = await Field.find().populate('createdBy', 'name'); // Populate user data if needed
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch forums', error });
  }
});

module.exports = router;

