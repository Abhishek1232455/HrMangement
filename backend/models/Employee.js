const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'On Leave'], default: 'Active' }
});

module.exports = mongoose.model('Employee', employeeSchema);
