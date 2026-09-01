const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted id' })
  }
  if (err.code === 11000 || err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate key error' })
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }
  console.log(err.message)

  return res.status(500).json({ error: 'Internal server error' })
}

module.exports = { errorHandler }
