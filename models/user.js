let mongoose = require('mongoose')

//User Schema
let UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);

// let mongoose = require('mongoose');

// //Areticle Schema
// let articleSchema = mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     author: {
//         type: String,
//         required: true
//     },
//     body: {
//         type: String,
//         // required: true
//     }
// });
// module.exports = mongoose.model("Article", articleSchema);