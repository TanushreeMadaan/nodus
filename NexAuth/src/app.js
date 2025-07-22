const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const testRoutes = require('./routes/test.route');
const authRoutes = require('./routes/auth.route'); 
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(generalLimiter);

// Routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to NexAuth!');
});

module.exports = app;