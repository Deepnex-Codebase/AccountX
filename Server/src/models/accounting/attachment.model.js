/**
 * Attachment Model
 * Represents a file attachment linked to various entities
 */

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  entity: {
    type: String,
    required: [true, 'Entity type is required'],
    trim: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploaded by user is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
attachmentSchema.index({ tenantId: 1, entity: 1, entityId: 1 });
attachmentSchema.index({ uploadedAt: 1 });
attachmentSchema.index({ createdAt: 1 });
attachmentSchema.index({ updatedAt: 1 });

const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = Attachment;