/**
 * Tenant Model
 * Represents a tenant in the multi-tenant architecture
 */

const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  financialYearStart: {
    type: Date,
    required: [true, 'Financial year start date is required']
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true,
    uppercase: true
  },
  decimalPrecision: {
    type: Number,
    default: 2,
    min: 0,
    max: 6
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  suppressReservedKeysWarning: true
});

// Indexes
// Domain index is already defined in the schema with unique: true
tenantSchema.index({ createdAt: 1 });
tenantSchema.index({ updatedAt: 1 });

// Virtual for current financial year
tenantSchema.virtual('currentFinancialYear').get(function() {
  const now = new Date();
  const fyStart = new Date(this.financialYearStart);
  fyStart.setFullYear(now.getMonth() < fyStart.getMonth() ? now.getFullYear() - 1 : now.getFullYear());
  
  const fyEnd = new Date(fyStart);
  fyEnd.setFullYear(fyEnd.getFullYear() + 1);
  fyEnd.setDate(fyEnd.getDate() - 1);
  
  return {
    start: fyStart,
    end: fyEnd
  };
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;