const { startGrpcServer, getGrpcServer } = require('./grpc');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const PROTO_PATH = path.join(__dirname,'subreddit.proto');
const { createSubreddit, getSubreddit } = require('./subreddit');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const subreddit_proto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(subreddit_proto.SubredditService.service, {
    createSubreddit,
    getSubreddit
}); 