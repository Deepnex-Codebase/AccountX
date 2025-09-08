const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  recommendation: { 
    type: String, 
    trim: true
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Closed', 'Deferred'],
    default: 'Open'
  },
  managementResponse: { 
    type: String, 
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const auditSchema = new mongoose.Schema({
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
  auditName: { 
    type: String, 
    required: [true, 'Audit name is required'],
    trim: true
  },
  auditType: { 
    type: String, 
    enum: ['Statutory Audit', 'Internal Audit', 'Tax Audit', 'GST Audit', 'Stock Audit', 'Special Purpose Audit', 'Other'],
    required: [true, 'Audit type is required']
  },
  fiscalYear: { 
    type: String, 
    required: [true, 'Fiscal year is required']
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required']
  },
  endDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Planned', 'In Progress', 'Under Review', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  scope: { 
    type: String, 
    trim: true
  },
  objectives: [{ 
    type: String, 
    trim: true 
  }],
  team: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: { 
      type: String, 
      enum: ['Lead Auditor', 'Auditor', 'Reviewer', 'Subject Matter Expert']
    }
  }],
  findings: [findingSchema],
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
  completedDate: { 
    type: Date 
  },
  completedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  conclusion: { 
    type: String, 
    trim: true
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Create compound index for tenant, client, audit type and fiscal year
auditSchema.index({ tenantId: 1, clientId: 1, auditType: 1, fiscalYear: 1 }, { unique: true });

module.exports = mongoose.model('Audit', auditSchema);