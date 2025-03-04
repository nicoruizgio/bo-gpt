const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* Logic for user registration, log in and log out*/

// Registration
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const userCheck = await pool.query(
      "SELECT * FROM participants WHERE username = $1",
      [username]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO participants (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token, username, participantId: userId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//Log in
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const userCheck = await pool.query(
      "SELECT * FROM participants WHERE username = $1",
      [username]
    );
    if (userCheck.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = userCheck.rows[0];

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Set 'secure' flag in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      sameSite: "Lax", // Makes the cookie available only on same-site requests
    });

    // Send the response
    res.setHeader("Content-Type", "application/json"); // Ensure JSON response
    res.status(200).json({ username: user.username, participantId: user.id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Log out
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true, // Ensure the cookie is cleared properly
    secure: process.env.NODE_ENV === "production", // Use secure flag in production
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Ensure both functions are exported correctly
module.exports = { registerUser, loginUser, logoutUser };
