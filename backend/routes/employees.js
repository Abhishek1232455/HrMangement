const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);

// Get all employees
router.get('/', requireAuth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Add new employee
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, role, department, email, avatar, joinDate, status } = req.body || {};
    if (!name || !role || !department || !isEmail((email || '').trim().toLowerCase())) {
      return res.status(400).json({ msg: 'Name, role, department, and valid email are required' });
    }

    const safePayload = {
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      email: email.trim().toLowerCase(),
      avatar: avatar || undefined,
      joinDate: joinDate || undefined,
      status: status || 'Active'
    };

    const newEmployee = new Employee(safePayload);
    const employee = await newEmployee.save();
    res.json(employee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Employee email already exists' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
