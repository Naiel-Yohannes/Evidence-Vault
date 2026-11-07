const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { SECRET } = require('../utils/config');
const pool = require('../db');

const passwordRequirements = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (password) => /[^A-Za-z0-9\s]/.test(password),
  },
];

const getPasswordRequirementFailures = (password) =>
  passwordRequirements.filter((requirement) => !requirement.test(password));

const register = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const unmetRequirements = getPasswordRequirementFailures(password);
    if (
      unmetRequirements.length > 0 ||
      !validator.isStrongPassword(password)
    ) {
      return res.status(400).json({
        error: 'Password does not meet the requirements',
        unmetRequirements: unmetRequirements.map(({ id, label }) => ({ id, label })),
      });
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
        : await bcrypt.compare(password, user.rows[0].password);

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
