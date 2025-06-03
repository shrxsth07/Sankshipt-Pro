const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

let User = require('../models/user');

// Register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register POST
router.post('/register', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password should be of minimum 8 characters').isLength({ min: 8 }),
  body('username', 'Username should be of minimum 3 characters').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).render('register', { errors: errorMessages });
  }

  const { name, email, username, password } = req.body;

  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).render('register', { errors: ['Email is already registered'] });
    }

    let newUser = new User({ name, email, username, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    req.flash('success', 'You are now registered and can log in');
    res.redirect('/users/login');

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
