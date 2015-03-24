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
    // MAYBE use this: mongo indexing for quickly looking up all users in any given quest
    // participating: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Quest'
    // }],
    participating: [{
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        currentStep: Number,
        pointsFromQuest: Number,
        stepsPurchased:[Number]
    }],

    // pastQuests: [{
    //     questId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Quest'
    //     },
    //     points: Number,
    //     stpesPurchased: [Number]
    // }], 
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

// addQuest
// removeQuest
//



// schema.pre('save', function(next) {

//     if (this.isModified('participating')) {
//         var modifiedArray = this.modifiedPaths();

//         mongoose.model('Quest').findById(this.participating[], function (err, singleQuest) {
//             var idx = singleQuest.participants.indexOf(req.user);
//             singleQuest.participants.splice(idx, 1);
//             singleQuest.save();
//         });
          
//     } 

//     next();

// });

schema.methods.removeQuestFromUser = function(questId, callback){
    var idx = this.participating.indexOf(questId);
    this.participating.splice(idx, 1);
    this.save();
    callback();
};
schema.methods.addQuestToUser = function(questId, callback){
    this.participating.push({questId: questId});
    this.save();
    callback();
}
schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function(candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);
