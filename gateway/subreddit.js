const express = require('express');
const router = express.Router();

const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const { requiresAuth } = require('./auth');
const PROTO_PATH = path.join(__dirname, 'protos', 'subreddit.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const subredditService = grpc.loadPackageDefinition(packageDefinition).SubredditService;
const client = new subredditService('localhost:50052', grpc.credentials.createInsecure());


router.post('/', requiresAuth, (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(401).json({ msg: "Please enter all fields" });
    } else {
        const createSubredditRequest = {
            subreddit: {
                name,
                description,
            }

        };
        client.createSubreddit(createSubredditRequest, (err, response) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: "subreddit creation error" });
            } else {
                return res.status(200).json({ success: true, subreddit: response.id });
            }
        });
    }
});

router.get('/:id', requiresAuth, (req, res) => {
    const { id } = req.params;
    const getSubredditRequest = {
        id
    };
    client.getSubreddit(getSubredditRequest, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: "subreddit retrieval error" });
        } else {
            return res.status(200).json({ success: true, subreddit: response });
        }
    });
});


module.exports = router;