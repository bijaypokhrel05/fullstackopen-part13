const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('../util/config');

const sequelize = new Sequelize(DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorization: false
        }
    }
});

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database is connected successfully');
    } catch(err) {
        console.log('Failed to connect to database', err);
    }
};

module.exports = {sequelize, connectToDatabase};
