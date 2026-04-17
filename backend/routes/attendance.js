const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { requireAuth } = require('../middleware/auth');

// Get all attendance
router.get('/', requireAuth, async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('employeeId', 'name department avatar').sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Check-in
router.post('/checkin', requireAuth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ msg: 'employeeId is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const date = new Date();
    date.setHours(0, 0, 0, 0); // Today's date

    // Check if already checked in
    let check = await Attendance.findOne({ employeeId, date });
    if (check) return res.status(400).json({ msg: 'Already checked in today' });

    const newAttendance = new Attendance({
      employeeId,
      date,
      checkIn: new Date(),
      status: 'Present'
    });
    
    await newAttendance.save();
    res.json(newAttendance);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Already checked in today' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
