let mongoose = require('mongoose');

//Areticle Schema
let articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        // required: true
    }
});
module.exports = mongoose.model("Article", articleSchema);