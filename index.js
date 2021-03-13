// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PlayerList = require('./utils/playerList');

// Handlers
const addUserHandler = require('./handlers/addUser');
const removeUserHandler = require('./handlers/removeUser');
const disconnectHandler = require('./handlers/disconnect');
const playRequestHandler = require('./handlers/playRequest');
const acceptRequestHandler = require('./handlers/acceptRequest');
const rejectRequestHandler = require('./handlers/rejectRequest');

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

const MAX_TURN_WAITING = 15000;

// Chatroom
io.on('connection', (socket) => {
  let addedUser = false;

  // Notify the current users
  socket.emit('users', {
    users: PlayerList.getPlayerListNormalized()
  });

  socket.emit('max turn time', { time: MAX_TURN_WAITING });

  // 1. When the client emits 'add user', this listens and add the user
  //    to the list.
  socket.on('add user', (alias) => {
    if (addedUser) return;

    addUserHandler(io, socket, alias, () => { addedUser = true});
  });

  // 2. When the client emits 'remove user', this listens and remove the user
  //    from the list.
  socket.on('remove user', () => {
    if (!addedUser) {
      return;
    }

    removeUserHandler(io, socket, () => this.addedUser = false);
  });

  // 3. When the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (!addedUser) {
      return;
    }

    disconnectHandler(io, socket);
  });

  // 4. When the client emits 'play request', this listen and send the request to the
  //    selected user
  socket.on('play request', (target) => {
    if (!addedUser) {
      return;
    }

    playRequestHandler(io, socket, target);
  });
  
  // 5. When the client emits 'accept request' 
  socket.on('accept request', (target) => {
    if (!addedUser) {
      return;
    }

    acceptRequestHandler(io, socket, target);
  });

  // 6. When the client emits 'reject request' 
  socket.on('reject request', (target) => {
    if (!addedUser) {
      return;
    }

    rejectRequestHandler(io, socket, target);
  });

  // 7. When the client emits 'leave battle'
  socket.on('leave battle', () => {
    if (!addedUser) {
      return;
    }

    PlayerList.disconnectBattle(socket);
  });
});
