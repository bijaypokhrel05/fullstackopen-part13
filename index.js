const express = require('express');
const { connectToDatabase } = require('./util/db');
const { PORT } = require('./util/config');
const blogRouter = require('./controllers/blogRouter');
const usersRouter = require('./controllers/usersRouter');
const loginRouter = require('./controllers/loginRouter');
const logoutRouter = require('./controllers/logoutRouter');
const readingListRouter = require('./controllers/readingListRouter');
const { errorHandler } = require('./util/middleware');

const app = express();
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/readinglists', readingListRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/blogs', blogRouter);

app.use(errorHandler);

const start = () => {
    connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
    });
};

start();

