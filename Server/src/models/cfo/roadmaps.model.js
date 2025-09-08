/**
 * Roadmap Model for CFO Module
 * Defines the schema for financial roadmaps
 * Based on README.md specifications
 */

const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
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
  horizonYears: { 
    type: Number, 
    required: [true, 'Planning horizon in years is required'],
    min: 1,
    max: 10
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Create index on tenantId for faster queries
roadmapSchema.index({ tenantId: 1 });

// Create index on tenantId and name for uniqueness
roadmapSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Virtual for scenarios associated with this roadmap
roadmapSchema.virtual('scenarios', {
  ref: 'Scenario',
  localField: '_id',
  foreignField: 'roadmapId'
});

// Check if model already exists to prevent OverwriteModelError
const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;