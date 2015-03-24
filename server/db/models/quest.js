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
    open: {
        type: Boolean
    },
    participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    title: String,
    description: String
});

schema.methods.removeUserFromQuest = function(userId, callback){
    var idx = this.participants.indexOf(userId);
    this.participants.splice(idx, 1);
    this.save(function(err, data) {
        callback(err, data);
    });
};

schema.methods.addUserFromQuest = function(userId, callback){
    this.participants.push(userId);
    this.save(function(err, data) {   
        callback(err, data);
    });
};
mongoose.model('Quest', schema);