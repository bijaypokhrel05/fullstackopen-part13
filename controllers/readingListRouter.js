const router = require('express').Router();
const { ReadingList, Blog, User } = require('../models');

// Add a blog to reading list
router.post('/', async (req, res, next) => {
    try {
        const { userId, blogId } = req.body;
        
        if (!userId || !blogId) {
            return res.status(400).json({ error: 'userId and blogId are required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Check if already in reading list
        const existing = await ReadingList.findOne({
            where: {
                userId: userId,
                blogId: blogId
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Blog already in reading list' });
        }

        const readingList = await ReadingList.create({
            userId: userId,
            blogId: blogId,
            read: false
        });

        const readingListWithBlog = await ReadingList.findByPk(readingList.id, {
            include: {
                model: Blog,
                attributes: ['id', 'author', 'title', 'url', 'likes', 'year']
            }
        });

        res.status(201).json(readingListWithBlog);
    } catch (error) {
        next(error);
    }
});

// Get user's reading list
router.get('/', async (req, res, next) => {
    try {
        const where = {};
        
        if (req.query.read !== undefined) {
            where.read = req.query.read === 'true';
        }

        const readingLists = await ReadingList.findAll({
            where: where,
            include: {
                model: Blog,
                attributes: ['id', 'author', 'title', 'url', 'likes', 'year']
            }
        });

        res.status(200).json(readingLists);
    } catch (error) {
        next(error);
    }
});

// Mark reading list item as read
router.put('/:id', async (req, res, next) => {
    try {
        const readingList = await ReadingList.findByPk(req.params.id);
        if (!readingList) {
            return res.status(404).json({ error: 'Reading list item not found' });
        }

        if (req.body.read !== undefined) {
            readingList.read = req.body.read;
            await readingList.save();
        }

        const updatedReadingList = await ReadingList.findByPk(readingList.id, {
            include: {
                model: Blog,
                attributes: ['id', 'author', 'title', 'url', 'likes', 'year']
            }
        });

        res.status(200).json(updatedReadingList);
    } catch (error) {
        next(error);
    }
});

module.exports = router;