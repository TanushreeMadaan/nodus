const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Protect routes
const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No access token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid access token" });
  }
};

module.exports = requireAuth;
