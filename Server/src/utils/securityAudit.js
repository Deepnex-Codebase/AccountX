/**
 * Security Audit Utilities
 * Comprehensive security monitoring and logging
 */

const crypto = require('crypto');

/**
 * Security event types
 */
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  FILE_UPLOAD_VIOLATION: 'FILE_UPLOAD_VIOLATION',
  ADMIN_ACTION: 'ADMIN_ACTION',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT'
};

/**
 * Security audit log entry
 */
class SecurityAuditLog {
  constructor(eventType, userId, details = {}, ipAddress = null, userAgent = null) {
    this.timestamp = new Date();
    this.eventType = eventType;
    this.userId = userId;
    this.details = details;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.sessionId = details.sessionId || null;
    this.riskLevel = this.calculateRiskLevel(eventType, details);
  }

  calculateRiskLevel(eventType, details) {
    const highRiskEvents = [
      SECURITY_EVENTS.LOGIN_FAILURE,
      SECURITY_EVENTS.ACCOUNT_LOCKED,
      SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
      SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
      SECURITY_EVENTS.XSS_ATTEMPT,
      SECURITY_EVENTS.UNAUTHORIZED_ACCESS
    ];

    const mediumRiskEvents = [
      SECURITY_EVENTS.PASSWORD_CHANGE,
      SECURITY_EVENTS.PASSWORD_RESET,
      SECURITY_EVENTS.INVALID_TOKEN,
      SECURITY_EVENTS.FILE_UPLOAD_VIOLATION
    ];

    if (highRiskEvents.includes(eventType)) return 'HIGH';
    if (mediumRiskEvents.includes(eventType)) return 'MEDIUM';
    return 'LOW';
  }

  toJSON() {
    return {
      timestamp: this.timestamp.toISOString(),
      eventType: this.eventType,
      userId: this.userId,
      details: this.details,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
      riskLevel: this.riskLevel
    };
  }
}

/**
 * Security audit logger
 */
class SecurityAuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000; // Keep last 10k logs in memory
  }

  /**
   * Log a security event
   */
  log(eventType, userId, details = {}, req = null) {
    const auditLog = new SecurityAuditLog(
      eventType,
      userId,
      details,
      req?.ip || req?.connection?.remoteAddress,
      req?.get('User-Agent')
    );

    this.logs.push(auditLog);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console with appropriate level
    this.consoleLog(auditLog);

    return auditLog;
  }

  /**
   * Console logging with appropriate formatting
   */
  consoleLog(auditLog) {
    const timestamp = auditLog.timestamp.toISOString();
    const emoji = this.getEventEmoji(auditLog.eventType);
    const riskColor = this.getRiskColor(auditLog.riskLevel);

    console.log(`${emoji} [${timestamp}] ${riskColor}${auditLog.eventType}${'\x1b[0m'} - User: ${auditLog.userId} - IP: ${auditLog.ipAddress}`);
    
    if (auditLog.riskLevel === 'HIGH') {
      console.error(`🚨 HIGH RISK EVENT: ${auditLog.eventType}`, auditLog.details);
    }
  }

  /**
   * Get emoji for event type
   */
  getEventEmoji(eventType) {
    const emojiMap = {
      [SECURITY_EVENTS.LOGIN_SUCCESS]: '✅',
      [SECURITY_EVENTS.LOGIN_FAILURE]: '❌',
      [SECURITY_EVENTS.LOGOUT]: '👋',
      [SECURITY_EVENTS.PASSWORD_CHANGE]: '🔐',
      [SECURITY_EVENTS.PASSWORD_RESET]: '🔑',
      [SECURITY_EVENTS.ACCOUNT_LOCKED]: '🔒',
      [SECURITY_EVENTS.SUSPICIOUS_ACTIVITY]: '⚠️',

      [SECURITY_EVENTS.INVALID_TOKEN]: '🚫',
      [SECURITY_EVENTS.UNAUTHORIZED_ACCESS]: '🚨',
      [SECURITY_EVENTS.SQL_INJECTION_ATTEMPT]: '💉',
      [SECURITY_EVENTS.XSS_ATTEMPT]: '🦠',
      [SECURITY_EVENTS.FILE_UPLOAD_VIOLATION]: '📁',
      [SECURITY_EVENTS.ADMIN_ACTION]: '👑',
      [SECURITY_EVENTS.DATA_EXPORT]: '📤',
      [SECURITY_EVENTS.DATA_IMPORT]: '📥'
    };
    return emojiMap[eventType] || '📝';
  }

  /**
   * Get color for risk level
   */
  getRiskColor(riskLevel) {
    const colors = {
      'HIGH': '\x1b[31m', // Red
      'MEDIUM': '\x1b[33m', // Yellow
      'LOW': '\x1b[32m' // Green
    };
    return colors[riskLevel] || '\x1b[0m';
  }

  /**
   * Get logs by criteria
   */
  getLogs(criteria = {}) {
    let filteredLogs = this.logs;

    if (criteria.eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === criteria.eventType);
    }

    if (criteria.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === criteria.userId);
    }

    if (criteria.riskLevel) {
      filteredLogs = filteredLogs.filter(log => log.riskLevel === criteria.riskLevel);
    }

    if (criteria.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= new Date(criteria.startDate));
    }

    if (criteria.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= new Date(criteria.endDate));
    }

    return filteredLogs;
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    const stats = {
      totalEvents: this.logs.length,
      highRiskEvents: this.logs.filter(log => log.riskLevel === 'HIGH').length,
      mediumRiskEvents: this.logs.filter(log => log.riskLevel === 'MEDIUM').length,
      lowRiskEvents: this.logs.filter(log => log.riskLevel === 'LOW').length,
      eventTypeBreakdown: {},
      recentActivity: this.logs.slice(-100) // Last 100 events
    };

    // Calculate event type breakdown
    this.logs.forEach(log => {
      stats.eventTypeBreakdown[log.eventType] = (stats.eventTypeBreakdown[log.eventType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousPatterns() {
    const patterns = [];

    // Multiple failed login attempts
    const failedLogins = this.logs.filter(log => 
      log.eventType === SECURITY_EVENTS.LOGIN_FAILURE
    );

    const loginAttemptsByIP = {};
    failedLogins.forEach(log => {
      if (log.ipAddress) {
        loginAttemptsByIP[log.ipAddress] = (loginAttemptsByIP[log.ipAddress] || 0) + 1;
      }
    });

    Object.entries(loginAttemptsByIP).forEach(([ip, count]) => {
      if (count >= 5) {
        patterns.push({
          type: 'MULTIPLE_FAILED_LOGINS',
          ip: ip,
          count: count,
          riskLevel: 'HIGH'
        });
      }
    });

    // Unusual activity patterns
    const recentLogs = this.logs.filter(log => 
      log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    const activityByUser = {};
    recentLogs.forEach(log => {
      activityByUser[log.userId] = (activityByUser[log.userId] || 0) + 1;
    });

    Object.entries(activityByUser).forEach(([userId, count]) => {
      if (count > 100) {
        patterns.push({
          type: 'HIGH_ACTIVITY_USER',
          userId: userId,
          count: count,
          riskLevel: 'MEDIUM'
        });
      }
    });

    return patterns;
  }

  /**
   * Export logs for analysis
   */
  exportLogs(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs.map(log => log.toJSON()), null, 2);
      case 'csv':
        const csvHeader = 'Timestamp,EventType,UserId,RiskLevel,IPAddress,UserAgent,Details\n';
        const csvRows = this.logs.map(log => 
          `${log.timestamp.toISOString()},${log.eventType},${log.userId},${log.riskLevel},${log.ipAddress || ''},${log.userAgent || ''},"${JSON.stringify(log.details).replace(/"/g, '""')}"`
        ).join('\n');
        return csvHeader + csvRows;
      default:
        return this.logs.map(log => log.toJSON());
    }
  }
}

// Create global security audit logger instance
const securityAuditLogger = new SecurityAuditLogger();

/**
 * Security audit middleware
 */
const securityAuditMiddleware = (req, res, next) => {
  // Log all requests for security monitoring
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log based on response status
    if (res.statusCode >= 400) {
      securityAuditLogger.log(
        SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
        req.user?.id || 'anonymous',
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseSize: data?.length || 0
        },
        req
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  SECURITY_EVENTS,
  SecurityAuditLog,
  SecurityAuditLogger,
  securityAuditLogger,
  securityAuditMiddleware
}; 