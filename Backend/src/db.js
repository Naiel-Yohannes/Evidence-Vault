const { Pool } = require('pg');
const { POSTGRES_URI } = require('./utils/config');
const { error } = require('./utils/logger');

const pool = new Pool({
  connectionString: POSTGRES_URI,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  error('Unexpected error on idle client', err);
});

module.exports = pool;