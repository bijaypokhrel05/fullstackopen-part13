const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { SECRET } = require('../util/config');

router.post('/', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({
            where: {
                username: username
            }
        });

        const passwordIsCorrect = password === 'secretWord';
        
        if (!(user && passwordIsCorrect)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET
        );

        res.status(200).json({
            token,
            username: user.username,
            name: user.name
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;