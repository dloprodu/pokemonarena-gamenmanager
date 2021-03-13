const PlayerList = require('../utils/playerList');

function rejectRequestHandler(io, socket, target, doneFn) {
  let user = PlayerList.find(target);

  if (!user) {
    return;
  }

  delete socket.attendingRequestTo;
  delete user.waitingResponseFrom;

  user.emit('rejected request', { from: socket.alias });

  // To all connected clients
  io.emit('users', {
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = rejectRequestHandler;