const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,         // added uniqueness constraint
    lowercase: true,      // store email in lowercase for consistency
    trim: true,           // trim whitespace
  },
  username: {
    type: String,
    required: true,
    unique: true,         // usernames should be unique
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
