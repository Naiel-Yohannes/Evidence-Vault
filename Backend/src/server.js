const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { error: logError } = require('./utils/logger');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
});

app.use((err, req, res, next) => {
  logError(err.message);
  res.status(500).json({ error: err.message || 'internal server error' });
});

module.exports = app;
