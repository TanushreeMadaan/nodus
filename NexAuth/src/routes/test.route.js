const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Database error');
  }
});

module.exports = router;