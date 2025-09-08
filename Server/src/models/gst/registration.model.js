const mongoose = require('mongoose');

/**
 * GST Registration Schema
 * Stores GST registration details for a business entity
 */
const gstRegistrationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    gstin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, 'Please provide a valid GSTIN'],
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    tradeName: {
      type: String,
      trim: true,
    },
    registrationType: {
      type: String,
      required: true,
      enum: ['Regular', 'Composition', 'Casual', 'SEZ', 'NRTP', 'ISD', 'UIN'],
    },
    businessType: {
      type: String,
      required: true,
      enum: ['Proprietorship', 'Partnership', 'HUF', 'Private Limited Company', 'Public Limited Company', 'Society/Club/Trust/AOP', 'Government Department', 'PSU', 'Unlimited Company', 'LLP', 'Local Authority', 'Statutory Body', 'Foreign Company', 'Foreign Limited Liability Partnership', 'Others'],
    },
    registrationDate: {
      type: Date,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    stateCode: {
      type: String,
      required: true,
      match: [/^[0-9]{2}$/, 'Please provide a valid state code'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Cancelled', 'Suspended'],
      default: 'Active',
    },
    address: {
      building: String,
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },
    portalCredentials: {
      username: String,
      password: String,
      isStored: {
        type: Boolean,
        default: false,
      },
    },
    lastVerified: Date,
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Failed', 'Pending', 'Not Verified'],
      default: 'Not Verified',
    },
    verificationDetails: {
      lastAttempt: Date,
      errorMessage: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
gstRegistrationSchema.index({ tenant: 1, gstin: 1 }, { unique: true });
gstRegistrationSchema.index({ tenant: 1, status: 1 });

module.exports = mongoose.models.GSTRegistration || mongoose.model('GSTRegistration', gstRegistrationSchema);