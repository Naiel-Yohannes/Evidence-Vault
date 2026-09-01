const jwt = require('jsonwebtoken');
const { SECRET } = require('../utils/config');
const pool = require('../db');
const { error: logError } = require('../utils/logger');

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization');
  if (authorization && authorization.startsWith('Bearer')) {
    req.token = authorization.replace('Bearer ', '');
  } else {
    req.token = null;
  }
  next();
};

const userExtractor = async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(req.token, SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await pool.query(
      `
      SELECT id, name, username FROM users WHERE id = $1
      `,
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    logError('Auth error:', "Internal server error");
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { tokenExtractor, userExtractor };
