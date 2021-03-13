const PlayerList = require('../utils/playerList');

function disconnectHandler(io, socket, doneFn) {
  PlayerList.removeWaitingResponseFromFlag(socket);
  PlayerList.removeAttendingRequestToFlag(socket);
  PlayerList.disconnectBattle(socket);
  PlayerList.removeUser(socket.alias);

  // echo globally that this client has left
  socket.broadcast.emit('user left', {
    alias: socket.alias,
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = disconnectHandler;