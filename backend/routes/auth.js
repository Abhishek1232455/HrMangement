const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ msg: 'Name must be at least 2 characters' });
    }
    if (!isEmail(normalizedEmail)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const vToken = crypto.randomBytes(32).toString('hex');

    user = new User({ 
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationToken: vToken,
      verificationTokenExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS)
    });
    
    await user.save();

    // Nodemailer Ethereal Email Sending
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });

      const info = await transporter.sendMail({
        from: '"1Clik Security" <noreply@1clik.io>',
        to: normalizedEmail,
        subject: "Verify your email address",
        text: `Welcome to 1Clik! Please verify your email by navigating to this link: ${BACKEND_BASE_URL}/api/auth/verify/${vToken}`,
        html: `<div style="font-family:sans-serif; text-align:center; padding: 20px;">
                <h2 style="color:#F97316;">Welcome to 1Clik!</h2>
                <p>Click the button below to verify your email address.</p>
                <a href="${BACKEND_BASE_URL}/api/auth/verify/${vToken}" style="display:inline-block; padding:12px 24px; background:#F97316; color:white; text-decoration:none; border-radius:8px; font-weight:bold; margin-top:20px;">Verify Email</a>
               </div>`
      });
      console.log("==========================================");
      console.log("Verification email PREVIEW URL: %s", nodemailer.getTestMessageUrl(info));
      console.log("==========================================");
    } catch (emailErr) {
      console.error("Email simulated delivery failed:", emailErr);
    }

    res.status(201).json({ msg: 'User registered successfully. Check your email to verify.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Verification Endpoint
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiresAt: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).send(`
        <h1 style="color:red; font-family:sans-serif; text-align:center; margin-top:50px;">
          Invalid or expired verification link!
        </h1>
      `);
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    
    res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!isEmail(normalizedEmail) || !password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email address. Check your inbox!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ msg: 'Google token is required' });
    }

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!googleRes.ok) {
      return res.status(400).json({ msg: 'Google login failed' });
    }

    const profile = await googleRes.json();
    
    if (!profile.email) {
      return res.status(400).json({ msg: 'Google login failed' });
    }

    const normalizedEmail = profile.email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = new User({ 
        name: profile.name, 
        email: normalizedEmail,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        isVerified: true // Google accounts bypass email verification securely
      });
      await user.save();
    } else if (!user.isVerified) {
      // If logging in with matching Google email, auto-verify legacy unverified accounts
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
      await user.save();
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, jwtToken) => {
      if (err) throw err;
      res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
