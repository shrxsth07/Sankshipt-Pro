// console.log("Hello world");
const express = require('express')
    // const flash = require('connect-flash')
    // const session = require('express-session')
const path = require('path')
    // const expressMessage = require('express-messages')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const config = require('./config/database');
const passport = require('passport')
mongoose.set('debug', true);


mongoose.connect('mongodb://127.0.0.1/sankshipt')

let db = mongoose.connection;

db.once('open', () => {
        console.log("Connected to MongoDB");
    })
    //error detect in db
db.on('error', (err) => {
    console.log(err);
})
const app = express()


//view engine detup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
app.use('/static', express.static('static'))
app.use(express.static(path.join(__dirname, 'files')))


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

//Express Session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
        // cookie: { secure: true }
}))



// Express Messages Middleware
// app.use(flash());
// app.use(function(req, res, next) {
//     res.locals.messages = require('express-messages')(req, res);
//     next();
// });

// app.use(
//         // body('author').notEmpty().withMessage('Author is required'),
//         // body('Body').notEmpty().withMessage('Body is required')
//     )
//     // Your routes and other middleware

// Error handling middleware
// app.use((req, res, next) => {
//     // Handle validation errors
//     // req.checkBody('Body', 'Body is required').isEmpty();
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         // Format and send validation error response
//         return res.status(422).json({ errors: errors.array() });
//     }
//     next();
//     // Handle other errors
//     // ...
// });

// Start the server





// app.use(
//     body().isArray().withMessage('Invalid data format')
//     // Add more validation rules as needed
// );
// app.use((err, req, res, next) => {
//     // Handle validation errors
//     if (err instanceof validationResult) {
//         return res.status(422).json({ errors: err.array() });
//     }
//     // Handle other errors
//     // ...
// });


// //Models Bringing




let Article = require('./models/article');


require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
// initializePassport(passport);
app.get('*', (req, res, next) => {
        res.locals.user = req.user || null;
        next();
    })
    //Routes
app.get('/', (req, res) => {
    Article.find().maxTimeMS(20000)
        .then((results) => {
            // Process the results
            res.render('index', {

                articles: results
            })
        })
        .catch((error) => {
            // Handle any errors
            console.error(error);
        });


})


//Add Route
let articles = require('./routes/articles');
app.use('/articles', articles);

let userRouter = require('./routes/users');
app.use('/users', userRouter);


//Server Listen
app.listen(process.env.port||3000, () => {
    console.log("Server started on port 3000...")
});
