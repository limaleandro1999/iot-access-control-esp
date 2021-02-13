const app = require('express')();
const WebSocket = require('ws');
const server = new WebSocket.Server({
  host: '192.168.100.21',
  port: 3000,
});

let socketRef;
let sockets = [];

app.get('/test', (req, res) => {
  const { query: { msg } } = req;
  socketRef.send(msg);
  return res.send('mensagem enviada')
});

server.on('connection', socket => {
  socketRef = socket;
  
  console.log('conectou')
  sockets.push(socket);
  
  socket.on('message', function(msg) {
    sockets.forEach(s => s.send(msg));
  });

  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
  });
});

app.listen(3001, '192.168.100.21', () => {
  console.log('ouvindo aqui')
})