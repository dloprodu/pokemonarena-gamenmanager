const PlayerList = require('../utils/playerList');

function playRequestHandler(io, socket, target, doneFn) {
  let user = PlayerList.find(target);

  if (!user) {
    socket.send('play request not attended');
    return;
  }

  // Mark the users who are waiting to attend a request
  socket.waitingResponseFrom = target;
  user.attendingRequestTo = socket.alias;

  // Send the 'play request' to the user
  user.emit('play request', { from: socket.alias });

  // To all connected clients
  io.emit('users', {
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = playRequestHandler;