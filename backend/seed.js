require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm');
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({})
    ]);

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, salt);
    
    await User.create({
      name: 'System Admin',
      email: 'admin@oneclick.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user recreated (email: admin@oneclick.com).');

    // Create random Indian employees
    const firstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Krishna', 'Ishaan', 'Rohan', 'Karthik', 'Sai', 'Nikhil',
      'Ananya', 'Diya', 'Ira', 'Aisha', 'Priya', 'Sneha', 'Meera', 'Kavya', 'Riya', 'Pooja'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Nair', 'Iyer', 'Reddy', 'Menon', 'Jain',
      'Bansal', 'Mishra', 'Chopra', 'Kulkarni', 'Pandey', 'Yadav', 'Joshi', 'Chauhan', 'Agarwal', 'Saxena'
    ];
    const roleByDepartment = {
      Engineering: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'QA Engineer', 'DevOps Engineer'],
      Product: ['Product Manager', 'Associate Product Manager', 'Business Analyst'],
      Design: ['UX Designer', 'UI Designer', 'Product Designer'],
      HR: ['HR Manager', 'Talent Acquisition Specialist', 'HR Executive'],
      Finance: ['Finance Analyst', 'Account Executive'],
      Operations: ['Operations Manager', 'Operations Executive']
    };
    const departments = Object.keys(roleByDepartment);

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');

    const employeesData = [];
    const usedNames = new Set();
    const employeeCount = 18;

    while (employeesData.length < employeeCount) {
      const fullName = `${pick(firstNames)} ${pick(lastNames)}`;
      if (usedNames.has(fullName)) continue;
      usedNames.add(fullName);

      const department = pick(departments);
      const role = pick(roleByDepartment[department]);
      const status = Math.random() < 0.18 ? 'On Leave' : 'Active';
      const email = `${slugify(fullName)}@oneclick.com`;

      employeesData.push({ name: fullName, role, department, email, status });
    }

    const employees = await Employee.insertMany(employeesData);
    console.log(`Created ${employees.length} employees.`);

    // Create Attendance
    const today = new Date();
    today.setHours(9, 0, 0, 0); // 9 AM today
    
    const attendanceData = employees.map((emp, index) => {
      let status = 'Present';
      if (index === 2) status = 'Absent'; // Charlie is on leave
      if (index === 4) status = 'Late'; 

      return {
        employeeId: emp._id,
        date: today,
        checkIn: status !== 'Absent' ? new Date(today.getTime() + (index === 4 ? 3600000 : 0)) : null, // 1 hr late for Evan
        status
      };
    });
    await Attendance.insertMany(attendanceData);
    console.log('Created attendance records for today.');

    // Create random leave requests
    const leaveTypes = ['Sick', 'Casual', 'Annual', 'Other'];
    const leaveReasons = [
      'Viral fever and doctor-advised rest',
      'Family function out of station',
      'Personal work and travel',
      'Medical appointment and recovery',
      'Festival leave with family'
    ];
    const leaveStatuses = ['Pending', 'Approved', 'Rejected'];
    const leaveRequestsToCreate = 6;
    const leaveData = [];

    for (let i = 0; i < leaveRequestsToCreate; i += 1) {
      const employee = pick(employees);
      const startOffsetDays = Math.floor(Math.random() * 20) - 5; // some past, some future
      const durationDays = Math.floor(Math.random() * 5) + 1;
      const from = new Date(today.getTime() + startOffsetDays * 86400000);
      const to = new Date(from.getTime() + durationDays * 86400000);

      leaveData.push({
        employeeId: employee._id,
        type: pick(leaveTypes),
        from,
        to,
        reason: pick(leaveReasons),
        status: pick(leaveStatuses)
      });
    }

    await LeaveRequest.insertMany(leaveData);
    console.log(`Created ${leaveData.length} leave requests.`);

    console.log('==== Database seeding completed successfully! ====');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
