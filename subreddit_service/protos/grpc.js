const path = require('path');
const PROTO_PATH = path.join(__dirname, 'subreddit.proto');
const grpc = require('@grpc/grpc-js');
const server = new grpc.Server();

exports.startGrpcServer = () => {
  server.bindAsync(
      '127.0.0.1:50052',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error(error);
        } else {
            server.start();
            console.log(`Server running on 127.0.0.1:${port}`);
          }
      }
    );
};

exports.getGrpcServer = () => {
  return server;
}