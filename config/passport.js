const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      // Match user
      User.findOne({ username: username })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'No user found' });
          }

          // Match password
          bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Wrong password' });
              }
            })
            .catch(err => done(err));
        })
        .catch(err => done(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
  });
};
