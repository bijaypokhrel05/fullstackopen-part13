const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Blog extends Model { };

Blog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        year: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1991,
                max(value) {
                    const currentYear = new Date().getFullYear();
                    if (value > currentYear) {
                        throw new Error(`Year cannot be greater than ${currentYear}`);
                    }
                }
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        underscored: true,
        timestamps: true,
        modelName: 'blog'
    });


module.exports = Blog;