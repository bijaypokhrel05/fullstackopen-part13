const jwt = require('jsonwebtoken');

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'SequelizeValidationError') {
    return response.status(400).json({ 
      error: 'Validation error',
      details: error.errors.map(e => e.message)
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    // Check if it's a reading list duplicate
    if (error.errors && error.errors.some(e => e.path && e.path.includes('user_id'))) {
      return response.status(400).json({ 
        error: 'Blog already in reading list'
      });
    }
    return response.status(400).json({ 
      error: 'Unique constraint violation',
      details: error.errors.map(e => e.message)
    });
  }

  if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).json({ error: 'Database error' });
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Token invalid' });
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired' });
  }

  if (error.name === 'TypeError') {
    return response.status(400).json({ error: 'Invalid data type or missing field' });
  }

  // Default fallback
  return response.status(500).json({ error: 'Internal server error' });
};

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  } else {
    req.token = null;
  }

  next();
}

module.exports = { errorHandler, tokenExtractor };
