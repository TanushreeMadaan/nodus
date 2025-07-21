const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert into DB
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

const generateRefreshToken = (user) => {
    //console.log('login refresh key', process.env.JWT_SECRET);
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = userResult.rows[0];
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

   res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  // Send refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({  message: "Login successful"  }); // client will store accessToken (e.g., in memory or localStorage)
};
module.exports = {
  signup,
  loginUser,
};
