'use strict';
var mongoose = require('mongoose');

// we will add each person's response to questions as its own model (later)!

var schema = new mongoose.Schema({
    url: String,
    title: String,
    favicon: String,
    highlighted: [String],
    saved: {type: Date, default: Date.now},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

mongoose.model('Link', schema);