const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") {
    return res.status(401).json({ message: "No token" });
  }

  const parts = header.trim().split(/\s+/);
  let token = null;
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    token = parts[1] || null;
  } else if (
    parts.length === 1 &&
    !/^Bearer$/i.test(parts[0])
  ) {
    token = parts[0];
  }

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = protect;
