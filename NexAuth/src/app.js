const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/test.route');
const authRoutes = require('./routes/auth.route'); 

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to NAuth!');
});

module.exports = app;