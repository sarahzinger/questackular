'use strict';
var mongoose = require('mongoose');

// we will add each person's response to questions as its own model (later)!

var schema = new mongoose.Schema({
    url: String,
    questions: [{
        value: {
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
        multipleAns: [{
            ans: String,
            correct: Boolean
        }],
        fillIn: String
    }],
    tags: [String],
    clues: [{
        text: String,
    }],
    buyAnswer: [{
        text: String,
        cost: Number
    }],
    annotations: [{
        selector: String,
        replace: String
    }],
    prevQ: {
        type: mongoose.Schema.Types.ObjectId
    },
    nextQ: {
        type: mongoose.Schema.Types.ObjectId
    }
});

// '<h1>hi</h1>'
// function putInStuff(selector,replace){
//    $(selector).html(replace)
// }

mongoose.model('Step', schema);