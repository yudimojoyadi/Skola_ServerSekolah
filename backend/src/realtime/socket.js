let io;

exports.init = (server) => {
  io = require('socket.io')(server, { cors: { origin: '*' } });
  return io;
};

exports.get = () => io;