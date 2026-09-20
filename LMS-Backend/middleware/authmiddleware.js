const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ msg: "User not found", success: false });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: "Your account is blocked", success: false });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({ msg: "Not authorized, token failed", success: false });
  }
}

module.exports = protect;