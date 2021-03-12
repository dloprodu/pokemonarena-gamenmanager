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
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

/**
 * List of players. All the player with a room assigned mean that they
 * are playing with another user.
 * {
 *   alias: string
 *   loggedAt: string
 * }
 */
let players = [];

io.on('connection', (socket) => {
  let addedUser = false;

  // notify the current users
  socket.emit('users', {
    users: getPlayerListNormalized()
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (alias) => {
    if (addedUser) return;

    if (checkIfAliasAlreadyInUse(alias)) {
      socket.emit('alias in use')
      return;
    }

    // we store the username in the socket session for this client
    socket.alias = alias;
    socket.loggedAt = (new Date()).toISOString();
    players.push(socket);

    addedUser = true;
    socket.emit('logged', {
      alias: alias,
      users: getPlayerListNormalized()
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      users: getPlayerListNormalized()
    });
  });

  socket.on('remove user', () => {
    if (!addedUser) {
      return;
    }

    removeUser(socket.alias);

    // echo globally that this client has left
    socket.broadcast.emit('user left', {
      alias: socket.alias,
      users: getPlayerListNormalized()
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (!addedUser) {
      return;
    }

    removeUser(socket.alias);

    // echo globally that this client has left
    socket.broadcast.emit('user left', {
      alias: socket.alias,
      users: getPlayerListNormalized()
    });
  });

  // --------------------------------------------------------------

  // when the client emits 'new message', this listens and executes
  // socket.on('new message', (data) => {
  //   // we tell the client to execute 'new message'
  //   socket.broadcast.emit('new message', {
  //     username: socket.username,
  //     message: data
  //   });
  // });

  // when the client emits 'add user', this listens and executes
  // socket.on('add user', (username) => {
  //   if (addedUser) return;

  //   // we store the username in the socket session for this client
  //   socket.username = username;
  //   ++numUsers;
  //   addedUser = true;
  //   socket.emit('login', {
  //     numUsers: numUsers
  //   });
  //   // echo globally (all clients) that a person has connected
  //   socket.broadcast.emit('user joined', {
  //     username: socket.username,
  //     numUsers: numUsers
  //   });
  // });

  // when the client emits 'typing', we broadcast it to others
  // socket.on('typing', () => {
  //   socket.broadcast.emit('typing', {
  //     username: socket.username
  //   });
  // });

  // when the client emits 'stop typing', we broadcast it to others
  // socket.on('stop typing', () => {
  //   socket.broadcast.emit('stop typing', {
  //     username: socket.username
  //   });
  // });


});


function checkIfAliasAlreadyInUse(alias) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].alias === alias) {
      return true;
    }
  }

  return false;
}

function getPlayerListNormalized() {
  return players.map(u => { return { alias: u.alias, loggedAt: u.loggedAt }; });
}

function removeUser(alias) {
  let index = players.findIndex(user => user.alias === alias);
  if (index === -1) {
    return;
  }

  players.splice(index, 1);
}