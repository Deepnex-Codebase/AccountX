/**
 * GST Registration Model
 * Represents a GSTIN profile for a tenant
 */

const mongoose = require('mongoose');

const gstRegistrationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  gstin: {
    type: String,
    required: [true, 'GSTIN number is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // GSTIN validation regex (15 characters: 2 state code + 10 PAN + 1 entity + 1 Z + 1 checksum)
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
      },
      message: 'Please provide a valid GSTIN number'
    }
  },
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  stateCode: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // State code validation (2 digits)
        return /^[0-9]{2}$/.test(value);
      },
      message: 'Please provide a valid state code'
    }
  },
  legalName: {
    type: String,
    trim: true
  },
  tradeName: {
    type: String,
    trim: true
  },
  registrationType: {
    type: String,
    enum: ['Regular', 'Composition', 'Casual', 'SEZ', 'NRTP', 'ISD', 'UIN'],
    default: 'Regular'
  },
  registrationDate: {
    type: Date
  },
  lastVerifiedAt: {
    type: Date
  },
  portalCredentials: {
    username: String,
    password: {
      type: String,
      select: false // Don't include password in query results by default
    },
    isStored: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
gstRegistrationSchema.index({ tenantId: 1, gstin: 1 }, { unique: true });
gstRegistrationSchema.index({ createdAt: 1 });
gstRegistrationSchema.index({ updatedAt: 1 });

// Virtual for state name based on state code
gstRegistrationSchema.virtual('stateName').get(function() {
  const stateMap = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh (New)',
    '38': 'Ladakh',
    '97': 'Other Territory',
    '99': 'Centre Jurisdiction'
  };
  
  return this.stateCode ? stateMap[this.stateCode] || 'Unknown State' : 'Unknown State';
});

// Pre-save hook to extract state code from GSTIN
gstRegistrationSchema.pre('save', function(next) {
  if (this.gstin && this.gstin.length >= 2) {
    this.stateCode = this.gstin.substring(0, 2);
  }
  next();
});

const GSTRegistration = mongoose.model('GSTRegistration', gstRegistrationSchema);

module.exports = GSTRegistration;