const PlayerList = require('../utils/playerList');

function acceptRequestHandler(io, socket, target, doneFn) {
  let user = PlayerList.find(target);

  if (!user) {
    socket.send('play request not attended');
    return;
  }

  const battlefieldId = target + '-' + socket.alias;

  delete socket.attendingRequestTo;
  socket.battlefieldId = battlefieldId;
  socket.join(battlefieldId);

  delete user.waitingResponseFrom;
  user.battlefieldId = battlefieldId;
  user.join(battlefieldId);

  user.emit('accepted request', { from: socket.alias });

  // To all connected clients
  io.emit('users', {
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = acceptRequestHandler;