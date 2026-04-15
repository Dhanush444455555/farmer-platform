const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// @route   GET /api/crops
// @desc    Get all active crops
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching crops' });
  }
});

// @route   POST /api/crops
// @desc    Add a new crop
router.post('/', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Crop name is required' });
    }

    const newCrop = new Crop({
      name,
      quantity: quantity || "Growing stage"
    });

    const savedCrop = await newCrop.save();
    res.status(201).json(savedCrop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving crop' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete a crop by id
router.delete('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    await crop.deleteOne();
    res.json({ message: 'Crop removed securely', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting crop' });
  }
});

module.exports = router;
