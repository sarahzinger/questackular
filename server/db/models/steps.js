'use strict';
var mongoose = require('mongoose');

// we will add each person's response to questions as its own model (later)!

var schema = new mongoose.Schema({
    url: String,
    pointValue: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },

    multipleAns: [{
        ans: String,
    }],
    multiAnsCor:String,
    fillIn: String,
    shortAns: Boolean,
    quest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    },
    tags: [String],
    clues: [{
        text: String,
    }],
    annotations: [{
        selector: String,
        replace: String
    }]
});

// '<h1>hi</h1>'
// function putInStuff(selector,replace){
//    $(selector).html(replace)
// }

mongoose.model('Step', schema);