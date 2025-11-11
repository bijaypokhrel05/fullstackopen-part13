const jwt = require('jsonwebtoken');
const { Session, User } = require('../models');
const { SECRET } = require('../util/config');

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

const sessionChecker = async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // Verify JWT token
    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    // Check if session exists in database
    const session = await Session.findOne({
      where: {
        token: req.token
      },
      include: {
        model: User
      }
    });

    if (!session) {
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    // Check if user is disabled
    if (session.user.disabled) {
      return res.status(403).json({ error: 'User account is disabled' });
    }

    // Attach user and session to request
    req.user = session.user;
    req.session = session;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
}

module.exports = { errorHandler, tokenExtractor, sessionChecker };
