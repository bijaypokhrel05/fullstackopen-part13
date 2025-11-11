const router = require('express').Router();
const { Blog, User } = require('../models');
const { tokenExtractor, sessionChecker } = require('../util/middleware');

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
router.post('/', tokenExtractor, sessionChecker, async (req, res, next) => {
  try {
    const blog = await Blog.create({
      ...req.body,
      userId: req.user.id
    });

    const blogWithUser = await Blog.findByPk(blog.id, {
      include: {
        model: User,
        attributes: ['name', 'username']
      }
    });

    res.status(201).json(blogWithUser);
  } catch (error) {
    next(error);
  }
});

// Update blog likes
router.put('/:id', tokenExtractor, sessionChecker, async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Only allow updating likes, author, title, url if user owns the blog
    if (blog.userId !== req.user.id) {
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
    next(error);
  }
});

// Delete blog
router.delete('/:id', tokenExtractor, sessionChecker, async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this blog' });
    }

    await blog.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
