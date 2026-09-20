const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        msg: "Not authorized",
        success: false,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "You are not authorized to access this resource",
        success: false,
      });
    }

    next();
  };
};

module.exports = authorize;