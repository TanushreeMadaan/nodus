const express = require("express");
const router = express.Router();
const { signup, loginUser } = require("../controllers/auth.controller");
const requireAuth = require("../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");

router.post("/signup", signup);
router.post("/login", loginUser);

router.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "✅ You are authorized!",
    user: req.user,
  });
});

router.post("/refresh", (req, res) => {
  const  refreshToken  = req.body.refreshToken;
  //console.log("Refresh Token:", refreshToken);
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
    res.json({ accessToken });
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
