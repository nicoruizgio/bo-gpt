const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    // **DEBUGGING STEP: Log before sending response**
    console.log("Login successful. Sending response:", {
      token,
      username: user.username,
      participantId: user.id,
    });

    // **Send the response**
    res.setHeader("Content-Type", "application/json"); // Ensure JSON response
    res
      .status(200)
      .json({ token, username: user.username, participantId: user.id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { loginUser };

// Ensure it is exported correctly
module.exports = { registerUser, loginUser };
