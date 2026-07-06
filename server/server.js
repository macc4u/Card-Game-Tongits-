const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('../public'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create-room', (data, cb) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomCode, {
      players: [{id: socket.id, name: data.name, avatar: data.avatar, hand: []}],
      host: socket.id,
      state: 'waiting'
    });
    socket.join(roomCode);
    cb({roomCode});
  });

  socket.on('join-room', (data, cb) => {
    const room = rooms.get(data.code);
    if (!room) return cb({error: 'Invalid room code'});
    if (room.players.length >=4) return cb({error: 'Room full'});
    
    room.players.push({id: socket.id, name: data.name, avatar: data.avatar});
    socket.join(data.code);
    io.to(data.code).emit('player-joined', room.players);
    cb({success: true, players: room.players});
  });

  // All game events validated server-side
  socket.on('play-cards', (data) => {
    // Anti-cheat: verify cards exist in player hand
    const room = rooms.get(data.room);
    const player = room.players.find(p=>p.id === socket.id);
    const hasCards = data.cards.every(c => 
      player.hand.some(h => h.rank === c.rank && h.suit === c.suit)
    );
    if (!hasCards) return; // Block cheating
    io.to(data.room).emit('cards-played', {id: socket.id, cards: data.cards});
  });

  socket.on('disconnect', () => {
    rooms.forEach((r, k) => {
      r.players = r.players.filter(p => p.id !== socket.id);
      if (r.players.length ===0) rooms.delete(k);
      io.to(k).emit('player-left', socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Running on port ${PORT}`));
