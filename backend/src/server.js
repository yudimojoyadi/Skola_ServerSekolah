require('dotenv').config();

const app = require('./app');
const http = require('http');
const { init } = require('./realtime/socket');

const server = http.createServer(app);
init(server);

server.listen(process.env.PORT, '0.0.0.0', () => {
  console.log('Server running');
});