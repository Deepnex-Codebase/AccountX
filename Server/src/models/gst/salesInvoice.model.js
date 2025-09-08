/**
 * Sales Invoice Model for GST Module
 * Represents a sales invoice with GST details
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

// Main Sales Invoice Schema
const salesInvoiceSchema = new mongoose.Schema({
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
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerGstin: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // GSTIN validation regex or empty for B2C
        return !value || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
      },
      message: 'Please provide a valid customer GSTIN number'
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
    enum: ['B2B', 'B2C', 'Export', 'SEZ', 'Deemed Export', 'Tax Invoice', 'Bill of Supply', 'Others']
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
  eInvoiceStatus: {
    type: String,
    enum: ['Not Applicable', 'Pending', 'Generated', 'Failed'],
    default: 'Not Applicable'
  },
  eInvoiceDetails: {
    irn: String,
    ackNo: String,
    ackDate: Date,
    qrCode: String
  },
  eWayBillStatus: {
    type: String,
    enum: ['Not Applicable', 'Pending', 'Generated', 'Failed'],
    default: 'Not Applicable'
  },
  eWayBillDetails: {
    eWayBillNumber: String,
    validUntil: Date
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
    enum: ['Draft', 'Issued', 'Cancelled'],
    default: 'Issued'
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
  termsAndConditions: {
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
  gstr3bReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
salesInvoiceSchema.index({ tenantId: 1, gstin: 1 });
salesInvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
salesInvoiceSchema.index({ invoiceDate: 1 });
salesInvoiceSchema.index({ customerName: 'text' });
salesInvoiceSchema.index({ status: 1 });
salesInvoiceSchema.index({ createdAt: 1 });
salesInvoiceSchema.index({ updatedAt: 1 });

// Pre-save hook to calculate totals
salesInvoiceSchema.pre('save', function(next) {
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

// Method to generate e-invoice
salesInvoiceSchema.methods.generateEInvoice = async function() {
  // Implementation would connect to e-invoice API
  // This is a placeholder for the actual implementation
  if (this.invoiceType === 'B2B' && this.totalInvoiceValue >= 50000) {
    this.eInvoiceStatus = 'Pending';
    // Actual API call would happen here
    // On success:
    // this.eInvoiceStatus = 'Generated';
    // this.eInvoiceDetails = { irn: '...', ackNo: '...', ackDate: new Date(), qrCode: '...' };
  }
  return this;
};

// Method to generate e-way bill
salesInvoiceSchema.methods.generateEWayBill = async function() {
  // Implementation would connect to e-way bill API
  // This is a placeholder for the actual implementation
  if (this.totalInvoiceValue >= 50000) {
    this.eWayBillStatus = 'Pending';
    // Actual API call would happen here
    // On success:
    // this.eWayBillStatus = 'Generated';
    // this.eWayBillDetails = { eWayBillNumber: '...', validUntil: new Date() };
  }
  return this;
};

const SalesInvoice = mongoose.model('SalesInvoice', salesInvoiceSchema);

module.exports = SalesInvoice;