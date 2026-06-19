const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied!' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user id to request
    req.userId = decoded.userId;

    next(); // Allow request to continue

  } catch (error) {
    res.status(401).json({ message: 'Invalid token!' });
  }
};

module.exports = protect;