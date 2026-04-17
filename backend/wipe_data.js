const mongoose = require('mongoose');
require('dotenv').config();

const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Wiping employee data...');
    
    await Employee.deleteMany({});
    console.log('- Employees cleared.');
    
    await Attendance.deleteMany({});
    console.log('- Attendance cleared.');
    
    await LeaveRequest.deleteMany({});
    console.log('- Leave requests cleared.');
    
    console.log('All employee data successfully deleted!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
