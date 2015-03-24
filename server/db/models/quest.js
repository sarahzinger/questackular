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
    participants: [String],
    title: {
        type: String,
        required: true
    },
    description: String
});

mongoose.model('Quest', schema);