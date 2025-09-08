/**
 * Role Model
 * Represents a role with specific permissions for RBAC
 */

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes
// TenantId index is already defined in the compound index below
roleSchema.index({ createdAt: 1 });
roleSchema.index({ updatedAt: 1 });

// Compound index for tenant and role name uniqueness
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;