const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, requireVerification, rateLimitAction, logUserAction } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', 
  rateLimitAction('registration', 3, 60 * 60 * 1000), // 3 attempts per hour
  async (req, res) => {
    try {
      const { 
        purdueId, 
        email, 
        password, 
        firstName, 
        lastName, 
        major, 
        year 
      } = req.body;

      // Validation
      if (!purdueId || !email || !password || !firstName || !lastName) {
        return res.status(400).json({
          error: 'Please provide all required fields'
        });
      }

      // Check if user already exists
      const userExists = await User.findOne({
        $or: [{ purdueId }, { email }]
      });

      if (userExists) {
        return res.status(400).json({
          error: 'User already exists with this Purdue ID or email'
        });
      }

      // Validate Purdue email
      if (!email.endsWith('@purdue.edu')) {
        return res.status(400).json({
          error: 'Please use your Purdue University email address'
        });
      }

      // Validate Purdue ID format
      if (!/^[A-Z0-9]{10}$/.test(purdueId)) {
        return res.status(400).json({
          error: 'Invalid Purdue ID format'
        });
      }

      // Create user
      const user = await User.create({
        purdueId,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        major,
        year
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          purdueId: user.purdueId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          major: user.major,
          year: user.year,
          isVerified: user.isVerified,
          token: generateToken(user._id)
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Server error during registration'
      });
    }
  }
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  rateLimitAction('login', 5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check for user
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          error: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.updateOne({
          $unset: { loginAttempts: 1, lockUntil: 1 }
        });
      }

      // Update last login
      await user.updateOne({ lastLogin: Date.now() });

      res.json({
        _id: user._id,
        purdueId: user.purdueId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        major: user.major,
        year: user.year,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Server error during login'
      });
    }
  }
);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Server error fetching profile'
    });
  }
});
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Server error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', 
  protect, 
  logUserAction('profile_update'),
  async (req, res) => {
    try {
      const { firstName, lastName, major, year } = req.body;

      const user = await User.findById(req.user._id);

      if (user) {
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.major = major || user.major;
        user.year = year || user.year;

        const updatedUser = await user.save();

        res.json({
          _id: updatedUser._id,
          purdueId: updatedUser.purdueId,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          major: updatedUser.major,
          year: updatedUser.year,
          isVerified: updatedUser.isVerified
        });
      } else {
        res.status(404).json({
          error: 'User not found'
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        error: 'Server error updating profile'
      });
    }
  }
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password',
  protect,
  rateLimitAction('password_change', 3, 60 * 60 * 1000), // 3 attempts per hour
  logUserAction('password_change'),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Please provide current and new password'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters long'
        });
      }

      const user = await User.findById(req.user._id);

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        error: 'Server error changing password'
      });
    }
  }
);

// @desc    Verify email (placeholder for email verification)
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // This is a placeholder - implement actual email verification logic
    // For now, we'll just mark the user as verified
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    // In a real implementation, you would verify the code
    // For now, we'll just mark as verified
    user.isVerified = true;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      isVerified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Server error during email verification'
    });
  }
});

// @desc    Forgot password (placeholder)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password',
  rateLimitAction('forgot_password', 3, 60 * 60 * 1000), // 3 attempts per hour
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      // In a real implementation, you would:
      // 1. Generate a reset token
      // 2. Send reset email
      // 3. Store reset token with expiration

      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Server error during password reset'
      });
    }
  }
);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      _id: user._id,
      purdueId: user.purdueId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      major: user.major,
      year: user.year,
      isVerified: user.isVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Server error refreshing token'
    });
  }
});

module.exports = router;
