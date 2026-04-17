const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['Sick', 'Casual', 'Annual', 'Other'], required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

leaveRequestSchema.path('to').validate(function (value) {
  return !this.from || !value || value >= this.from;
}, 'Leave end date must be the same as or after start date');

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
