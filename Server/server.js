const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { errorHandler } = require('./src/middleware/errorHandler');
const { 
  xssProtection,
  sanitizeInput,
  cspConfig,
  securityHeaders,
  requestSizeLimit,
  corsOptions,
  jwtSecurity,
  sqlInjectionProtection,
  fileUploadSecurity,
  securityLogging
} = require('./src/middleware/securityMiddleware');
const { securityAuditMiddleware } = require('./src/utils/securityAudit');
const { body, validationResult } = require('express-validator');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB with optimized connection options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Security middleware - Apply before other middleware
app.use(helmet(cspConfig));
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());

// CORS configuration
app.use(cors(corsOptions));

// Security headers
app.use(securityHeaders);

// Request size limiting
app.use(requestSizeLimit);

// Input sanitization
app.use(xssProtection);
app.use(hpp());
app.use(mongoSanitize());
app.use(sanitizeInput);

// Security logging
app.use(securityLogging);

// Security audit middleware
app.use(securityAuditMiddleware);

// JWT token security
app.use(jwtSecurity);

// SQL injection protection
app.use(sqlInjectionProtection);

// File upload security
app.use(fileUploadSecurity);

// Rate limiting removed as requested

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Global validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array(),
      message: 'Validation failed'
    });
  }
  next();
};

// Tenant middleware - injects tenantId into req object
app.use(require('./src/middleware/tenantMiddleware'));

// API Routes with validation
const authRoutes = require('./src/routes/auth.routes');

// Auth routes with validation
app.use('/api/v1/auth/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('isAdmin').optional().isBoolean(),
    body('roleName').optional().isString(),
    body('tenantId').optional().isMongoId()
  ],
  validateRequest,
  authRoutes
);

app.use('/api/v1/auth', authRoutes);

// Accounting Module Routes
app.use('/api/v1/accounts', require('./src/routes/accounting/accounts.routes'));
app.use('/api/v1/cost-centers', require('./src/routes/accounting/costCenters.routes'));
app.use('/api/v1/templates', require('./src/routes/accounting/templates.routes'));
app.use('/api/v1/journal-entries', require('./src/routes/accounting/journalEntries.routes'));
app.use('/api/v1/cash-book', require('./src/routes/accounting/cashBook.routes'));
app.use('/api/v1/bank-book', require('./src/routes/accounting/bankBook.routes'));
app.use('/api/v1/purchase-book', require('./src/routes/accounting/purchaseBook.routes'));
app.use('/api/v1/sales-book', require('./src/routes/accounting/salesBook.routes'));
app.use('/api/v1/reports', require('./src/routes/accounting/reports.routes'));
app.use('/api/v1/tenants', require('./src/routes/accounting/tenants.routes'));
app.use('/api/v1/users', require('./src/routes/accounting/users.routes'));
app.use('/api/v1/roles', require('./src/routes/accounting/roles.routes'));

// GST Module Routes
app.use('/api/v1/gst', require('./src/routes/gst/gst.routes'));
app.use('/api/v1/gst/hsn-codes', require('./src/routes/hsnCodes.routes'));
app.use('/api/v1/gst/tax-rates', require('./src/routes/taxRates.routes'));
app.use('/api/v1/gst/registrations', require('./src/routes/gst/registrations.routes'));
app.use('/api/v1/gst/invoices', require('./src/routes/gst/invoices.routes'));
app.use('/api/v1/gst/returns', require('./src/routes/gst/returns.routes'));
app.use('/api/v1/gst/einvoice', require('./src/routes/gst/einvoice.routes'));
app.use('/api/v1/gst/ewaybill', require('./src/routes/gst/ewaybill.routes'));
app.use('/api/v1/gst/itc', require('./src/routes/gst/itc.routes'));

// CA Module Routes
app.use('/api/v1/ca', require('./src/routes/ca/ca.routes'));

// Integrations routes
app.use('/api/v1/integrations', require('./src/routes/integrations.routes'));

// CFO Module Routes
app.use('/api/v1/cfo', require('./src/routes/cfo.routes'));
app.use('/api/v1/cfo/roadmaps', require('./src/routes/cfo/roadmaps.routes'));
app.use('/api/v1/cfo/scenarios', require('./src/routes/cfo/scenarios.routes'));
app.use('/api/v1/cfo/models', require('./src/routes/cfo/models.routes'));
app.use('/api/v1/cfo/kpis', require('./src/routes/cfo/kpis.routes'));
app.use('/api/v1/cfo/risks', require('./src/routes/cfo/risks.routes'));
app.use('/api/v1/cfo/controls', require('./src/routes/cfo/controls.routes'));
app.use('/api/v1/cfo/fundraising', require('./src/routes/cfo/fundraising.routes'));
app.use('/api/v1/cfo/dashboard', require('./src/routes/cfo/dashboard.routes'));
app.use('/api/v1/cfo/captable', require('./src/routes/cfo/captable.routes'));

// System routes
app.use('/api/v1/system', require('./src/routes/system.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handler middleware
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Start server with graceful shutdown
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔒 Security measures enabled`);
  console.log(`📊 Rate limiting active`);
  console.log(`🛡️ Input sanitization active`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app; // For testing