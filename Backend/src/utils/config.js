require('dotenv').config();

const PORT = process.env.PORT || 5001;
const SECRET = process.env.SECRET;
const POSTGRES_URI = process.env.POSTGRES_URI;

module.exports = {
  PORT,
  SECRET,
  POSTGRES_URI
};
