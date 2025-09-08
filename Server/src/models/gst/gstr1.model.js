/**
 * GSTR-1 Return Model
 * Represents a GSTR-1 return filing for a specific period
 */

const mongoose = require('mongoose');

// B2B Invoice Schema (Sub-document)
const b2bInvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  customerGstin: {
    type: String,
    required: true,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  reverseCharge: {
    type: Boolean,
    default: false
  },
  invoiceValue: {
    type: Number,
    required: true,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
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
  status: {
    type: String,
    enum: ['Not Uploaded', 'Uploaded', 'Filed'],
    default: 'Not Uploaded'
  }
});

// B2C Large Invoice Schema (Sub-document)
const b2cLargeInvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  invoiceValue: {
    type: Number,
    required: true,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Not Uploaded', 'Uploaded', 'Filed'],
    default: 'Not Uploaded'
  }
});

// B2C Small (Consolidated) Schema (Sub-document)
const b2cSmallSchema = new mongoose.Schema({
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  gstRate: {
    type: Number,
    required: true,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
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
  invoiceCount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Not Uploaded', 'Uploaded', 'Filed'],
    default: 'Not Uploaded'
  }
});

// Export Invoice Schema (Sub-document)
const exportInvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  exportType: {
    type: String,
    enum: ['With Payment', 'Without Payment'],
    required: true
  },
  portCode: {
    type: String,
    trim: true
  },
  shippingBillNumber: {
    type: String,
    trim: true
  },
  shippingBillDate: {
    type: Date
  },
  invoiceValue: {
    type: Number,
    required: true,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Not Uploaded', 'Uploaded', 'Filed'],
    default: 'Not Uploaded'
  }
});

// Credit/Debit Note Schema (Sub-document)
const creditDebitNoteSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  noteNumber: {
    type: String,
    required: true,
    trim: true
  },
  noteDate: {
    type: Date,
    required: true
  },
  noteType: {
    type: String,
    enum: ['Credit Note', 'Debit Note'],
    required: true
  },
  originalInvoiceNumber: {
    type: String,
    trim: true
  },
  originalInvoiceDate: {
    type: Date
  },
  customerGstin: {
    type: String,
    trim: true
  },
  customerName: {
    type: String,
    trim: true
  },
  noteValue: {
    type: Number,
    required: true,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
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
  status: {
    type: String,
    enum: ['Not Uploaded', 'Uploaded', 'Filed'],
    default: 'Not Uploaded'
  }
});

// Main GSTR-1 Schema
const gstr1Schema = new mongoose.Schema({
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
  returnPeriod: {
    type: String,
    required: [true, 'Return period is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // Format: MM-YYYY
        return /^(0[1-9]|1[0-2])-\d{4}$/.test(value);
      },
      message: 'Return period must be in MM-YYYY format'
    }
  },
  financialYear: {
    type: String,
    required: [true, 'Financial year is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // Format: YYYY-YY
        return /^\d{4}-\d{2}$/.test(value);
      },
      message: 'Financial year must be in YYYY-YY format'
    }
  },
  status: {
    type: String,
    enum: ['Not Filed', 'In Progress', 'Filed', 'Filed with Error'],
    default: 'Not Filed'
  },
  filingDate: {
    type: Date
  },
  acknowledgementNumber: {
    type: String,
    trim: true
  },
  acknowledgementDate: {
    type: Date
  },
  b2bInvoices: {
    type: [b2bInvoiceSchema],
    default: []
  },
  b2cLargeInvoices: {
    type: [b2cLargeInvoiceSchema],
    default: []
  },
  b2cSmall: {
    type: [b2cSmallSchema],
    default: []
  },
  exportInvoices: {
    type: [exportInvoiceSchema],
    default: []
  },
  creditDebitNotes: {
    type: [creditDebitNoteSchema],
    default: []
  },
  hsn: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  nil: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  totalTaxableValue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalIgstAmount: {
    type: Number,
    default: 0,
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
  totalCessAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String,
    trim: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }]
}, {
  timestamps: true
});

// Indexes
gstr1Schema.index({ tenantId: 1, gstin: 1, returnPeriod: 1 }, { unique: true });
gstr1Schema.index({ status: 1 });
gstr1Schema.index({ returnPeriod: 1 });
gstr1Schema.index({ createdAt: 1 });
gstr1Schema.index({ updatedAt: 1 });

// Pre-save hook to calculate totals
gstr1Schema.pre('save', function(next) {
  // Calculate total taxable value and tax amounts from all sections
  let totalTaxableValue = 0;
  let totalIgstAmount = 0;
  let totalCgstAmount = 0;
  let totalSgstAmount = 0;
  
  // B2B
  this.b2bInvoices.forEach(invoice => {
    totalTaxableValue += invoice.taxableValue;
    totalIgstAmount += invoice.igstAmount;
    totalCgstAmount += invoice.cgstAmount;
    totalSgstAmount += invoice.sgstAmount;
  });
  
  // B2C Large
  this.b2cLargeInvoices.forEach(invoice => {
    totalTaxableValue += invoice.taxableValue;
    totalIgstAmount += invoice.igstAmount;
  });
  
  // B2C Small
  this.b2cSmall.forEach(entry => {
    totalTaxableValue += entry.taxableValue;
    totalIgstAmount += entry.igstAmount;
    totalCgstAmount += entry.cgstAmount;
    totalSgstAmount += entry.sgstAmount;
  });
  
  // Export
  this.exportInvoices.forEach(invoice => {
    totalTaxableValue += invoice.taxableValue;
    totalIgstAmount += invoice.igstAmount;
  });
  
  // Credit/Debit Notes
  this.creditDebitNotes.forEach(note => {
    totalTaxableValue += note.taxableValue;
    totalIgstAmount += note.igstAmount;
    totalCgstAmount += note.cgstAmount;
    totalSgstAmount += note.sgstAmount;
  });
  
  this.totalTaxableValue = totalTaxableValue;
  this.totalIgstAmount = totalIgstAmount;
  this.totalCgstAmount = totalCgstAmount;
  this.totalSgstAmount = totalSgstAmount;
  
  next();
});

// Method to populate return from sales invoices
gstr1Schema.methods.populateFromInvoices = async function(startDate, endDate) {
  // This would be implemented to fetch sales invoices for the period
  // and populate the GSTR-1 sections accordingly
  // Implementation would depend on the SalesInvoice model and business logic
  return this;
};

// Method to generate JSON for filing
gstr1Schema.methods.generateFilingJson = function() {
  // This would generate the JSON structure required for GST portal filing
  // Implementation would follow the GST API specifications
  const filingJson = {
    gstin: this.gstin,
    fp: this.returnPeriod,
    b2b: [],
    b2cl: [],
    b2cs: [],
    exp: [],
    cdnr: [],
    hsn: {
      data: []
    }
    // Other sections as required
  };
  
  return filingJson;
};

const GSTR1 = mongoose.model('GSTR1', gstr1Schema);

module.exports = GSTR1;