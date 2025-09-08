/**
 * Security Middleware
 * Comprehensive security measures for the application
 */

const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { AppError } = require('../utils/appError');

/**
 * Enhanced XSS protection middleware
 */
const xssProtection = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .replace(/<script/gi, '')
          .replace(/<\/script>/gi, '');
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .replace(/<script/gi, '')
          .replace(/<\/script>/gi, '');
      }
    });
  }

  next();
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/[<>]/g, '');
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>]/g, '');
      }
    });
  }

  next();
};

/**
 * Content Security Policy
 */
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * Request size limiting
 */
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return next(new AppError('Request too large', 413));
  }
  
  next();
};

/**
 * IP whitelist middleware (optional)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }
    
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return next(new AppError('Access denied', 403));
    }
    
    next();
  };
};

/**
 * Session security middleware
 */
const sessionSecurity = (req, res, next) => {
  // Prevent session fixation
  if (req.session && req.session.regenerate) {
    req.session.regenerate((err) => {
      if (err) {
        return next(new AppError('Session error', 500));
      }
      next();
    });
  } else {
    next();
  }
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-frontend-domain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS', 403));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  exposedHeaders: ['X-Response-Time', 'X-Memory-Usage']
};

/**
 * JWT token security middleware
 */
const jwtSecurity = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    // Check token format
    if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
      return next(new AppError('Invalid token format', 401));
    }
  }
  
  next();
};

/**
 * SQL injection protection
 */
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|script|javascript|vbscript)\b)/i,
    /(\b(and|or)\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select)\s+.*\bfrom\b)/i
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // Check query parameters
  if (req.query && Object.values(req.query).some(checkValue)) {
    return next(new AppError('Invalid input detected', 400));
  }
  
  // Check body parameters
  if (req.body && Object.values(req.body).some(checkValue)) {
    return next(new AppError('Invalid input detected', 400));
  }
  
  next();
};

/**
 * File upload security
 */
const fileUploadSecurity = (req, res, next) => {
  if (req.files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of Object.values(req.files)) {
      if (!allowedTypes.includes(file.mimetype)) {
        return next(new AppError('Invalid file type', 400));
      }
      
      if (file.size > maxSize) {
        return next(new AppError('File too large', 400));
      }
      
      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        return next(new AppError('Invalid file extension', 400));
      }
    }
  }
  
  next();
};

/**
 * Request logging for security
 */
const securityLogging = (req, res, next) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    userId: req.user?.id || 'anonymous'
  };
  
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /javascript:/i, // JavaScript injection
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.originalUrl) || 
    pattern.test(req.get('User-Agent') || '') ||
    pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    console.warn('🚨 Suspicious activity detected:', securityLog);
  }
  
  next();
};

module.exports = {
  xssProtection,
  sanitizeInput,
  cspConfig,
  securityHeaders,
  requestSizeLimit,
  ipWhitelist,
  sessionSecurity,
  corsOptions,
  jwtSecurity,
  sqlInjectionProtection,
  fileUploadSecurity,
  securityLogging
}; 