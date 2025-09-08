const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
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
  taskName: { 
    type: String, 
    required: [true, 'Task name is required'],
    trim: true
  },
  description: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    enum: ['Income Tax', 'GST', 'Company Law', 'ROC', 'Audit', 'Other'],
    required: [true, 'Category is required']
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required']
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Delayed', 'Cancelled'],
    default: 'Pending'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  completedDate: { 
    type: Date 
  },
  completedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reminderDate: { 
    type: Date 
  },
  recurrence: { 
    type: String, 
    enum: ['None', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
    default: 'None'
  },
  attachments: [{
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
  fiscalYear: { 
    type: String, 
    required: [true, 'Fiscal year is required']
  },
  assessmentYear: { 
    type: String 
  }
}, { timestamps: true });

// Create compound index for tenant, client and task name
complianceSchema.index({ tenantId: 1, clientId: 1, taskName: 1, fiscalYear: 1 }, { unique: true });

module.exports = mongoose.model('Compliance', complianceSchema);