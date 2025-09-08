/**
 * Cost Center Model
 * Represents a cost center for expense allocation and tracking
 */

const mongoose = require('mongoose');

const costCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cost center name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  assignedAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  budget: {
    type: Number,
    default: 0
  },
  budgetPeriod: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    default: 'Yearly'
  }
}, {
  timestamps: true
});

// Indexes
costCenterSchema.index({ tenantId: 1 });
costCenterSchema.index({ createdAt: 1 });
costCenterSchema.index({ updatedAt: 1 });

// Compound index for tenant and cost center name uniqueness
costCenterSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const CostCenter = mongoose.model('CostCenter', costCenterSchema);

module.exports = CostCenter;