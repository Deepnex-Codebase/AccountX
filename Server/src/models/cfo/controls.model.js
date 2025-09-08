const mongoose = require('mongoose');

const testingScheduleSchema = new mongoose.Schema({
  frequency: String,
  nextTestDate: Date
}, { _id: false });

const controlSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', , required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Process', 'IT', 'Financial'], required: true },
  testingSchedule: testingScheduleSchema,
  status: { type: String }
}, { timestamps: true });

controlSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Control', controlSchema); 