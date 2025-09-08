const mongoose = require('mongoose');

const taxFilingSchema = new mongoose.Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  filingType: { 
    type: String, 
    enum: ['Income Tax Return', 'TDS Return', 'GST Return', 'ROC Filing', 'Other'],
    required: [true, 'Filing type is required']
  },
  subType: { 
    type: String, 
    trim: true
  },
  period: { 
    type: String, 
    required: [true, 'Period is required'],
    trim: true
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required']
  },
  extendedDueDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Filed', 'Verified', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  filedDate: { 
    type: Date 
  },
  filedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  acknowledgmentNo: { 
    type: String, 
    trim: true 
  },
  acknowledgmentFile: { 
    fileName: { 
      type: String 
    },
    fileUrl: { 
      type: String 
    },
    uploadedAt: { 
      type: Date 
    }
  },
  taxAmount: { 
    type: Number 
  },
  refundAmount: { 
    type: Number 
  },
  paymentDetails: [{
    paymentMode: { 
      type: String, 
      enum: ['Challan', 'Online', 'Adjustment', 'Other']
    },
    paymentDate: { 
      type: Date 
    },
    amount: { 
      type: Number 
    },
    referenceNo: { 
      type: String 
    }
  }],
  documents: [{
    documentType: { 
      type: String 
    },
    fileName: { 
      type: String 
    },
    fileUrl: { 
      type: String 
    },
    uploadedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  notes: [{
    text: { 
      type: String 
    },
    addedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  fiscalYear: { 
    type: String, 
    required: [true, 'Fiscal year is required']
  },
  assessmentYear: { 
    type: String 
  }
}, { timestamps: true });

// Create compound index for tenant, client, filing type and period
taxFilingSchema.index({ tenantId: 1, clientId: 1, filingType: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('TaxFiling', taxFilingSchema);