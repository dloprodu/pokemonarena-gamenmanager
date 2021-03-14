function resetTurnHandler(io, socket, doneFn) {
  if (!socket.battlefieldId) {
    return;
  }

  const battlefieldId = socket.battlefieldId;

  const opponent = battlefieldId.split('-').filter(u => u !== socket.alias)[0];
  const users = [opponent, socket.alias];
  const randomUser = users[Math.floor(Math.random() * users.length)];

  // Notify the turn owner to the room
  io.to(battlefieldId).emit('reset turn', randomUser);
  
  if (doneFn) {
    doneFn();
  }
}

module.exports = resetTurnHandler;