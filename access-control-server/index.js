require('dotenv').config()
const http = require('http');

const PORT = process.env.PORT || 3000;
const webSocketServer = require('./config/web-socket-server');
const restServer = require('./config/rest-server');

const connectedSockets = [];

restServer.setRestServerUp(connectedSockets);

const server = http.createServer(restServer.app);
server.listen(PORT, '192.168.100.57', () => {
  console.log(`# Server is listening on ${PORT}`);
}); 

webSocketServer.setWebSocketSeverUp(server, connectedSockets);