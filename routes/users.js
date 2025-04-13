const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
let User = require('../models/user');
const session = require('express-session');


const app = express();

// View engine setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password should be of minimum 8 characters').isLength({ min: 8 }),
    // body('password2', "Passwords don't match").equals('password'),
    body('username', 'Username should be of minimum 3 characters').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        console.log(errorMessages);
        res.render('register', {

                errors: errors.array().map(error => error.msg)
            })
            // return res.status(400).json({ errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }

    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    let newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) {
                console.log(err);
            }
            newUser.password = hash;
            newUser.save()
                .then(() => {
                    res.redirect('/users/login');
                })
                .catch((err) => {
                    console.log(err);
                    return;
                });
        });
    });
});
//Login Form
router.get('/login', (req, res) => {
    res.render('login');
});


//Login Pocess
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRediect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

router.get('/logout', (req, res) => {
    // req.logout();
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/users/login');
    });
});


module.exports = router;