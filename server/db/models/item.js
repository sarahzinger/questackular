'use strict';
var mongoose = require('mongoose');

// we will add each person's response to questions as its own model (later)!

var schema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    }
});


mongoose.model('Item', schema);