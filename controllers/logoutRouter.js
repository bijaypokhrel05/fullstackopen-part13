const router = require('express').Router();
const { Session } = require('../models');
const { tokenExtractor, sessionChecker } = require('../util/middleware');

router.delete('/', tokenExtractor, sessionChecker, async (req, res, next) => {
    try {
        // Delete the session from database
        await Session.destroy({
            where: {
                token: req.token
            }
        });

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;

