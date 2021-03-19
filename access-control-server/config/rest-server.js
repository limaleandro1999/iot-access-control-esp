const app = require('express')();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const {db, TABLES} = require('../db');

function verifyJWT(req, res, next) {
  const token = req.headers['authorization'].replace('Bearer ', '');
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.', reason: err.message });
    req.userId = decoded.id;
    return next();
  });
}

exports.setRestServerUp = (sockets = []) => {
  app.use(bodyParser.json());
  app.use((req, _res, next) => {
    console.log(`=> ${req.method.toUpperCase()} - ${req.path}`);
    return next();
  });

  app.get('/test', (req, res) => {
    const { query: { msg } } = req;
    sockets[0].ref.send(msg === 'verde' ? 'authorized' : 'unauthorized');
    return res.send('mensagem enviada');
  });

  app.post('/users', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username or Password missing' });
    }

    try {
      await db(TABLES.USERS).insert({ username, password });
      return res.status(201).json({ username });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });

  app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username or Password missing' });
    }

    try {
      const user = await db
        .select('username', 'id')
        .from(TABLES.USERS)
        .where('username', username)
        .andWhere('password', password);

      return res.json({
        auth: true,
        expiresIn: 3600,
        token: jwt.sign({ 
          id: user[0].id, 
          username: user[0].username
        },
        process.env.SECRET, 
        { expiresIn: 3600 })
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
    
  });

  app.post('/authorize', verifyJWT, async (req, res) => {
    const { uuid } = req.body;
    const { userId } = req;

    if (!uuid) {
      return res.status(400).json({ message: 'No UUID provided' });
    }

    const socket = sockets.find(socket => socket.uuid === uuid);

    if (!socket) {
      return res.status(404).json({ message: `There is no device with UUID: ${uuid}` });
    }

    try {
      const accessDevice = await db
        .select('name', 'id')
        .from(TABLES.ACCESS_DEVICES)
        .where('uuid', uuid);

      const result = await db
        .select('id')
        .from(TABLES.USERS_ACCESS_DEVICES)
        .where('user_id', userId)
        .andWhere('access_device_id', accessDevice[0].id);

      if (!result.length) {
        socket.ref.send('unauthorized');
        return res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      return res.status(500).json({ error });
    }

    socket.ref.send('authorized');
    return res.status(200).json({ message: 'Access granted' });
  }); 
}

exports.app = app;