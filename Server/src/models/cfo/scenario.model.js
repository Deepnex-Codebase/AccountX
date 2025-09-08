/**
 * Scenario Model
 * Defines the schema for scenarios associated with roadmaps
 */

const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Roadmap ID is required']
    },
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['base-case', 'best-case', 'worst-case', 'custom'],
      default: 'custom'
    },
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
    variables: [{
      name: {
        type: String,
        required: [true, 'Variable name is required']
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Variable value is required']
      },
      description: String
    }],
    outcomes: [{
      metric: {
        type: String,
        required: [true, 'Outcome metric is required']
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Outcome value is required']
      },
      description: String
    }],
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
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
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
    }]
  },
  {
    timestamps: true
  }
);

// TenantId and roadmapId are already indexed in the compound index below

// Create index on tenantId, roadmapId, and name for uniqueness
scenarioSchema.index({ tenantId: 1, roadmapId: 1, name: 1 }, { unique: true });

// Check if model already exists to prevent OverwriteModelError
const Scenario = mongoose.models.Scenario || mongoose.model('Scenario', scenarioSchema);

module.exports = Scenario;