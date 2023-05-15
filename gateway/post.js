const express = require('express');
const router = express.Router();
const { requiresAuth } = require('./auth');

const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const { getPost } = require('../post_service/protos/post');
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

router.get('/:id', requiresAuth, (req, res) => {
    const { id } = req.params;
    const getPostRequest = {
        id
    };
    client.getPost(getPostRequest, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: "post retrieval error" });
        } else {
            return res.status(200).json({ success: true, post: response });
        }
    });
});

router.put('/:id', requiresAuth, (req, res) => {
    const { id } = req.params;
    const{title, description} = req.body;
    const updatePostRequest = {
        id,
        post: {
            title,
            description
        },
        user_id: req.user.id
    };

    client.updatePost(updatePostRequest, (err, response) => {
        console.log(response)
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: "post update error" });
        } else {
            return res.status(200).json({ success: true, post: response });
        }
    });
});

router.put('/:id/like', requiresAuth, (req, res) => { 
    const { id } = req.params;
    const likePostRequest = {
        id,
        user_id: req.user.id
    };

    client.likePost(likePostRequest, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: "post like error" });
        } else {
            return res.status(200).json({ success: true, post: response });
        }
    });
});

module.exports = router;
