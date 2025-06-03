const mongoose = require('mongoose');

// Article Schema
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
