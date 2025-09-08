/**
 * Financial Model Schema
 * Defines the schema for financial models
 */

const mongoose = require('mongoose');

const financialModelSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    name: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['valuation', 'forecasting', 'budgeting', 'investment-analysis', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inputs: [{
      name: {
        type: String,
        required: [true, 'Input name is required']
      },
      type: {
        type: String,
        enum: ['number', 'string', 'boolean', 'date', 'array', 'object'],
        default: 'number'
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Input value is required']
      },
      description: String,
      isRequired: {
        type: Boolean,
        default: false
      },
      validation: {
        min: Number,
        max: Number,
        pattern: String,
        options: [mongoose.Schema.Types.Mixed]
      }
    }],
    outputs: [{
      name: {
        type: String,
        required: [true, 'Output name is required']
      },
      type: {
        type: String,
        enum: ['number', 'string', 'boolean', 'date', 'array', 'object'],
        default: 'number'
      },
      value: mongoose.Schema.Types.Mixed,
      description: String,
      formula: String
    }],
    assumptions: [{
      name: {
        type: String,
        required: [true, 'Assumption name is required']
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Assumption value is required']
      },
      description: String
    }],
    logic: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    tags: [String],
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    simulationResults: [{
      runDate: {
        type: Date,
        default: Date.now
      },
      runBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      inputs: mongoose.Schema.Types.Mixed,
      outputs: mongoose.Schema.Types.Mixed,
      status: {
        type: String,
        enum: ['success', 'failure', 'in-progress'],
        default: 'success'
      },
      message: String
    }]
  },
  {
    timestamps: true
  }
);

// Create index on tenantId for faster queries
financialModelSchema.index({ tenantId: 1 });

// Create index on tenantId and name for uniqueness
financialModelSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const FinancialModel = mongoose.model('FinancialModel', financialModelSchema);

module.exports = FinancialModel;