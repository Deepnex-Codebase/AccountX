/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const { AppError } = require('../utils/appError');

const protect = async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user is active
    if (!user.isActive) {
      return next(new AppError('This user account has been deactivated.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Authentication failed', 401));
  }
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user has required roles
    const hasRequiredRole = req.user.roles.some(role => roles.includes(role.name));
    
    if (!hasRequiredRole) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

// Middleware to check specific permissions
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Get user with populated roles
      const user = await User.findById(req.user._id).populate('roles');
      
      // Check if user has the required permission
      const hasPermission = user.roles.some(role => 
        role.permissions && role.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        return next(new AppError(`You don't have permission: ${permission}`, 403));
      }
      
      next();
    } catch (error) {
      return next(new AppError('Error checking permissions', 500));
    }
  };
};

module.exports = { protect, restrictTo, hasPermission };