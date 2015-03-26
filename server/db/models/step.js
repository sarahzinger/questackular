'use strict';
var mongoose = require('mongoose');
var Quest = require('./quest.js');

// we will add each person's response to questions as its own model (later)!

var schema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    pointValue: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    qType: {
        type: String,
        required: true
    },
    multipleAns: [String],
    multiAnsCor: String,
    fillIn: String,
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
    }],
    stepNum: Number
});

// '<h1>hi</h1>'
// function putInStuff(selector,replace){
//    $(selector).html(replace)
// }

mongoose.model('Step', schema);