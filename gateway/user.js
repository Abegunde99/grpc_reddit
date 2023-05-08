const express = require('express');
const router = express.Router();

const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const PROTO_PATH = path.join(__dirname, 'protos', 'user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const userService = grpc.loadPackageDefinition(packageDefinition).UserService;
const client = new userService('localhost:50050', grpc.credentials.createInsecure());


router.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
        return res.status(401).json({ msg: "Please enter all fields" });
    } else {
        const createUserRequest = {
            user: {
                username,
                email,
                password
            }
        };
        client.createUser(createUserRequest, (err, response) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: "user creation error" });
            } else {
                const user = {
                    id: response.response.id,
                    username,
                    email
                };
                return res.status(200).json({ user });
            }
        });
    }
})

module.exports = router;
