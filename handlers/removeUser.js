const PlayerList = require('../utils/playerList');

function removeUserHandler(io, socket, doneFn) {
  PlayerList.checkIfUserIsAttendingRequest(socket);
  PlayerList.removeUser(socket.alias);

  // echo globally that this client has left
  socket.emit('signed out', {
    alias: socket.alias,
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = removeUserHandler;