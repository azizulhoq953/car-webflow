
const authenticateUser = require('../middleware/authenticateUser');
const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const Forum = require('../models/Forum'); // Replace with your forum model
const fs = require('fs');
const path = require('path');

router.get('/admin', authenticateUser, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access forbidden' });
  }
  
  res.status(200).json({ message: 'Welcome to Admin Dashboard' });
});

// router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
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

router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const forumPost = await Forum.findById(req.params.id);

    if (!forumPost) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Delete associated images if they exist
    if (forumPost.images && forumPost.images.length > 0) {
      forumPost.images.forEach((image) => {
        // Assuming images are stored in 'uploads/' folder
        const imagePath = path.join(__dirname, '..', 'uploads', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);  // Delete the file
        }
      });
    }

    // Delete the forum post from the database
    await forumPost.deleteOne();
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ message: 'Error deleting forum post' });
  }
});

module.exports = router;
