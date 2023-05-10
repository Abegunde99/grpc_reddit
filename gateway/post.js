const express = require('express');
const router = express.Router();
const { requiresAuth } = require('./auth');

const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const PROTO_PATH = path.join(__dirname, 'protos', 'post.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const postService = grpc.loadPackageDefinition(packageDefinition).PostService;
const client = new postService('localhost:50051', grpc.credentials.createInsecure());

router.post('/', requiresAuth, (req, res) => { 
    const { title, description, subreddit_id } = req.body;
    if (!title || !description || !subreddit_id) {
        return res.status(401).json({ msg: "Please enter all fields" });
    } else {
        const createPostRequest = {
            post: {
                title,
                description,
                subreddit_id,
                author: req.user.id
            }
        };

        client.createPost(createPostRequest, (err, response) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: "post creation error" });
            } else {
                return res.status(200).json({ success: true, post: response });
            }
        });
    }
})

module.exports = router;
