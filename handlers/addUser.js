const PlayerList = require('../utils/playerList');

function addUserHandler(io, socket, alias, doneFn) {
  if (!alias) {
    return;
  }

  if (PlayerList.checkIfAliasAlreadyInUse(alias)) {
    // notify that the alias is already in use
    socket.send('alias in use')
    return;
  }

  PlayerList.push(socket, alias);

  socket.emit('signed in', {
    alias: alias,
    users: PlayerList.getPlayerListNormalized()
  });

  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('user joined', {
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = addUserHandler;