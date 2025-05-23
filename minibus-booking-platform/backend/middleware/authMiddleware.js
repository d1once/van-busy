const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary

// Middleware to protect routes by verifying token and attaching user to request
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      // Ensure role is selected if it's not by default, though .select('-password') should keep other fields
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        // This case might occur if a user is deleted after a token is issued.
        return res.status(401).json({ message: 'User not found for token' });
      }
      
      next(); // User is authenticated, proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      // Differentiate between token failure and other errors if necessary
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the authenticated user is an admin
const isAdmin = (req, res, next) => {
  // This middleware should run after 'protect', so req.user should be populated.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // If req.user is not populated, it means 'protect' did not run or failed.
    // However, 'protect' should handle its own response.
    // This check is primarily for the role.
    res.status(403).json({ message: 'Not authorized, admin role required' });
  }
};

module.exports = { protect, isAdmin };
