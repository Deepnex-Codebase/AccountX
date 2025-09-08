/**
 * Authentication Controller
 * Handles user registration, login, logout, and token management
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Tenant = require('../models/tenant.model');
const { AppError, asyncHandler } = require('../utils/appError');
const mongoose = require('mongoose');
const { ROLES } = require('../utils/roleSeeder');

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Helper function to create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.passwordHash = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
    tenantId: user.tenantId // Include tenantId in response
  });
};

// Helper function to check if user is admin
const isAdminUser = (user) => {
  if (!user.roles || user.roles.length === 0) return false;
  
  // Check if user has Admin role
  return user.roles.some(role => 
    role.name === 'Admin' || 
    (role.permissions && role.permissions.includes('user:create'))
  );
};

// Helper function to create all roles for a tenant
const createAllRolesForTenant = async (tenantId) => {
  // Create all roles for the tenant using imported ROLES
  const createdRoles = [];
  for (const roleData of ROLES) {
    const existingRole = await Role.findOne({ name: roleData.name, tenantId });
    if (!existingRole) {
      const role = await Role.create({
        name: roleData.name,
        permissions: roleData.permissions,
        tenantId,
        description: roleData.description
      });
      createdRoles.push(role);
    } else {
      createdRoles.push(existingRole);
    }
  }

  return createdRoles;
};

// Helper function to generate unique domain
const generateUniqueDomain = async (email) => {
  const emailParts = email.split('@');
  const username = emailParts[0];
  const baseDomain = emailParts[1];
  
  // Try base domain first
  let domain = `${username}.${baseDomain}`;
  let counter = 1;
  
  // Keep trying until we find a unique domain
  while (true) {
    const existingTenant = await Tenant.findOne({ domain });
    if (!existingTenant) {
      return domain;
    }
    // If domain exists, try with counter
    domain = `${username}${counter}.${baseDomain}`;
    counter++;
  }
};

// Helper function to setup admin tenant and roles
const setupAdminTenant = async (user) => {
  // If user already has a tenant, return
  if (user.tenantId) return user;

  try {
    // Generate unique domain
    const domain = await generateUniqueDomain(user.email);
    const emailParts = user.email.split('@');
    const username = emailParts[0];
    
    // Create a new tenant for admin
    const tenant = await Tenant.create({
      name: `${username}'s Tenant`,
      domain,
      financialYearStart: new Date(),
      currency: 'INR',
      decimalPrecision: 2
    });

    // Create all roles for the tenant
    const createdRoles = await createAllRolesForTenant(tenant._id);

    // Find the Admin role to assign to the user
    const adminRole = createdRoles.find(role => role.name === 'Admin');

    // Update user with tenant and Admin role
    user.tenantId = tenant._id;
    user.roles = [adminRole._id];
    await user.save({ validateBeforeSave: false });

    return user;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - try again with a different domain
      const domain = await generateUniqueDomain(user.email);
      const emailParts = user.email.split('@');
      const username = emailParts[0];
      
      const tenant = await Tenant.create({
        name: `${username}'s Tenant`,
        domain,
        financialYearStart: new Date(),
        currency: 'INR',
        decimalPrecision: 2
      });

      // Create all roles for the tenant
      const createdRoles = await createAllRolesForTenant(tenant._id);

      // Find the Admin role to assign to the user
      const adminRole = createdRoles.find(role => role.name === 'Admin');

      // Update user with tenant and Admin role
      user.tenantId = tenant._id;
      user.roles = [adminRole._id];
      await user.save({ validateBeforeSave: false });

      return user;
    }
    throw error;
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, isAdmin, roleName, tenantId: providedTenantId } = req.body;
  let tenantId;

  // If registering as admin, create a new tenant
  if (isAdmin) {
    // Create a new tenant for admin with unique domain
    const domain = await generateUniqueDomain(email);
    const emailParts = email.split('@');
    const username = emailParts[0];
    const tenant = await Tenant.create({
      name: `${username}'s Tenant`, // Use email username as tenant name
      domain,
      financialYearStart: new Date(), // Current date as financial year start
      currency: 'INR',
      decimalPrecision: 2
    });
    tenantId = tenant._id;
  } else {
    // For non-admin users, tenantId must be provided
    tenantId = providedTenantId || req.headers['x-tenant-id'];

    // Validate tenantId
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return next(new AppError('Valid Tenant ID is required for registration', 400));
    }
    tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with that email', 400));
  }

  // Create user
  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    tenantId,
    roles: [] // Will be assigned role later
  });

  // Assign appropriate role
  let role;
  if (isAdmin) {
    // Create all roles for the tenant using helper function
    const createdRoles = await createAllRolesForTenant(tenantId);
    
    // Find the Admin role to assign to the user
    role = createdRoles.find(r => r.name === 'Admin');
  } else {
    // For non-admin users, assign specific role or default to User
    const targetRoleName = roleName || 'User';
    
    // First check if roles exist for this tenant, if not create them
    const existingRoles = await Role.find({ tenantId });
    if (existingRoles.length === 0) {
      // Create all roles for the tenant
      await createAllRolesForTenant(tenantId);
    }
    
    // Find the specified role
    role = await Role.findOne({ name: targetRoleName, tenantId });
    if (!role) {
      return next(new AppError(`Role '${targetRoleName}' not found for this tenant`, 400));
    }
  }

  // Assign role to user
  user.roles.push(role._id);
  await user.save({ validateBeforeSave: false });

  // Send token response with tenantId included
  const responseUser = user.toObject();
  responseUser.tenantId = tenantId;
  responseUser.assignedRole = role.name;
  createSendToken(responseUser, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+passwordHash').populate('roles');

  if (!user || !(await user.correctPassword(password, user.passwordHash))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if this is an admin user (has admin permissions or no tenant)
  const isAdmin = isAdminUser(user) || !user.tenantId;

  // If admin user, setup tenant and roles automatically
  if (isAdmin) {
    await setupAdminTenant(user);
  }

  // Update last login timestamp
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // If everything ok, send token to client
  createSendToken(user, 200, res);
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // In a stateless JWT setup, the client is responsible for removing the token
  // If using cookies, clear the cookie as well
  if (req.cookies && req.cookies.token) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  // Get user with populated roles and tenant
  const user = await User.findById(req.user.id)
    .populate('roles')
    .populate('tenantId');

  res.status(200).json({
    success: true,
    data: user,
    tenantId: user.tenantId
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public (with refresh token)
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Verify refresh token
    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new access token
    const accessToken = signToken(user._id);

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

/**
 * @desc    Get user permissions
 * @route   GET /api/v1/auth/permissions
 * @access  Private
 */
exports.getPermissions = asyncHandler(async (req, res, next) => {
  // Get user with populated roles
  const user = await User.findById(req.user.id).populate('roles');

  // Extract unique permissions from all roles
  const permissions = new Set();
  user.roles.forEach(role => {
    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(permission => permissions.add(permission));
    }
  });

  res.status(200).json({
    success: true,
    data: Array.from(permissions)
  });
});

/**
 * @desc    Get available roles for tenant
 * @route   GET /api/v1/auth/roles
 * @access  Private
 */
exports.getAvailableRoles = asyncHandler(async (req, res, next) => {
  // Get user with tenant information
  const user = await User.findById(req.user.id).select('tenantId');
  
  if (!user.tenantId) {
    return next(new AppError('User has no tenant assigned', 400));
  }

  // Get all roles for the tenant
  const roles = await Role.find({ tenantId: user.tenantId })
    .select('name description permissions')
    .sort('name');

  res.status(200).json({
    success: true,
    data: roles
  });
});