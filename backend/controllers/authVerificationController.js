const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const checkAuth = (req, res) => {
  const token = req.cookies.token; // Retrieve token from cookies

  if (!token) {
    // If token is not found, respond with a 401 Unauthorized status
    return res
      .status(401)
      .json({ error: "Not authenticated. No token provided." });
  }

  try {
    const decoded = verifyToken(token); // Verify and decode the JWT token
    res.status(200).json({ authenticated: true, userId: decoded.id });
  } catch (error) {
    // Handle invalid or expired token
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { checkAuth };
