const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');
const passport = require('passport');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/sankshipt', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', (err) => {
  console.log(err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set Public Folder(s)
app.use('/static', express.static('static'));
app.use(express.static(path.join(__dirname, 'files')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// Connect Flash Middleware
app.use(flash());

// Express Messages Middleware (must come after flash)
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global User variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', async (req, res) => {
  try {
    const articles = await Article.find().lean();
    res.render('index', {
      title: 'Articles',
      articles: articles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
