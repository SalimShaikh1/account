const jwt = require("jsonwebtoken");
const Session = require("../models/session");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await Session.findOne({ token, isActive: true });
    if (!session) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }
    session.lastActivity = new Date();
    await session.save();
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = auth;
