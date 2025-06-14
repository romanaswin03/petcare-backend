const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {sendResetEmail} = require('../utils/email');
const { error } = require('console');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Incoming login data:', email, password);
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email});
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error', err);
    
    res.status(500).json({ message: 'Server error' });
  }
});

//Reset password link sent through email
router.post('/forgot-password', async(req, res)=> {
  const {email} = req.body;
  try{
    const user = await User.findOne({email});
    if(!User) {
      return res.status(404).json({message: 'Email not found'});
    }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() +3600000; // valid for 1 hour
  await user.save();
  await sendResetEmail(user.email, token);
  res.json({message: 'Reset link sent to your mail'});
 } catch(err){
  console.error('Password reset error:', err);
  res.status(500).json({message: 'Server error'});
 }
});

router.post('/reset-password/:token', async(req, res) => {
  const {token} = req.params;
  const {password} = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: {$gt: Date.now()},
  });

  if(!user) return res.status(400).json({ message: 'Invalid or expired token'});

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({message: 'Password reset successfully'});
});

module.exports = router;