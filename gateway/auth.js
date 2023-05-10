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

exports.requiresAuth = (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];

    client.isAuthenticated({ token }, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({success: false, msg: 'user auth error' });
        } else {
            const user = {
                id: response.id,
                email: response.email,
                username: response.username
            };
            req.user = user;
        }
        next();
    });
};
    
