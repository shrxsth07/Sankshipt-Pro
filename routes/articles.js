const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

let Article = require('../models/article');
let User = require('../models/user');

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Auth middleware
function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/users/login');
}

// View routes
router.get('/add', ensureAuthentication, (req, res) => {
  res.render('add_article', { title: 'Add Article' });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

// Add Article POST
router.post('/add', [
  body('title', 'Title is required').notEmpty(),
  body('Body', 'Body is required').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).render('add_article', {
      title: 'Add Article',
      errors: errorMessages,
    });
  }

  try {
    const article = new Article({
      title: req.body.title,
      author: req.user._id,
      body: req.body.Body,
    });
    await article.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit Article POST
router.post('/edit/:id', async (req, res) => {
  try {
    const updatedDoc = await Article.findOneAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        author: req.body.author,
        body: req.body.Body,
      },
      { new: true }
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// View single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).send('Article not found');
    const user = await User.findById(article.author).lean();
    res.render('article', {
      article,
      author: user ? user.name : 'Unknown',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit article GET
router.get('/edit/:id', ensureAuthentication, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.redirect('/');
    if (article.author.toString() !== req.user.id) return res.redirect('/');
    res.render('edit_article', { article });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  if (!req.user || !req.user._id) return res.status(403).send();

  try {
    const article = await Article.findById(req.params.id);
    if (!article || article.author.toString() !== req.user.id) {
      return res.status(403).send();
    }
    await Article.deleteOne({ _id: req.params.id });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
