const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { error: logError } = require('./utils/logger');
const { tokenExtractor } = require('./middleware/auth.middleware');
const { errorHandler } = require('./middleware/error-handler.middleware');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(tokenExtractor);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
});

app.use(errorHandler);

module.exports = app;
