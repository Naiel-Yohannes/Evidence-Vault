const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { SECRET } = require('../utils/config');
const pool = require('../db');

const register = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: 'Weak password' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `
      INSERT INTO users (name, username, password)
      VALUES ($1, $2, $3)
      RETURNING username, name
      `,
      [name, username.toLowerCase(), passwordHash]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await pool.query(
      `
      SELECT id, name, username, password FROM users WHERE username = $1
      `,
      [username.toLowerCase()]
    );

    const correctPassword =
      user.rows.length === 0
        ? false
        : await bcrypt.compare(password.toLowerCase(), user.rows[0].password);

    if (!correctPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const userToken = {
      id: user.rows[0].id,
      username: user.rows[0].username,
    };

    const token = jwt.sign(userToken, SECRET, { expiresIn: '2h' });
    res.status(200).json({
      token,
      username: user.rows[0].username,
      name: user.rows[0].name,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
