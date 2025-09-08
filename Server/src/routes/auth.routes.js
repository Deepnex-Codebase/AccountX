/**
 * Authentication Routes
 * Handles user registration, login, logout, and token management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/auth.controller');

// Create a new user account
router.post('/register', authController.register);

// Authenticate and issue JWT
router.post('/login', authController.login);

// Invalidate current JWT
router.post('/logout', protect, authController.logout);

// Fetch current user profile
router.get('/me', protect, authController.getMe);

// Refresh access token
router.post('/refresh', authController.refreshToken);

// List permissions for current user
router.get('/permissions', protect, authController.getPermissions);

// List available roles for tenant
router.get('/roles', protect, authController.getAvailableRoles);

module.exports = router;