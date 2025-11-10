const Blog = require('./blog');
const User = require('./user');

User.hasMany(Blog);
Blog.belongsTo(User);

// Sync User first, then Blog (since Blog depends on User)
User.sync({ alter: true });
Blog.sync({ alter: true });

module.exports = { Blog, User };