/**
 * GST E-Way Bill Model
 * Defines schema for GST e-way bills
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eWayBillSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant is required'],
    },
    // Reference to invoice (optional as e-way bill can be generated without invoice)
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'GSTInvoice',
    },
    // E-way bill details
    ewbNumber: {
      type: String,
      trim: true,
    },
    ewbDate: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATED', 'CANCELLED', 'EXPIRED', 'EXTENDED', 'FAILED'],
      default: 'PENDING',
    },
    // Document details
    documentType: {
      type: String,
      enum: ['INV', 'CHL', 'BIL', 'BOE', 'CRN', 'DBN', 'OTH'],
      required: [true, 'Document type is required'],
      default: 'INV',
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
      trim: true,
    },
    documentDate: {
      type: Date,
      required: [true, 'Document date is required'],
    },
    // Transaction type
    transactionType: {
      type: String,
      enum: ['Regular', 'Bill To-Ship To', 'Bill From-Dispatch From', 'Combination'],
      default: 'Regular',
    },
    // Supply type
    supplyType: {
      type: String,
      enum: ['Outward', 'Inward'],
      required: [true, 'Supply type is required'],
      default: 'Outward',
    },
    // Sub-supply type
    subSupplyType: {
      type: String,
      enum: [
        'Supply',
        'Import',
        'Export',
        'Job Work',
        'SKD/CKD',
        'Recipient Not Known',
        'For Own Use',
        'Exhibition or Fairs',
        'Line Sales',
        'Others',
      ],
      required: [true, 'Sub-supply type is required'],
      default: 'Supply',
    },
    // Transaction details
    fromGSTIN: {
      type: String,
      required: [true, 'From GSTIN is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid GSTIN!`,
      },
    },
    fromTraderName: {
      type: String,
      required: [true, 'From trader name is required'],
      trim: true,
    },
    fromAddress: {
      type: String,
      required: [true, 'From address is required'],
      trim: true,
    },
    fromPlace: {
      type: String,
      required: [true, 'From place is required'],
      trim: true,
    },
    fromPincode: {
      type: Number,
      required: [true, 'From pincode is required'],
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v.toString());
        },
        message: (props) => `${props.value} is not a valid pincode!`,
      },
    },
    fromStateCode: {
      type: String,
      required: [true, 'From state code is required'],
      trim: true,
      minlength: [1, 'State code must be at least 1 character'],
      maxlength: [2, 'State code cannot exceed 2 characters'],
    },
    toGSTIN: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty for unregistered recipients
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid GSTIN!`,
      },
    },
    toTraderName: {
      type: String,
      required: [true, 'To trader name is required'],
      trim: true,
    },
    toAddress: {
      type: String,
      required: [true, 'To address is required'],
      trim: true,
    },
    toPlace: {
      type: String,
      required: [true, 'To place is required'],
      trim: true,
    },
    toPincode: {
      type: Number,
      required: [true, 'To pincode is required'],
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v.toString());
        },
        message: (props) => `${props.value} is not a valid pincode!`,
      },
    },
    toStateCode: {
      type: String,
      required: [true, 'To state code is required'],
      trim: true,
      minlength: [1, 'State code must be at least 1 character'],
      maxlength: [2, 'State code cannot exceed 2 characters'],
    },
    // Item details
    items: [
      {
        productName: {
          type: String,
          required: [true, 'Product name is required'],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        hsnCode: {
          type: String,
          required: [true, 'HSN code is required'],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [0.01, 'Quantity must be greater than 0'],
        },
        unit: {
          type: String,
          required: [true, 'Unit is required'],
          trim: true,
        },
        taxableValue: {
          type: Number,
          required: [true, 'Taxable value is required'],
          min: [0, 'Taxable value cannot be negative'],
        },
        taxRate: {
          type: Number,
          required: [true, 'Tax rate is required'],
          min: [0, 'Tax rate cannot be negative'],
        },
        cgstAmount: {
          type: Number,
          default: 0,
          min: [0, 'CGST amount cannot be negative'],
        },
        sgstAmount: {
          type: Number,
          default: 0,
          min: [0, 'SGST amount cannot be negative'],
        },
        igstAmount: {
          type: Number,
          default: 0,
          min: [0, 'IGST amount cannot be negative'],
        },
        cessAmount: {
          type: Number,
          default: 0,
          min: [0, 'Cess amount cannot be negative'],
        },
      },
    ],
    // Transport details
    transporterName: {
      type: String,
      trim: true,
    },
    transporterId: {
      type: String,
      trim: true,
    },
    transportMode: {
      type: String,
      enum: ['Road', 'Rail', 'Air', 'Ship'],
      required: [true, 'Transport mode is required'],
      default: 'Road',
    },
    vehicleType: {
      type: String,
      enum: ['Regular', 'Over Dimensional Cargo'],
      default: 'Regular',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v && this.transportMode !== 'Road') return true;
          if (this.transportMode === 'Road') {
            return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/.test(v);
          }
          return true;
        },
        message: (props) => `${props.value} is not a valid vehicle number!`,
      },
    },
    // For non-road transport
    documentNumber: {
      type: String,
      trim: true,
    },
    documentDate: {
      type: Date,
    },
    // Distance and transaction value
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [1, 'Distance must be at least 1 km'],
      max: [3000, 'Distance cannot exceed 3000 km'],
    },
    transactionValue: {
      type: Number,
      required: [true, 'Transaction value is required'],
      min: [0, 'Transaction value cannot be negative'],
    },
    // Extension details
    isExtended: {
      type: Boolean,
      default: false,
    },
    extensionRemarks: {
      type: String,
      trim: true,
    },
    extensionDate: {
      type: Date,
    },
    originalValidUntil: {
      type: Date,
    },
    // Cancellation details
    cancellationReason: {
      type: String,
      enum: [
        'Duplicate',
        'Data Entry Mistake',
        'Order Cancelled',
        'Others',
      ],
      trim: true,
    },
    cancellationRemarks: {
      type: String,
      trim: true,
      maxlength: [100, 'Cancellation remarks cannot exceed 100 characters'],
    },
    cancelledDate: {
      type: Date,
    },
    // API request/response details
    requestPayload: {
      type: Object,
    },
    responsePayload: {
      type: Object,
    },
    // Error details
    errorDetails: {
      errorCode: String,
      errorMessage: String,
      timestamp: Date,
    },
    // Generation attempts tracking
    generationAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptDate: {
      type: Date,
    },
    // Creator tracking
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
eWayBillSchema.index({ tenant: 1, ewbNumber: 1 }, { unique: true, sparse: true });
eWayBillSchema.index({ tenant: 1, invoice: 1 });
eWayBillSchema.index({ tenant: 1, status: 1 });
eWayBillSchema.index({ tenant: 1, documentNumber: 1, documentDate: 1 });

// Pre-save middleware to update invoice status
eWayBillSchema.pre('save', async function (next) {
  // Skip if this is a new document or invoice reference is not set
  if (this.isNew || !this.invoice) return next();

  // If status has changed to GENERATED or CANCELLED, update the invoice
  if (this.isModified('status') && ['GENERATED', 'CANCELLED', 'EXPIRED'].includes(this.status)) {
    try {
      const GSTInvoice = mongoose.model('GSTInvoice');
      await GSTInvoice.findByIdAndUpdate(this.invoice, {
        'ewaybill.status': this.status,
        'ewaybill.ewbNumber': this.ewbNumber || null,
        'ewaybill.ewbDate': this.ewbDate || null,
        'ewaybill.validUntil': this.validUntil || null,
      });
    } catch (error) {
      console.error('Error updating invoice e-way bill status:', error);
    }
  }
  next();
});

const EWayBill = mongoose.model('EWayBill', eWayBillSchema);

module.exports = EWayBill;