const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const Message = require('./models/Message');
const roomRoutes = require('./routes/roomRoutes');   
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const MESSAGE_COOLDOWN_MS = 1000;

dotenv.config();
connectDB(); 

app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.lastMessageTime = 0;

  // Listen for room join
  socket.on("join-room", async (roomId) => {
    socket.join(roomId);

    // Fetch and emit old messages
    const messages = await Message.find({ room: roomId }).sort({ timestamp: 1 });
    socket.emit("previous-messages", messages);
  });

  // Handle message sending to a room
  socket.on("send-message", async ({ room, sender, message }) => {
    const now = Date.now();

    if (now - socket.lastMessageTime < MESSAGE_COOLDOWN_MS) {
      socket.emit('rateLimitWarning', 'You are sending messages too quickly.');
      return;
    }
    socket.lastMessageTime = now;
    
    const newMessage = new Message({ room, sender, message });
    await newMessage.save();

    io.to(room).emit("receive-message", {
      room,
      sender,
      message,
      timestamp: newMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
