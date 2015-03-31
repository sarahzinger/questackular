'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var Quest = require('./quest.js');
var _ = require('lodash');
var Step = require('./step.js');
var Item = require('./item.js');
var async = require('async');

var schema = new mongoose.Schema({

    levels: Number,
    created: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    }],

    participating: [{
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        currentStep: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Step'
        },
        pointsFromQuest: Number,
        stepsPurchased: [Number]

    }],
    pointsSpent: Number,
    itemsBought: [String],
    google: {
        id: String,
        name: String,
        email: String,
        picture: String
    },
    pastQuests:[{
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        pointsFromQuest: Number,
        stepsPurchased: [Number]
    }]
});

schema.set('toJSON', {virtuals: true});

schema.virtual('totalPoints').get(function() {
    var total = 0;
    if(this.participating.length >= 1){
        this.participating.forEach(function (questObj) {
            total += Number(questObj.pointsFromQuest);
        });
    }
    if(this.pastQuests.length >= 1){
        this.pastQuests.forEach(function(questObj){
            total+=Number(questObj.pointsFromQuest);
        });
    }
    if (this.pointsSpent) total -= this.pointsSpent;
    return total;
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

schema.methods.removeQuestFromUser = function(questId, callback){
    var self = this;
    
        //removes quest from user

        // var idx = this.participating.indexOf(questId);
        var idx = _.findIndex(self.participating, function (questObj) {
            return questObj.questId == questId;
        });

        self.participating.splice(idx, 1);
        self.save(function (err, data) {
            // removing user from quest
            mongoose.model('Quest').findOne({_id: questId}, function (err, questFound) {
                var userIndex = questFound.participants.indexOf(self._id);
                questFound.participants.splice(userIndex, 1);
                questFound.save(function (err, data) {
                    callback();
                });
            });

        });

};
schema.methods.addQuestToUser = function(questId, callback){
    var self = this;
    async.parallel([function (done) {
        
        // finding step, adding step to quest; then adding quest to user
        mongoose.model('Step').find({quest: questId}, function (err, steps){
            if (err) return (err);
            if (steps.length) {
                steps.forEach(function (step) {
                    if (step.stepNum === 1){
                        self.participating.push({questId: questId, currentStep: step._id, pointsFromQuest:0});
                        self.save(function(err, userData) { 
                            if (err) console.log(err);  
                        });
                    }
                });
            } else {
                self.participating.push({questId: questId});
                self.save(function(err, userData) { 
                    if (err) console.log(err); 
                });
            }
            done();
        });
    }, function (done) {
        // adding user to quest
        mongoose.model('Quest').findById(questId, function (err, quest) {
            if (quest.participants.indexOf(self._id) === -1) {
                quest.participants.push(self._id);
                quest.save(function (err, questObj) {
                    if (err) console.log(err);
                });
            }
            done();
        });    
    }], function (err, data) {
        callback(err, data);
    });
};
schema.methods.questCompleted = function(questId, callback){
    console.log("entering quest questCompleted")
    var self = this;
    
    async.parallel([function (done) {
        console.log("first parallel")
        //pushed quest into pastQuests
        self.participating.forEach(function(quest){
            if (quest.questId == questId){
                self.pastQuests.push({questId: questId, pointsFromQuest: quest.pointsFromQuest});
                self.save(function(err, userData) { 
                    if (err) console.log(err);  
                    done();
                });
            }
        });
        
    }, function (done) {
        // adding user to quest
        mongoose.model('Quest').findById(questId, function (err, quest) {
            if (quest.winners.indexOf(self._id) === -1) {
                quest.winners.push(self._id);
                quest.save(function (err, questObj) {
                    if (err) console.log(err);
                    done();
                });
            }
            
        });
    }], function (err, data) {
        callback(err, data);
    });
};

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function(candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);
