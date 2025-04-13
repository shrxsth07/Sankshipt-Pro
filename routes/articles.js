const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path')
    // const expressMessage = require('express-messages')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
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

let Article = require('../models/article');
let User = require('../models/user')

router.get('/add', ensureAuthentication, (req, res) => {
    res.render('add_article', {
        title: 'Add Artticle'
    })
})

router.get('/about', (req, res) => {
    res.render('about')
})

router.get('/contact', (req, res) => {
        res.render('contact')
    })
    //Add submit posts
router.post('/add', [
    body('title', 'Title is required').notEmpty(),
    // body('author', 'Author is required').notEmpty(),
    body('Body', 'Body is required').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        console.log(errorMessages);
        res.render('add_article', {
            title: 'Add Artticle',
            errors: errors.array().map(error => error.msg)
        })
        return res.status(400).json({ errors: errors.array() });
    }
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.Body;
    // console.log(req.body.title);

    // article.save(function(err) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     } else {
    //         res.redirect('/')
    //     }
    // })
    article.validate()
        .then(() => {
            article.save()
                .then(() => {
                    // console.log('New article added');
                    // req.flash('success', 'Article Added');
                    res.redirect('/');

                })
                .catch((error) => {
                    // Handle any errors
                    console.log(error);
                });
        })
        .catch((error) => {
            console.error(error);
        });
});


router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.Body;

    console.log(article)
        // console.log(req.body.title);

    Article.findOneAndUpdate({ _id: req.params.id }, { title: req.body.title, author: req.body.author, body: req.body.Body }, { new: true })
        .then((updatedDocument) => {
            // Handle the updated document
            // req.flash('success', 'Article Updated');
            res.redirect('/');
            console.log(updatedDocument);
        })
        .catch((error) => {
            // Handle any errors

            console.error(error);
        });


    // article.collection.updateOne({ _id: req.params.id }, [{ title: req.body.title }, { author: req.body.author }, { body: req.body.body }])
    //     .then(() => {
    //         // console.log(result);
    //         res.redirect('/')
    //     })
    //     .catch((error) => {
    //         // Handle any errors
    //         console.log(error);
    //     });
})




router.get('/:id', (req, res) => {
    Article.findById(req.params.id)
        .then((article) => {
            console.log(article);
            User.findById(article.author)
                .then((user) => {
                    res.render('article', {
                        article: article,
                        author: user.name
                    })
                })

        })
        .catch((error) => {
            console.log(error);
        });
})

//Load Edit Form
router.get('/edit/:id', ensureAuthentication, (req, res) => {
    Article.findById(req.params.id)
        .then((article) => {
            console.log(article);
            if (article.author != req.user.id) {
                res.redirect('/')
            }
            res.render('edit_article', {
                article: article
            })
        })
        .catch((error) => {
            console.log(error);
        });
})

//Access Control
function ensureAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}
//Delete request
router.delete('/:id', (req, res) => {

    if (!req.user._id) {
        res.status(500).send();
    }
    Article.findById(req.params.id)
        .then((article) => {
            if (article.author != req.user.id) {
                res.status(500).send();
            } else {
                Article.deleteOne({ _id: req.params.id })
                    .then(() => {
                        console.log('Successful');
                        res.sendStatus(200); // Send a success response if needed
                    })
                    .catch((err) => {
                        console.log(err);
                        res.sendStatus(500); // Send an error response if needed
                    });
            }
        })
        .catch((err) => {
            console.log(err)
        });

});

module.exports = router;