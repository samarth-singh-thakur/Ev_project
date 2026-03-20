require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

connectDB();

app.use(cors({ origin: CLIENT_URL === '*' ? true : CLIENT_URL }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '⚡ EV Charging API is running',
    endpoints: {
      auth: '/api/auth',
      stations: '/api/stations'
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
