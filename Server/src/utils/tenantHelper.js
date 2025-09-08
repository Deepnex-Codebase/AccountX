/**
 * Tenant Helper Utilities
 * Provides helper functions for tenant-based operations
 */

const mongoose = require('mongoose');

/**
 * Add tenant filter to query
 * @param {Object} query - Mongoose query object
 * @param {string|ObjectId} tenantId - Tenant ID to filter by
 * @returns {Object} Modified query with tenant filter
 */
const addTenantFilter = (query, tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  // Convert string to ObjectId if needed
  const tenantObjectId = typeof tenantId === 'string' 
    ? new mongoose.Types.ObjectId(tenantId) 
    : tenantId;

  return { ...query, tenantId: tenantObjectId };
};

/**
 * Create tenant-aware find query
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Additional filter criteria
 * @param {string|ObjectId} tenantId - Tenant ID
 * @returns {Query} Mongoose query with tenant filter
 */
const findWithTenant = (model, filter = {}, tenantId) => {
  const tenantFilter = addTenantFilter(filter, tenantId);
  return model.find(tenantFilter);
};

/**
 * Create tenant-aware findOne query
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Additional filter criteria
 * @param {string|ObjectId} tenantId - Tenant ID
 * @returns {Query} Mongoose query with tenant filter
 */
const findOneWithTenant = (model, filter = {}, tenantId) => {
  const tenantFilter = addTenantFilter(filter, tenantId);
  return model.findOne(tenantFilter);
};

/**
 * Create tenant-aware create operation
 * @param {Object} model - Mongoose model
 * @param {Object} data - Data to create
 * @param {string|ObjectId} tenantId - Tenant ID
 * @returns {Promise} Promise that resolves to created document
 */
const createWithTenant = async (model, data, tenantId) => {
  const tenantObjectId = typeof tenantId === 'string' 
    ? new mongoose.Types.ObjectId(tenantId) 
    : tenantId;

  return await model.create({
    ...data,
    tenantId: tenantObjectId
  });
};

/**
 * Validate tenant ID format
 * @param {string} tenantId - Tenant ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidTenantId = (tenantId) => {
  return mongoose.Types.ObjectId.isValid(tenantId);
};

module.exports = {
  addTenantFilter,
  findWithTenant,
  findOneWithTenant,
  createWithTenant,
  isValidTenantId
}; 