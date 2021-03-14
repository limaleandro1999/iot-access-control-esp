const WebSocket = require('ws');
const { URLSearchParams } = require('url');

exports.setWebSocketSeverUp = (httpServerRef, sockets = []) => {
  const wss = new WebSocket.Server({
    server: httpServerRef,
  });

  wss.on('connection', (socket, request) => {
    const urlObj = new URLSearchParams(request.url);
    console.log('conectou', urlObj.get('/?uuid'));
    sockets.push({ ref: socket, uuid: urlObj.get('/?uuid') });
    
    socket.on('message', function(msg) {
      sockets.forEach(s => s.send(msg));
    });
  
    socket.on('close', function() {
      sockets = sockets.filter(s => s !== socket);
    });
  });
}