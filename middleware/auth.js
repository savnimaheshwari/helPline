const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          error: 'User account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not authorized, no token'
    });
  }
};

// Middleware to check if user is verified
const requireVerification = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Account not verified. Please verify your Purdue email address.'
    });
  }
  next();
};

// Middleware to check if user has health profile
const requireHealthProfile = async (req, res, next) => {
  try {
    const HealthProfile = require('../models/HealthProfile');
    const healthProfile = await HealthProfile.findOne({ userId: req.user._id });
    
    if (!healthProfile) {
      return res.status(404).json({
        error: 'Health profile not found. Please complete your health information first.'
      });
    }
    
    req.healthProfile = healthProfile;
    next();
  } catch (error) {
    console.error('Health profile check error:', error);
    return res.status(500).json({
      error: 'Error checking health profile'
    });
  }
};

// Middleware to check user permissions (admin, staff, etc.)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    // For now, we'll implement basic role checking
    // You can expand this based on your needs
    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }

    if (roles.includes('staff') && req.user.isStaff) {
      return next();
    }

    if (roles.includes('user')) {
      return next();
    }

    return res.status(403).json({
      error: 'Insufficient permissions'
    });
  };
};

// Middleware to rate limit specific actions
const rateLimitAction = (action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const userId = req.user ? req.user._id.toString() : req.ip;
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    // Clean old attempts
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key);
      userAttempts.timestamps = userAttempts.timestamps.filter(
        timestamp => now - timestamp < windowMs
      );
      
      if (userAttempts.timestamps.length >= maxAttempts) {
        return res.status(429).json({
          error: `Too many ${action} attempts. Please try again later.`
        });
      }
    }

    // Record attempt
    if (!attempts.has(key)) {
      attempts.set(key, { timestamps: [] });
    }
    attempts.get(key).timestamps.push(now);

    next();
  };
};

// Middleware to log user actions
const logUserAction = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`User ${req.user._id} (${req.user.email}) performed action: ${action}`);
    }
    next();
  };
};

module.exports = {
  protect,
  requireVerification,
  requireHealthProfile,
  requireRole,
  rateLimitAction,
  logUserAction
};
