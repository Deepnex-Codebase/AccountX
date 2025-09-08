const mongoose = require('mongoose');

/**
 * GST Return Schema
 * Stores GST return filing details
 */

// Common schema for all return types
const gstReturnSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    returnType: {
      type: String,
      required: true,
      enum: ['GSTR-1', 'GSTR-3B'],
    },
    period: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
        min: 2017,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Generated', 'Filed', 'Error'],
      default: 'Draft',
    },
    filingDate: Date,
    acknowledgementNumber: String,
    acknowledgementDate: Date,
    jsonData: Object, // Stores the JSON data for the return
    // For GSTR-1
    b2bInvoices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GSTInvoice',
    }],
    b2clInvoices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GSTInvoice',
    }],
    b2csInvoices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GSTInvoice',
    }],
    // For GSTR-3B
    outwardSupplies: {
      taxableValue: Number,
      integratedTax: Number,
      centralTax: Number,
      stateTax: Number,
      cess: Number,
    },
    inwardSupplies: {
      taxableValue: Number,
      integratedTax: Number,
      centralTax: Number,
      stateTax: Number,
      cess: Number,
    },
    itcAvailed: {
      integratedTax: Number,
      centralTax: Number,
      stateTax: Number,
      cess: Number,
    },
    taxPayable: {
      integratedTax: Number,
      centralTax: Number,
      stateTax: Number,
      cess: Number,
    },
    taxPaid: {
      integratedTax: Number,
      centralTax: Number,
      stateTax: Number,
      cess: Number,
    },
    paymentDetails: [{
      paymentMode: String,
      paymentDate: Date,
      referenceNumber: String,
      amount: Number,
      taxType: String, // IGST, CGST, SGST, CESS
    }],
    errorMessages: [{
      code: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
gstReturnSchema.index({ tenant: 1, returnType: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });
gstReturnSchema.index({ tenant: 1, status: 1 });
gstReturnSchema.index({ tenant: 1, returnType: 1, status: 1 });

const GSTReturn = mongoose.model('GSTReturn', gstReturnSchema);

module.exports = GSTReturn;