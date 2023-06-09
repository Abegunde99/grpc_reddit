const express = require('express');
const app = express();
const port = 5001;
const userRouter = require('./user');
const postRouter = require('./post');
const subredditRouter = require('./subreddit');
const { requiresAuth } = require('./auth');

//middleware
// app.use(requiresAuth);
app.use(express.json());
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use('/subreddit', subredditRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});