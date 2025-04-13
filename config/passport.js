const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const session = require('express-session');


// app.use(passport.initialize());
// app.use(passport.session());

module.exports = (passport) => {
    passport.use(
        new LocalStrategy((username, password, done) => {
            const query = { username: username };

            User.findOne(query)
                .then((user) => {
                    if (!user) {
                        return done(null, false, { message: 'No user found' });
                    }

                    bcrypt.compare(password, user.password)
                        .then((isMatch) => {
                            if (isMatch) {
                                return done(null, user);
                            } else {
                                return done(null, false, { message: 'Wrong password' });
                            }
                        })
                        .catch((err) => {
                            throw err;
                        });
                })
                .catch((err) => {
                    throw err;
                });
        })
    );
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then((user) => {
                done(null, user);
            })
            .catch((err) => {
                done(err, null);
            });
    })
}