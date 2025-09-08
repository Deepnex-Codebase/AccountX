import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      applicationName: 'AccountX',
      logoUrl: '/assets/logo.png',
      faviconUrl: '/assets/favicon.ico',
      maintenanceMode: false,
      debugMode: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    email: {
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'notifications@accountx.com',
      smtpPassword: '••••••••••••',
      senderName: 'AccountX System',
      senderEmail: 'notifications@accountx.com',
      enableSsl: true,
      emailTemplate: 'default'
    },
    notifications: {
      enableEmailNotifications: true,
      enableInAppNotifications: true,
      enableSmsNotifications: false,
      dailyDigest: true,
      weeklyReport: true,
      criticalAlerts: true,
      loginAlerts: true,
      dataChangeAlerts: true
    },
    security: {
      passwordPolicy: 'strong',
      passwordExpiryDays: 90,
      mfaEnabled: true,
      mfaRequired: false,
      ipRestriction: false,
      allowedIps: '',
      sessionConcurrency: 'allow',
      auditLevel: 'detailed'
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionPeriod: 30,
      backupLocation: 'cloud',
      cloudProvider: 'aws',
      encryptBackups: true
    },
    integrations: {
      enableApiAccess: true,
      apiRateLimit: 1000,
      webhookEndpoint: '',
      googleIntegration: false,
      microsoftIntegration: false,
      slackIntegration: false,
      zapierIntegration: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'success', 'error'

  useEffect(() => {
    // Simulate API call to fetch settings
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    
    // Simulate API call to save settings
    setTimeout(() => {
      setSaveStatus('success');
      setIsEditing(false);
      
      // Reset status after showing success message
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
  };

  const handleCancel = () => {
    // Simulate API call to fetch original settings
    setSaveStatus('saving');
    setTimeout(() => {
      // Reset to original settings would happen here
      setIsEditing(false);
      setSaveStatus(null);
    }, 1000);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="applicationName" className="block text-sm font-medium text-gray-700 mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  id="applicationName"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.applicationName}
                  onChange={(e) => handleChange('general', 'applicationName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logoUrl"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.logoUrl}
                  onChange={(e) => handleChange('general', 'logoUrl', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon URL
                </label>
                <input
                  type="text"
                  id="faviconUrl"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.faviconUrl}
                  onChange={(e) => handleChange('general', 'faviconUrl', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  id="sessionTimeout"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.sessionTimeout}
                  onChange={(e) => handleChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  id="maxLoginAttempts"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.maxLoginAttempts}
                  onChange={(e) => handleChange('general', 'maxLoginAttempts', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  id="lockoutDuration"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.general.lockoutDuration}
                  onChange={(e) => handleChange('general', 'lockoutDuration', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="debugMode"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.general.debugMode}
                  onChange={(e) => handleChange('general', 'debugMode', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-900">
                  Debug Mode
                </label>
              </div>
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Server
                </label>
                <input
                  type="text"
                  id="smtpServer"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.smtpServer}
                  onChange={(e) => handleChange('email', 'smtpServer', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  id="smtpUsername"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.smtpUsername}
                  onChange={(e) => handleChange('email', 'smtpUsername', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  id="senderName"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.senderName}
                  onChange={(e) => handleChange('email', 'senderName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.senderEmail}
                  onChange={(e) => handleChange('email', 'senderEmail', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enableSsl"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.email.enableSsl}
                  onChange={(e) => handleChange('email', 'enableSsl', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="enableSsl" className="ml-2 block text-sm text-gray-900">
                  Enable SSL/TLS
                </label>
              </div>
              <div>
                <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Template
                </label>
                <select
                  id="emailTemplate"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.email.emailTemplate}
                  onChange={(e) => handleChange('email', 'emailTemplate', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                  <option value="modern">Modern</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditing}
              >
                Test Email Configuration
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enableEmailNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.enableEmailNotifications}
                  onChange={(e) => handleChange('notifications', 'enableEmailNotifications', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900">
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="enableInAppNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.enableInAppNotifications}
                  onChange={(e) => handleChange('notifications', 'enableInAppNotifications', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="enableInAppNotifications" className="ml-2 block text-sm text-gray-900">
                  Enable In-App Notifications
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enableSmsNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.enableSmsNotifications}
                  onChange={(e) => handleChange('notifications', 'enableSmsNotifications', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="enableSmsNotifications" className="ml-2 block text-sm text-gray-900">
                  Enable SMS Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="dailyDigest"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.dailyDigest}
                  onChange={(e) => handleChange('notifications', 'dailyDigest', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="dailyDigest" className="ml-2 block text-sm text-gray-900">
                  Daily Digest
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="weeklyReport"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.weeklyReport}
                  onChange={(e) => handleChange('notifications', 'weeklyReport', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="weeklyReport" className="ml-2 block text-sm text-gray-900">
                  Weekly Report
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="criticalAlerts"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.criticalAlerts}
                  onChange={(e) => handleChange('notifications', 'criticalAlerts', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="criticalAlerts" className="ml-2 block text-sm text-gray-900">
                  Critical Alerts
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="loginAlerts"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.loginAlerts}
                  onChange={(e) => handleChange('notifications', 'loginAlerts', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="loginAlerts" className="ml-2 block text-sm text-gray-900">
                  Login Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="dataChangeAlerts"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.dataChangeAlerts}
                  onChange={(e) => handleChange('notifications', 'dataChangeAlerts', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="dataChangeAlerts" className="ml-2 block text-sm text-gray-900">
                  Data Change Alerts
                </label>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="passwordPolicy" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Policy
                </label>
                <select
                  id="passwordPolicy"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.security.passwordPolicy}
                  onChange={(e) => handleChange('security', 'passwordPolicy', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="basic">Basic (8+ characters)</option>
                  <option value="medium">Medium (8+ chars, letters & numbers)</option>
                  <option value="strong">Strong (8+ chars, upper/lower, numbers, symbols)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  id="passwordExpiryDays"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.security.passwordExpiryDays}
                  onChange={(e) => handleChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="mfaEnabled"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.mfaEnabled}
                  onChange={(e) => handleChange('security', 'mfaEnabled', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="mfaEnabled" className="ml-2 block text-sm text-gray-900">
                  Enable Multi-Factor Authentication
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="mfaRequired"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.mfaRequired}
                  onChange={(e) => handleChange('security', 'mfaRequired', e.target.checked)}
                  disabled={!isEditing || !settings.security.mfaEnabled}
                />
                <label htmlFor="mfaRequired" className={`ml-2 block text-sm ${!settings.security.mfaEnabled && !isEditing ? 'text-gray-400' : 'text-gray-900'}`}>
                  Require MFA for All Users
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="ipRestriction"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.ipRestriction}
                  onChange={(e) => handleChange('security', 'ipRestriction', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="ipRestriction" className="ml-2 block text-sm text-gray-900">
                  Enable IP Restriction
                </label>
              </div>
              <div>
                <label htmlFor="allowedIps" className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed IP Addresses (comma separated)
                </label>
                <input
                  type="text"
                  id="allowedIps"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.security.allowedIps}
                  onChange={(e) => handleChange('security', 'allowedIps', e.target.value)}
                  disabled={!isEditing || !settings.security.ipRestriction}
                  placeholder="192.168.1.1, 10.0.0.1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sessionConcurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Concurrency
                </label>
                <select
                  id="sessionConcurrency"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.security.sessionConcurrency}
                  onChange={(e) => handleChange('security', 'sessionConcurrency', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="allow">Allow Multiple Sessions</option>
                  <option value="limit">Limit to One Device Type</option>
                  <option value="single">Single Session Only</option>
                </select>
              </div>
              <div>
                <label htmlFor="auditLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Audit Logging Level
                </label>
                <select
                  id="auditLevel"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.security.auditLevel}
                  onChange={(e) => handleChange('security', 'auditLevel', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="minimal">Minimal (Login/Logout)</option>
                  <option value="standard">Standard (Auth + Data Changes)</option>
                  <option value="detailed">Detailed (Auth + All Data Access)</option>
                  <option value="debug">Debug (All System Activity)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'backup':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="autoBackup"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleChange('backup', 'autoBackup', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                  Enable Automatic Backups
                </label>
              </div>
              <div>
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Frequency
                </label>
                <select
                  id="backupFrequency"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.backup.backupFrequency}
                  onChange={(e) => handleChange('backup', 'backupFrequency', e.target.value)}
                  disabled={!isEditing || !settings.backup.autoBackup}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Time (24h format)
                </label>
                <input
                  type="time"
                  id="backupTime"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.backup.backupTime}
                  onChange={(e) => handleChange('backup', 'backupTime', e.target.value)}
                  disabled={!isEditing || !settings.backup.autoBackup}
                />
              </div>
              <div>
                <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  id="retentionPeriod"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.backup.retentionPeriod}
                  onChange={(e) => handleChange('backup', 'retentionPeriod', parseInt(e.target.value))}
                  disabled={!isEditing || !settings.backup.autoBackup}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="backupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Location
                </label>
                <select
                  id="backupLocation"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.backup.backupLocation}
                  onChange={(e) => handleChange('backup', 'backupLocation', e.target.value)}
                  disabled={!isEditing || !settings.backup.autoBackup}
                >
                  <option value="local">Local Storage</option>
                  <option value="cloud">Cloud Storage</option>
                  <option value="both">Both Local and Cloud</option>
                </select>
              </div>
              <div>
                <label htmlFor="cloudProvider" className="block text-sm font-medium text-gray-700 mb-1">
                  Cloud Provider
                </label>
                <select
                  id="cloudProvider"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.backup.cloudProvider}
                  onChange={(e) => handleChange('backup', 'cloudProvider', e.target.value)}
                  disabled={!isEditing || !settings.backup.autoBackup || settings.backup.backupLocation === 'local'}
                >
                  <option value="aws">Amazon S3</option>
                  <option value="azure">Azure Blob Storage</option>
                  <option value="gcp">Google Cloud Storage</option>
                  <option value="dropbox">Dropbox</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="encryptBackups"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.backup.encryptBackups}
                  onChange={(e) => handleChange('backup', 'encryptBackups', e.target.checked)}
                  disabled={!isEditing || !settings.backup.autoBackup}
                />
                <label htmlFor="encryptBackups" className="ml-2 block text-sm text-gray-900">
                  Encrypt Backups
                </label>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                >
                  Configure Cloud Credentials
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
                disabled={!isEditing}
              >
                Run Manual Backup Now
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditing}
              >
                View Backup History
              </button>
            </div>
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enableApiAccess"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.integrations.enableApiAccess}
                  onChange={(e) => handleChange('integrations', 'enableApiAccess', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="enableApiAccess" className="ml-2 block text-sm text-gray-900">
                  Enable API Access
                </label>
              </div>
              <div>
                <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  API Rate Limit (requests per day)
                </label>
                <input
                  type="number"
                  id="apiRateLimit"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={settings.integrations.apiRateLimit}
                  onChange={(e) => handleChange('integrations', 'apiRateLimit', parseInt(e.target.value))}
                  disabled={!isEditing || !settings.integrations.enableApiAccess}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="webhookEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Endpoint URL
              </label>
              <input
                type="text"
                id="webhookEndpoint"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={settings.integrations.webhookEndpoint}
                onChange={(e) => handleChange('integrations', 'webhookEndpoint', e.target.value)}
                disabled={!isEditing || !settings.integrations.enableApiAccess}
                placeholder="https://example.com/webhook"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="googleIntegration"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.integrations.googleIntegration}
                  onChange={(e) => handleChange('integrations', 'googleIntegration', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="googleIntegration" className="ml-2 block text-sm text-gray-900">
                  Google Workspace Integration
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="microsoftIntegration"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.integrations.microsoftIntegration}
                  onChange={(e) => handleChange('integrations', 'microsoftIntegration', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="microsoftIntegration" className="ml-2 block text-sm text-gray-900">
                  Microsoft 365 Integration
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="slackIntegration"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.integrations.slackIntegration}
                  onChange={(e) => handleChange('integrations', 'slackIntegration', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="slackIntegration" className="ml-2 block text-sm text-gray-900">
                  Slack Integration
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="zapierIntegration"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.integrations.zapierIntegration}
                  onChange={(e) => handleChange('integrations', 'zapierIntegration', e.target.checked)}
                  disabled={!isEditing}
                />
                <label htmlFor="zapierIntegration" className="ml-2 block text-sm text-gray-900">
                  Zapier Integration
                </label>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
                disabled={!isEditing || !settings.integrations.enableApiAccess}
              >
                Generate API Keys
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditing || !settings.integrations.enableApiAccess}
              >
                View API Documentation
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        <div>
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings saved successfully
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setSaveStatus(null)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Error saving settings. Please try again.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setSaveStatus(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`${activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`${activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`${activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`${activeTab === 'backup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Backup & Recovery
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`${activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Integrations
            </button>
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;