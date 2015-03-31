'use strict';
var mongoose = require('mongoose');
var User = require('./user.js');
var Step = require('./step.js');

var schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    privacy: {
        type: Boolean
    },
    active: {
        type: Boolean
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: true,
        unique: true
    },
    cat:{
        url: String,
        cat: String
    },
    description: String,
    winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

mongoose.model('Quest', schema);