const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Client name is required'],
    trim: true
  },
  pan: { 
    type: String, 
    required: [true, 'PAN is required'],
    trim: true,
    uppercase: true,
    match: [/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Please provide a valid PAN']
  },
  gstin: { 
    type: String, 
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please provide a valid GSTIN']
  },
  clientType: { 
    type: String, 
    enum: ['Individual', 'Company', 'Partnership', 'LLP', 'HUF', 'Trust', 'AOP', 'Other'],
    required: [true, 'Client type is required']
  },
  contactPerson: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  city: { 
    type: String, 
    trim: true 
  },
  state: { 
    type: String, 
    trim: true 
  },
  pincode: { 
    type: String, 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  dateOfBirth: { 
    type: Date 
  },
  dateOfIncorporation: { 
    type: Date 
  },
  financialYearEnd: { 
    type: String,
    enum: ['31-03', '31-12', '30-06', '30-09'],
    default: '31-03'
  },
  assessmentYearEnd: { 
    type: String 
  },
  notes: { 
    type: String 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Create compound index for tenant and PAN
clientSchema.index({ tenantId: 1, pan: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);