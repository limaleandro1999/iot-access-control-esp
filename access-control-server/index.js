require('dotenv').config()
const http = require('http');

const webSocketServer = require('./config/web-socket-server');
const restServer = require('./config/rest-server');

const connectedSockets = [];

restServer.setRestServerUp(connectedSockets);

const server = http.createServer(restServer.app);
server.listen(3000, '192.168.100.57', () => {
  console.log('ouvindo aqui');
}); 

webSocketServer.setWebSocketSeverUp(server, connectedSockets);