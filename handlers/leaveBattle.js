const PlayerList = require('../utils/playerList');

function leaveBattleHandler(io, socket, doneFn) {
  PlayerList.disconnectBattle(socket);

  // To all connected clients
  io.emit('users', {
    users: PlayerList.getPlayerListNormalized()
  });

  if (doneFn) {
    doneFn();
  }
}

module.exports = leaveBattleHandler;