/**
 * Account Model
 * Represents an account in the chart of accounts
 */

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Account code is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
    trim: true
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
accountSchema.index({ tenantId: 1 });
accountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
accountSchema.index({ createdAt: 1 });
accountSchema.index({ updatedAt: 1 });

// Virtual for child accounts
accountSchema.virtual('childAccounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parentAccount'
});

// Method to get full account path (for hierarchical display)
accountSchema.methods.getFullPath = async function() {
  let path = this.name;
  let currentAccount = this;
  
  while (currentAccount.parentAccount) {
    const parent = await mongoose.model('Account').findById(currentAccount.parentAccount);
    if (!parent) break;
    
    path = `${parent.name} > ${path}`;
    currentAccount = parent;
  }
  
  return path;
};

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;