const router = require('express').Router();
const { Blog, User } = require('../models');
const { tokenExtractor } = require('../util/middleware');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');

// Get all blogs
router.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.findAll({
      include: {
        model: User,
        attributes: ['name', 'username']
      }
    });
    res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
});

// Create new blog
router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const blog = await Blog.create({
      ...req.body,
      userId: user.id
    });

    const blogWithUser = await Blog.findByPk(blog.id, {
      include: {
        model: User,
        attributes: ['name', 'username']
      }
    });

    res.status(201).json(blogWithUser);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalid' });
    }
    next(error);
  }
});

// Update blog likes
router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Only allow updating likes, author, title, url if user owns the blog
    // For likes, you might want to allow any authenticated user - adjust as needed
    if (blog.userId !== decodedToken.id) {
      return res.status(403).json({ error: 'Not authorized to update this blog' });
    }

    if (req.body.likes !== undefined) {
      blog.likes = req.body.likes;
    }

    await blog.save();

    const updatedBlog = await Blog.findByPk(blog.id, {
      include: {
        model: User,
        attributes: ['name', 'username']
      }
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalid' });
    }
    next(error);
  }
});

// Delete blog
router.delete('/:id', tokenExtractor, async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.userId !== decodedToken.id) {
      return res.status(403).json({ error: 'Not authorized to delete this blog' });
    }

    await blog.destroy();
    res.status(204).end();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalid' });
    }
    next(error);
  }
});

module.exports = router;
