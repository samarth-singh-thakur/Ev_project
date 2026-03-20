const router = require('express').Router();
const mongoose = require('mongoose');
const Station = require('../models/Station');
const protect = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.connectorType) filter.connectorType = req.query.connectorType;
    if (req.query.minPower || req.query.maxPower) {
      filter.powerOutput = {};
      if (req.query.minPower) filter.powerOutput.$gte = Number(req.query.minPower);
      if (req.query.maxPower) filter.powerOutput.$lte = Number(req.query.maxPower);
    }

    const stations = await Station.find(filter).sort({ createdAt: -1 });
    return res.json(stations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid station id' });
    }

    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    return res.json(station);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const station = await Station.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json(station);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid station id' });
    }

    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    return res.json(station);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid station id' });
    }

    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    return res.json({ message: 'Station deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
