const { startGrpcServer, getGrpcServer } = require('./grpc');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const PROTO_PATH = path.join(__dirname,'user.proto');
const { createUser, getUser, isAuthenticated, createToken } = require('./user');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const user_proto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(user_proto.UserService.service, {
    createUser,
    getUser,
    isAuthenticated,
    createToken
}); 