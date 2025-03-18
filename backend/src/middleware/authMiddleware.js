import pkg from 'jsonwebtoken';
const { verify } = pkg;

const atuhMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authenticated. No token provided." });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET); // Verify token
    req.user = { id: decoded.id }; // Attach participant ID to request
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export default atuhMiddleware;
