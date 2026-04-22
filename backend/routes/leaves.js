const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ALLOWED_LEAVE_TYPES = new Set(['Sick', 'Casual', 'Annual', 'Other']);
const ALLOWED_LEAVE_STATUSES = new Set(['Pending', 'Approved', 'Rejected']);

// Get all leave requests
router.get('/', requireAuth, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate('employeeId', 'name department').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Submit leave request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employeeId, type, from, to, reason } = req.body || {};
    if (!employeeId || !ALLOWED_LEAVE_TYPES.has(type)) {
      return res.status(400).json({ msg: 'Valid employeeId and leave type are required' });
    }

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if (!fromDate || !toDate || Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ msg: 'Valid from/to dates are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const newLeave = new LeaveRequest({
      employeeId,
      type,
      from: fromDate,
      to: toDate,
      reason: reason || '',
      status: 'Pending'
    });
    await newLeave.save();
    res.json(newLeave);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update status
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ALLOWED_LEAVE_STATUSES.has(status)) {
      return res.status(400).json({ msg: 'Invalid leave status' });
    }
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!leave) {
      return res.status(404).json({ msg: 'Leave request not found' });
    }
    res.json(leave);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
