/**
 * GST ITC (Input Tax Credit) Model
 * Defines schema for GST input tax credit tracking
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itcSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant is required'],
    },
    // Reference to purchase invoice
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'GSTInvoice',
      required: [true, 'Invoice reference is required'],
    },
    // ITC eligibility status
    eligibilityStatus: {
      type: String,
      enum: ['ELIGIBLE', 'INELIGIBLE', 'BLOCKED', 'PARTIAL', 'REVERSED', 'PENDING_VERIFICATION'],
      default: 'PENDING_VERIFICATION',
    },
    // ITC claim status in returns
    claimStatus: {
      type: String,
      enum: ['NOT_CLAIMED', 'CLAIMED', 'PARTIALLY_CLAIMED', 'REJECTED'],
      default: 'NOT_CLAIMED',
    },
    // ITC type
    itcType: {
      type: String,
      enum: ['INPUT', 'CAPITAL', 'INPUT_SERVICE', 'INELIGIBLE'],
      required: [true, 'ITC type is required'],
    },
    // ITC amounts
    eligibleAmount: {
      type: Number,
      default: 0,
      min: [0, 'Eligible amount cannot be negative'],
    },
    cgstEligible: {
      type: Number,
      default: 0,
      min: [0, 'CGST eligible amount cannot be negative'],
    },
    sgstEligible: {
      type: Number,
      default: 0,
      min: [0, 'SGST eligible amount cannot be negative'],
    },
    igstEligible: {
      type: Number,
      default: 0,
      min: [0, 'IGST eligible amount cannot be negative'],
    },
    cessEligible: {
      type: Number,
      default: 0,
      min: [0, 'Cess eligible amount cannot be negative'],
    },
    // Ineligible amounts
    ineligibleAmount: {
      type: Number,
      default: 0,
      min: [0, 'Ineligible amount cannot be negative'],
    },
    cgstIneligible: {
      type: Number,
      default: 0,
      min: [0, 'CGST ineligible amount cannot be negative'],
    },
    sgstIneligible: {
      type: Number,
      default: 0,
      min: [0, 'SGST ineligible amount cannot be negative'],
    },
    igstIneligible: {
      type: Number,
      default: 0,
      min: [0, 'IGST ineligible amount cannot be negative'],
    },
    cessIneligible: {
      type: Number,
      default: 0,
      min: [0, 'Cess ineligible amount cannot be negative'],
    },
    // Claimed amounts in returns
    claimedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Claimed amount cannot be negative'],
    },
    cgstClaimed: {
      type: Number,
      default: 0,
      min: [0, 'CGST claimed amount cannot be negative'],
    },
    sgstClaimed: {
      type: Number,
      default: 0,
      min: [0, 'SGST claimed amount cannot be negative'],
    },
    igstClaimed: {
      type: Number,
      default: 0,
      min: [0, 'IGST claimed amount cannot be negative'],
    },
    cessClaimed: {
      type: Number,
      default: 0,
      min: [0, 'Cess claimed amount cannot be negative'],
    },
    // Return period in which ITC was claimed
    claimPeriod: {
      month: {
        type: Number,
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        min: [2017, 'Year must be 2017 or later'],
      },
    },
    // Return reference in which ITC was claimed
    claimReturn: {
      type: Schema.Types.ObjectId,
      ref: 'GSTReturn',
    },
    // Reversal details
    reversalDetails: {
      isReversed: {
        type: Boolean,
        default: false,
      },
      reversalDate: Date,
      reversalReason: {
        type: String,
        enum: [
          'PAYMENT_NOT_MADE',
          'GOODS_RETURNED',
          'INVOICE_CANCELLED',
          'RULE_42_43',
          'OTHERS',
        ],
      },
      reversalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Reversal amount cannot be negative'],
      },
      cgstReversed: {
        type: Number,
        default: 0,
        min: [0, 'CGST reversed amount cannot be negative'],
      },
      sgstReversed: {
        type: Number,
        default: 0,
        min: [0, 'SGST reversed amount cannot be negative'],
      },
      igstReversed: {
        type: Number,
        default: 0,
        min: [0, 'IGST reversed amount cannot be negative'],
      },
      cessReversed: {
        type: Number,
        default: 0,
        min: [0, 'Cess reversed amount cannot be negative'],
      },
      reversalRemarks: String,
      reversalReturn: {
        type: Schema.Types.ObjectId,
        ref: 'GSTReturn',
      },
    },
    // Ineligibility reason if applicable
    ineligibilityReason: {
      type: String,
      enum: [
        'BLOCKED_UNDER_17_5',
        'NON_BUSINESS_PURPOSE',
        'EXEMPT_SUPPLIES',
        'RCM_NOT_PAID',
        'INVOICE_MISMATCH',
        'VENDOR_NON_FILER',
        'OTHERS',
      ],
    },
    // Verification details
    verificationDetails: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationDate: Date,
      verificationRemarks: String,
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    // GSTR-2A/2B matching status
    gstrMatchingStatus: {
      type: String,
      enum: ['MATCHED', 'MISMATCHED', 'NOT_FOUND', 'NOT_CHECKED'],
      default: 'NOT_CHECKED',
    },
    // GSTR-2A/2B details if available
    gstrDetails: {
      isAvailableIn2A: {
        type: Boolean,
        default: false,
      },
      isAvailableIn2B: {
        type: Boolean,
        default: false,
      },
      matchedDate: Date,
      invoiceValueIn2A: Number,
      taxValueIn2A: Number,
      invoiceValueIn2B: Number,
      taxValueIn2B: Number,
      mismatchRemarks: String,
    },
    // Additional notes
    notes: String,
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
itcSchema.index({ tenant: 1, invoice: 1 }, { unique: true });
itcSchema.index({ tenant: 1, eligibilityStatus: 1 });
itcSchema.index({ tenant: 1, claimStatus: 1 });
itcSchema.index({ tenant: 1, itcType: 1 });
itcSchema.index({ tenant: 1, 'claimPeriod.month': 1, 'claimPeriod.year': 1 });
itcSchema.index({ tenant: 1, gstrMatchingStatus: 1 });

// Pre-save middleware to update invoice ITC status
itcSchema.pre('save', async function (next) {
  // Skip if this is a new document
  if (this.isNew) return next();

  // If eligibility status has changed, update the invoice
  if (this.isModified('eligibilityStatus') || this.isModified('claimStatus')) {
    try {
      const GSTInvoice = mongoose.model('GSTInvoice');
      await GSTInvoice.findByIdAndUpdate(this.invoice, {
        'itc.eligibilityStatus': this.eligibilityStatus,
        'itc.claimStatus': this.claimStatus,
        'itc.eligibleAmount': this.eligibleAmount,
        'itc.claimedAmount': this.claimedAmount,
      });
    } catch (error) {
      console.error('Error updating invoice ITC status:', error);
    }
  }
  next();
});

const ITC = mongoose.model('ITC', itcSchema);

module.exports = ITC;