/* Authentication Controller */

import pkg from "jsonwebtoken";
const { verify } = pkg;

const verifyToken = (token) => {
  return verify(token, process.env.JWT_SECRET);
};

const checkAuth = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authenticated. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default checkAuth;
