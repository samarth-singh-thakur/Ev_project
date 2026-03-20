require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: '⚡ EV Charging API is running' }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port 5000`));