const mongoose = require('mongoose');

/**
 * GST Invoice Schema
 * Stores GST invoice details for sales and purchases
 */
const invoiceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    ratePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxableValue: {
      type: Number,
      required: true,
      min: 0,
    },
    cgstRate: {
      type: Number,
      required: true,
      min: 0,
    },
    cgstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sgstRate: {
      type: Number,
      required: true,
      min: 0,
    },
    sgstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    igstRate: {
      type: Number,
      required: true,
      min: 0,
    },
    igstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    cessRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    cessAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

const gstInvoiceSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    invoiceType: {
      type: String,
      required: true,
      enum: ['Sales', 'Purchase'],
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    supplyType: {
      type: String,
      required: true,
      enum: ['Goods', 'Services', 'Goods and Services'],
    },
    // For Sales Invoice
    customerName: {
      type: String,
      trim: true,
    },
    customerGstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    // For Purchase Invoice
    vendorName: {
      type: String,
      trim: true,
    },
    vendorGstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    placeOfSupply: {
      type: String,
      required: true,
      trim: true,
    },
    reverseCharge: {
      type: Boolean,
      default: false,
    },
    items: [invoiceItemSchema],
    totalTaxableValue: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCgstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSgstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalIgstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCessAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    roundOffAmount: {
      type: Number,
      default: 0,
    },
    amountInWords: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid'],
      default: 'Unpaid',
    },
    paymentDetails: [
      {
        paymentDate: Date,
        paymentMode: String,
        referenceNumber: String,
        amount: Number,
      },
    ],
    // E-Invoice details
    eInvoice: {
      isGenerated: {
        type: Boolean,
        default: false,
      },
      irn: String,
      acknowledgementNumber: String,
      acknowledgementDate: Date,
      signedQRCode: String,
      signedInvoice: String,
      status: {
        type: String,
        enum: ['Not Generated', 'Generated', 'Cancelled', 'Failed'],
        default: 'Not Generated',
      },
    },
    // E-Way Bill details
    eWayBill: {
      isGenerated: {
        type: Boolean,
        default: false,
      },
      ewbNumber: String,
      ewbDate: Date,
      validUpto: Date,
      status: {
        type: String,
        enum: ['Not Generated', 'Generated', 'Cancelled', 'Expired'],
        default: 'Not Generated',
      },
      transportDetails: {
        mode: {
          type: String,
          enum: ['Road', 'Rail', 'Air', 'Ship'],
        },
        transporterName: String,
        transporterId: String,
        transDocNumber: String,
        transDocDate: Date,
        vehicleNumber: String,
        fromPlace: String,
        fromState: String,
        distance: Number,
      },
    },
    // For Purchase Invoice - ITC details
    itcDetails: {
      eligibility: {
        type: String,
        enum: ['Eligible', 'Ineligible', 'Partial'],
      },
      eligibleAmount: {
        type: Number,
        min: 0,
      },
      ineligibleAmount: {
        type: Number,
        min: 0,
      },
      reason: String,
    },
    // GSTR reporting status
    gstrStatus: {
      gstr1: {
        reported: {
          type: Boolean,
          default: false,
        },
        reportedOn: Date,
        period: String, // Format: MM-YYYY
      },
      gstr2: {
        reported: {
          type: Boolean,
          default: false,
        },
        reportedOn: Date,
        period: String, // Format: MM-YYYY
      },
      gstr3b: {
        reported: {
          type: Boolean,
          default: false,
        },
        reportedOn: Date,
        period: String, // Format: MM-YYYY
      },
    },
    // Journal entry reference
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry',
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

// Create indexes for faster queries
gstInvoiceSchema.index({ tenant: 1, invoiceType: 1, invoiceDate: -1 });
gstInvoiceSchema.index({ tenant: 1, invoiceNumber: 1, invoiceType: 1 }, { unique: true });
gstInvoiceSchema.index({ 'eInvoice.irn': 1 }, { sparse: true });
gstInvoiceSchema.index({ 'eWayBill.ewbNumber': 1 }, { sparse: true });

// Compound index for GSTR reporting queries
gstInvoiceSchema.index({
  tenant: 1,
  invoiceType: 1,
  'gstrStatus.gstr1.reported': 1,
  'gstrStatus.gstr1.period': 1,
});

gstInvoiceSchema.index({
  tenant: 1,
  invoiceType: 1,
  'gstrStatus.gstr2.reported': 1,
  'gstrStatus.gstr2.period': 1,
});

gstInvoiceSchema.index({
  tenant: 1,
  invoiceType: 1,
  'gstrStatus.gstr3b.reported': 1,
  'gstrStatus.gstr3b.period': 1,
});

const GSTInvoice = mongoose.model('GSTInvoice', gstInvoiceSchema);

module.exports = GSTInvoice;