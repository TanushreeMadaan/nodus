const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

  // Listen for room join
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle message sending to a room
  socket.on('chatMessage', ({ room, message }) => {
  io.to(room).emit('chatMessage', {
    room,
    sender: socket.id,
    message,
  });
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
