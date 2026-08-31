const express = require('express');
const pool = require('../db');
const { error: logError } = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Backend is running',
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    logError('Health check failed: Database connection error', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

module.exports = router;
