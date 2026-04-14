const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/search?q=searchterm
// Returns users whose userId or displayName matches the query
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { userId: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    }).limit(8).select('userId displayName initials avatarColor bio');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:userId — get a single user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — register a new user
router.post('/', async (req, res) => {
  try {
    const { userId, displayName, bio, avatarColor } = req.body;
    if (!userId || !displayName) return res.status(400).json({ error: 'userId and displayName are required' });

    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const user = new User({ userId, displayName, bio, avatarColor, initials });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'User ID already taken' });
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
