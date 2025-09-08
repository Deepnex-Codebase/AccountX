/**
 * Tenant middleware to enforce multi-tenancy
 * Extracts tenantId from authenticated user and injects it into all queries
 */

const { AppError } = require('../utils/appError');
const User = require('../models/user.model');

const tenantMiddleware = async (req, res, next) => {
  // Skip tenant check for auth routes
  if (req.path.startsWith('/api/v1/auth')) {
    return next();
  }

  // Get tenant ID from authenticated user
  if (!req.user || !req.user.id) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    // Get user with tenant information
    const user = await User.findById(req.user.id).select('tenantId');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.tenantId) {
      return next(new AppError('User has no tenant assigned', 400));
    }

    // Add tenantId to request object for use in controllers
    req.tenantId = user.tenantId;

    next();
  } catch (error) {
    return next(new AppError('Error processing tenant information', 500));
  }
};

module.exports = tenantMiddleware;
module.exports.injectTenantId = tenantMiddleware;