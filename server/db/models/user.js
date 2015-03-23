'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var Quest = require('./quest.js');
var schema = new mongoose.Schema({

    levels: Number,
    ownedItems: [String],
    created: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    }],
    participating: [{
        questId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        currentStep: Number,
        pointsFromQuest: Number,
        stepsPurchased:[Number]
    }],
    pastQuests: [{
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        points: Number,
        stepsPurchased: [Number]
    }],

    google: {
        id: String,
        name: String,
        email: String
    }
});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function(plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function(next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function(candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);