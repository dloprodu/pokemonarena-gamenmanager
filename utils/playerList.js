/**
 * List of players. All the player with a room assigned mean that they
 * are playing with another user.
 * {
 *   alias: string
 *   loggedAt: string
 *   battlefieldId: string
 *   waitingResponseFrom: string
 *   attendingRequestTo: string
 * }
 */
const players = [];

function PlayerList() {}

// Static methods

PlayerList.push = function(socket, alias) {
  // we store the username in the socket session for this client
  socket.alias = alias;
  socket.loggedAt = (new Date()).toISOString();
  players.push(socket);
}

PlayerList.find = function(alias) {
  return players.find(u => u.alias === alias);
}

/**
 * Checks if the alias is already in use.
 */
PlayerList.checkIfAliasAlreadyInUse = function(alias) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].alias === alias) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the formatted logged user list.
 */
PlayerList.getPlayerListNormalized = function() {
  return players.map(u => ({
    alias: u.alias,
    loggedAt: u.loggedAt,
    battlefieldId: u.battlefieldId,
    waitingResponseFrom: u.waitingResponseFrom,
    attendingRequestTo: u.attendingRequestTo
  }));
}

/**
 * Removes an user from the logged user list.
 */
PlayerList.removeUser = function(alias) {
  let index = players.findIndex(user => user.alias === alias);
  if (index === -1) {
    return;
  }

  players.splice(index, 1);
}

/**
 * Check if the user was playing a battle. If it's so, notify to the opponent
 * that the user has left.
 */
PlayerList.disconnectBattle = function(socket) {
  const battlefieldId = socket.battlefieldId;

  if (!battlefieldId) {
    return;
  }

  const opponent = battlefieldId.split('-').filter(u => u !== socket.alias);
  const opponentRef = players.find(u => u.alias === opponent);

  if (!opponentRef) {
    return;
  }

  socket.leave(battlefieldId);
  opponentRef.leave(battlefieldId);

  delete socket.battlefieldId;
  delete opponentRef.battlefieldId;

  opponentRef.send('opponent disconnected');
}

PlayerList.removeWaitingResponseFromFlag = function(socket) {
  if (!socket.attendingRequestTo) {
    return;
  }

  const user =  players.find(user => user.alias === socket.attendingRequestTo);

  if (!user) {
    return;
  }

  delete user.waitingResponseFrom;
}

PlayerList.removeAttendingRequestToFlag = function(socket) {
  if (!socket.waitingResponseFrom) {
    return;
  }

  const user =  players.find(user => user.alias === socket.waitingResponseFrom);

  if (!user) {
    return;
  }

  delete user.attendingRequestTo;
}

module.exports = PlayerList;