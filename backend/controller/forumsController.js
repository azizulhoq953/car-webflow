// forumsController.js
const Field = require('../models/Field');

// Get all forums from the database
exports.getForums = async (req, res) => {
  try {
    const forums = await Field.find(); // You can add filters or pagination here if needed
    res.json(forums); // Send the fetched data as JSON
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forums', error });
  }
};
