const express = require("express");
const router = express.Router();
const { signup, loginUser } = require("../controllers/auth.controller");
const {requireAuth, authorizeRole} = require("../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");
const  { loginLimiter }  = require("../middlewares/rateLimiter"); 

router.post("/signup", signup);
router.post("/login", loginLimiter, loginUser);

router.get("/protected", requireAuth, (req, res) => {
  res.json({message: `Hello, ${req.user.email}`});
});

router.get('/admin-only', requireAuth, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

router.get('/user-only', requireAuth, authorizeRole('user'), (req, res) => {
  res.json({ message: 'Welcome User!' });
});

router.post("/refresh", (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);

    // Rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Tokens rotated" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post('/logout', (req, res) => {
  res
    .clearCookie('accessToken', { httpOnly: true, sameSite: 'Strict', secure: true })
    .clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', secure: true })
    .json({ message: 'Logged out successfully' });
});

module.exports = router;
