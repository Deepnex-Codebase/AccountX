/**
 * Roadmap Model
 * Defines the schema for roadmaps
 */

const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    name: {
      type: String,
      required: [true, 'Roadmap name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    },
    contributors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    milestones: [{
      title: {
        type: String,
        required: [true, 'Milestone title is required']
      },
      description: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'delayed'],
        default: 'pending'
      }
    }],
    budget: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create index on tenantId and name for faster queries and to ensure uniqueness
roadmapSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Virtual for scenarios associated with this roadmap
roadmapSchema.virtual('scenarios', {
  ref: 'Scenario',
  localField: '_id',
  foreignField: 'roadmapId'
});

// Pre-save hook to validate dates
roadmapSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error('Start date cannot be after end date'));
  }
  next();
});

// Check if model already exists to prevent OverwriteModelError
const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;