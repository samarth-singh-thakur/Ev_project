const router  = require('express').Router();
const Station = require('../models/Station');
const protect = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/stations  (with optional filters: ?status=Active&connectorType=CCS)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)        filter.status = req.query.status;
    if (req.query.connectorType) filter.connectorType = req.query.connectorType;
    if (req.query.minPower)      filter.powerOutput = { $gte: Number(req.query.minPower) };

    const stations = await Station.find(filter).sort({ createdAt: -1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stations
router.post('/', async (req, res) => {
  try {
    const station = await Station.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(station);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/stations/:id
router.put('/:id', async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/stations/:id
router.delete('/:id', async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;