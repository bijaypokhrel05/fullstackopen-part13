const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('../util/config');
const { Umzug, SequelizeStorage } = require('umzug');

const sequelize = new Sequelize(DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorization: false
        }
    }
});
const migrationConf = {
    migrations: {
        glob: 'migrations/*.js'
    },
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    context: sequelize.getQueryInterface(),
    logger: console
}

const runMigrations = async () => {
    const migrator = new Umzug(migrationConf);
    const migrations = await migrator.up();
    console.log('Migrations up to date', {
        files: migrations.map(mig => mig.name)
    });
};

const rollbackMigrations = async () => {
    await sequelize.authenticate();
    const migrator = new Umzug(migrationConf);
    await migrator.down();
}

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        await runMigrations();
        console.log('Database is connected successfully');
    } catch (err) {
        console.log('Failed to connect to database', err);
    }
};

module.exports = { sequelize, connectToDatabase, rollbackMigrations };
