const router = require('express').Router();
const { User, Blog, ReadingList } = require('../models/index');

router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: {
                model: Blog,
                attributes: ['id', 'author', 'title', 'url', 'likes']
            }
        });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

router.post('/', async(req, res, next) => {
    try {
        const { name, username } = req.body;

        const existingUser = await User.findOne({
            where: {
                username: username
            }
        });

        if (existingUser) {
            return res.status(400).json({error: 'Username already taken'});
        }

        const user = await User.create({ 
            name, 
            username
        });
        
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const includeOptions = {
            model: Blog,
            as: 'readings',
            attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
            through: {
                model: ReadingList,
                attributes: ['id', 'read']
            }
        };

        // Filter by read status if query parameter is provided
        if (req.query.read !== undefined) {
            const readValue = req.query.read === 'true';
            includeOptions.through.where = {
                read: readValue
            };
        }

        const user = await User.findByPk(req.params.id, {
            attributes: ['name', 'username'],
            include: includeOptions
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

router.put('/:username', async (req, res, next) => {
    try {
        const username = req.params.username;
        const existingUser = await User.findOne({
            where: {
                username: username
            }
        });
        
        if (!existingUser) {
            return res.status(404).json({error: 'User not found'});
        }
        
        if (req.body.username) {
            existingUser.username = req.body.username;
        }
        if (req.body.name) {
            existingUser.name = req.body.name;
        }
        
        await existingUser.save();
        
        res.status(200).json({
            id: existingUser.id,
            name: existingUser.name,
            username: existingUser.username
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;