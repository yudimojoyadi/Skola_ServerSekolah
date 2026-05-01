require('dotenv').config();

const app = require('./app');
const http = require('http');
const { init } = require('./realtime/socket');

const server = http.createServer(app);
init(server);

server.listen(process.env.PORT, () => {
  console.log('Server running');
});