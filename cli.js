require('dotenv').config();
const { Sequelize, Model, DataTypes } = require('sequelize');
const express = require('express');

const app = express();
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

class Blog extends Model { }
Blog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        author: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'blog'
})

app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.findAll();
    res.json(blogs);
})

app.post('/api/blogs', async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.json(blog);
    } catch(err) {
        return res.status(400).json({ err });
    }
})

app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!note) {
        return res.status(404).json({ error: 'Blog not found' })
        }

        await blog.destroy();
        res.status(201).end();
    } catch(err) {
        res.status(500).json({ err: 'Something went wrong' })
    }
})

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});