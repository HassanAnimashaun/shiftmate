const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const tokenFromCookie = req.cookies && req.cookies.token;
  const authHeader = req.headers["authorization"];
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ msg: "Authentication required" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ msg: "Authentication service misconfigured" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed", err);
    res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports = verifyToken;
