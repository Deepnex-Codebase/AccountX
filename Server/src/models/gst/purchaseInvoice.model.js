/**
 * Purchase Invoice Model for GST Module
 * Represents a purchase invoice with GST details
 */

const mongoose = require('mongoose');

// Item Schema (Sub-document)
const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  hsnSac: {
    type: String,
    required: [true, 'HSN/SAC code is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0.01
  },
  unit: {
    type: String,
    trim: true
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: [true, 'Taxable value is required'],
    min: 0
  },
  gstRate: {
    type: Number,
    required: [true, 'GST rate is required'],
    min: 0
  },
  cgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  }
});

// Main Purchase Invoice Schema
const purchaseInvoiceSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  gstin: {
    type: String,
    required: [true, 'GSTIN is required'],
    trim: true,
    ref: 'GSTRegistration'
  },
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  vendorGstin: {
    type: String,
    required: [true, 'Vendor GSTIN is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // GSTIN validation regex
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
      },
      message: 'Please provide a valid vendor GSTIN number'
    }
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required']
  },
  invoiceType: {
    type: String,
    required: [true, 'Invoice type is required'],
    enum: ['Regular', 'Bill of Supply', 'SEZ', 'Export', 'Deemed Export', 'ISD', 'Others']
  },
  placeOfSupply: {
    type: String,
    required: [true, 'Place of supply is required'],
    trim: true
  },
  reverseCharge: {
    type: Boolean,
    default: false
  },
  items: {
    type: [invoiceItemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items) {
        return items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalTaxableValue: {
    type: Number,
    required: [true, 'Total taxable value is required'],
    min: 0
  },
  totalCgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalIgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCessAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalInvoiceValue: {
    type: Number,
    required: [true, 'Total invoice value is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Recorded', 'Verified', 'Rejected'],
    default: 'Recorded'
  },
  itcEligibility: {
    type: String,
    enum: ['Eligible', 'Ineligible', 'Partial'],
    default: 'Eligible'
  },
  itcAmount: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  paymentDate: {
    type: Date
  },
  paymentReference: {
    type: String,
    trim: true
  },
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gstr1Reported: {
    type: Boolean,
    default: false
  },
  gstr2Reported: {
    type: Boolean,
    default: false
  },
  gstr3bReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
purchaseInvoiceSchema.index({ tenantId: 1, gstin: 1 });
purchaseInvoiceSchema.index({ tenantId: 1, invoiceNumber: 1, vendorGstin: 1 }, { unique: true });
purchaseInvoiceSchema.index({ invoiceDate: 1 });
purchaseInvoiceSchema.index({ vendorName: 'text' });
purchaseInvoiceSchema.index({ status: 1 });
purchaseInvoiceSchema.index({ createdAt: 1 });
purchaseInvoiceSchema.index({ updatedAt: 1 });

// Pre-save hook to calculate totals
purchaseInvoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate totals from items
    this.totalTaxableValue = this.items.reduce((sum, item) => sum + item.taxableValue, 0);
    this.totalCgstAmount = this.items.reduce((sum, item) => sum + item.cgstAmount, 0);
    this.totalSgstAmount = this.items.reduce((sum, item) => sum + item.sgstAmount, 0);
    this.totalIgstAmount = this.items.reduce((sum, item) => sum + item.igstAmount, 0);
    this.totalCessAmount = this.items.reduce((sum, item) => sum + item.cessAmount, 0);
    this.totalInvoiceValue = this.items.reduce((sum, item) => sum + item.totalAmount, 0);
  }
  next();
});

const PurchaseInvoice = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);

module.exports = PurchaseInvoice;