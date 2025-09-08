/**
 * GSTR-3B Return Model
 * Represents a GSTR-3B return filing for a specific period
 */

const mongoose = require('mongoose');

// Outward Supplies Schema (Sub-document)
const outwardSuppliesSchema = new mongoose.Schema({
  taxableValue: {
    type: Number,
    default: 0,
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
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Inward Supplies Schema (Sub-document)
const inwardSuppliesSchema = new mongoose.Schema({
  taxableValue: {
    type: Number,
    default: 0,
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
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// ITC Availability Schema (Sub-document)
const itcAvailabilitySchema = new mongoose.Schema({
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
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// ITC Reversal Schema (Sub-document)
const itcReversalSchema = new mongoose.Schema({
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
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Tax Payment Schema (Sub-document)
const taxPaymentSchema = new mongoose.Schema({
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
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  interestAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeesAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Main GSTR-3B Schema
const gstr3bSchema = new mongoose.Schema({
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
  // 3.1 - Outward supplies and inward supplies liable to reverse charge
  outwardSupplies: {
    // 3.1(a) - Outward taxable supplies (other than zero rated, nil rated and exempted)
    taxableOutward: {
      type: outwardSuppliesSchema,
      default: () => ({})
    },
    // 3.1(b) - Outward taxable supplies (zero rated)
    zeroRated: {
      type: outwardSuppliesSchema,
      default: () => ({})
    },
    // 3.1(c) - Other outward supplies (nil rated, exempted)
    nilRatedExempted: {
      type: outwardSuppliesSchema,
      default: () => ({})
    },
    // 3.1(d) - Inward supplies (liable to reverse charge)
    reverseCharge: {
      type: inwardSuppliesSchema,
      default: () => ({})
    },
    // 3.1(e) - Non-GST outward supplies
    nonGst: {
      type: outwardSuppliesSchema,
      default: () => ({})
    }
  },
  // 3.2 - Inter-state supplies made to unregistered persons, composition taxable persons and UIN holders
  interStateSupplies: {
    // To Unregistered Persons
    unregisteredPersons: {
      type: Map,
      of: Number,
      default: () => ({})
    },
    // To Composition Taxable Persons
    compositionPersons: {
      type: Map,
      of: Number,
      default: () => ({})
    },
    // To UIN Holders
    uinHolders: {
      type: Map,
      of: Number,
      default: () => ({})
    }
  },
  // 4. Eligible ITC
  eligibleItc: {
    // 4(a) - ITC Available (Whether in full or part)
    available: {
      // (A) Import of goods
      importOfGoods: {
        type: itcAvailabilitySchema,
        default: () => ({})
      },
      // (B) Import of services
      importOfServices: {
        type: itcAvailabilitySchema,
        default: () => ({})
      },
      // (C) Inward supplies liable to reverse charge (other than A & B above)
      reverseCharge: {
        type: itcAvailabilitySchema,
        default: () => ({})
      },
      // (D) Inward supplies from ISD
      inwardFromIsd: {
        type: itcAvailabilitySchema,
        default: () => ({})
      },
      // (E) All other ITC
      allOther: {
        type: itcAvailabilitySchema,
        default: () => ({})
      }
    },
    // 4(b) - ITC Reversed
    reversed: {
      // (A) As per rules 42 & 43 of CGST Rules
      asPerRules: {
        type: itcReversalSchema,
        default: () => ({})
      },
      // (B) Others
      others: {
        type: itcReversalSchema,
        default: () => ({})
      }
    },
    // 4(c) - Net ITC Available (4(a) - 4(b))
    netAvailable: {
      type: itcAvailabilitySchema,
      default: () => ({})
    },
    // 4(d) - Ineligible ITC
    ineligible: {
      // (A) As per section 17(5)
      asPerSection: {
        type: itcReversalSchema,
        default: () => ({})
      },
      // (B) Others
      others: {
        type: itcReversalSchema,
        default: () => ({})
      }
    }
  },
  // 5. Values of exempt, nil-rated and non-GST inward supplies
  exemptNilNonGstSupplies: {
    // From a supplier under composition scheme, exempt and nil rated supply
    interStateExempt: {
      type: Number,
      default: 0,
      min: 0
    },
    intraStateExempt: {
      type: Number,
      default: 0,
      min: 0
    },
    // Non-GST supply
    nonGst: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  // 6.1 - Payment of tax
  taxPayment: {
    // Tax paid through ITC
    throughItc: {
      type: taxPaymentSchema,
      default: () => ({})
    },
    // Tax paid in cash
    inCash: {
      type: taxPaymentSchema,
      default: () => ({})
    }
  },
  // 6.2 - TDS/TCS Credit
  tdsTcsCredit: {
    tdsAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    tcsAmount: {
      type: Number,
      default: 0,
      min: 0
    }
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
gstr3bSchema.index({ tenantId: 1, gstin: 1, returnPeriod: 1 }, { unique: true });
gstr3bSchema.index({ status: 1 });
gstr3bSchema.index({ returnPeriod: 1 });
gstr3bSchema.index({ createdAt: 1 });
gstr3bSchema.index({ updatedAt: 1 });

// Method to calculate totals
gstr3bSchema.methods.calculateTotals = function() {
  // Calculate total tax liability
  const outward = this.outwardSupplies.taxableOutward;
  const zeroRated = this.outwardSupplies.zeroRated;
  const reverseCharge = this.outwardSupplies.reverseCharge;
  
  const totalIgstLiability = (outward.igstAmount || 0) + (zeroRated.igstAmount || 0) + (reverseCharge.igstAmount || 0);
  const totalCgstLiability = (outward.cgstAmount || 0) + (zeroRated.cgstAmount || 0) + (reverseCharge.cgstAmount || 0);
  const totalSgstLiability = (outward.sgstAmount || 0) + (zeroRated.sgstAmount || 0) + (reverseCharge.sgstAmount || 0);
  const totalCessLiability = (outward.cessAmount || 0) + (zeroRated.cessAmount || 0) + (reverseCharge.cessAmount || 0);
  
  // Calculate total ITC
  const netItc = this.eligibleItc.netAvailable;
  const totalIgstItc = netItc.igstAmount || 0;
  const totalCgstItc = netItc.cgstAmount || 0;
  const totalSgstItc = netItc.sgstAmount || 0;
  const totalCessItc = netItc.cessAmount || 0;
  
  // Calculate tax to be paid in cash
  const igstInCash = Math.max(0, totalIgstLiability - totalIgstItc);
  const cgstInCash = Math.max(0, totalCgstLiability - totalCgstItc);
  const sgstInCash = Math.max(0, totalSgstLiability - totalSgstItc);
  const cessInCash = Math.max(0, totalCessLiability - totalCessItc);
  
  // Update tax payment fields
  this.taxPayment.throughItc.igstAmount = Math.min(totalIgstLiability, totalIgstItc);
  this.taxPayment.throughItc.cgstAmount = Math.min(totalCgstLiability, totalCgstItc);
  this.taxPayment.throughItc.sgstAmount = Math.min(totalSgstLiability, totalSgstItc);
  this.taxPayment.throughItc.cessAmount = Math.min(totalCessLiability, totalCessItc);
  
  this.taxPayment.inCash.igstAmount = igstInCash;
  this.taxPayment.inCash.cgstAmount = cgstInCash;
  this.taxPayment.inCash.sgstAmount = sgstInCash;
  this.taxPayment.inCash.cessAmount = cessInCash;
  
  // Calculate total tax payment
  this.taxPayment.inCash.totalAmount = igstInCash + cgstInCash + sgstInCash + cessInCash + 
                                      (this.taxPayment.inCash.interestAmount || 0) + 
                                      (this.taxPayment.inCash.lateFeesAmount || 0) + 
                                      (this.taxPayment.inCash.penaltyAmount || 0);
  
  return this;
};

// Method to populate from sales and purchase data
gstr3bSchema.methods.populateFromTransactions = async function(startDate, endDate) {
  // This would be implemented to fetch sales and purchase data for the period
  // and populate the GSTR-3B sections accordingly
  // Implementation would depend on the SalesInvoice and PurchaseInvoice models and business logic
  return this;
};

// Method to generate JSON for filing
gstr3bSchema.methods.generateFilingJson = function() {
  // This would generate the JSON structure required for GST portal filing
  // Implementation would follow the GST API specifications
  const filingJson = {
    gstin: this.gstin,
    ret_period: this.returnPeriod,
    sup_details: {
      osup_det: {
        txval: this.outwardSupplies.taxableOutward.taxableValue,
        iamt: this.outwardSupplies.taxableOutward.igstAmount,
        camt: this.outwardSupplies.taxableOutward.cgstAmount,
        samt: this.outwardSupplies.taxableOutward.sgstAmount,
        csamt: this.outwardSupplies.taxableOutward.cessAmount
      },
      osup_zero: {
        txval: this.outwardSupplies.zeroRated.taxableValue,
        iamt: this.outwardSupplies.zeroRated.igstAmount,
        camt: this.outwardSupplies.zeroRated.cgstAmount,
        samt: this.outwardSupplies.zeroRated.sgstAmount,
        csamt: this.outwardSupplies.zeroRated.cessAmount
      },
      osup_nil_exmp: {
        txval: this.outwardSupplies.nilRatedExempted.taxableValue
      },
      isup_rev: {
        txval: this.outwardSupplies.reverseCharge.taxableValue,
        iamt: this.outwardSupplies.reverseCharge.igstAmount,
        camt: this.outwardSupplies.reverseCharge.cgstAmount,
        samt: this.outwardSupplies.reverseCharge.sgstAmount,
        csamt: this.outwardSupplies.reverseCharge.cessAmount
      },
      osup_nongst: {
        txval: this.outwardSupplies.nonGst.taxableValue
      }
    },
    // Other sections as required
  };
  
  return filingJson;
};

const GSTR3B = mongoose.model('GSTR3B', gstr3bSchema);

module.exports = GSTR3B;