'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

router.post('/save', function (req, res, next) {
    mongoose.model('Quest').findOne({
        title: req.body.title
    }, function(err, quest) {
        console.log('question:', quest);
        if (err) return next(err);
        if (quest !== null) return res.send("This Quest already exists!"); //q exists. Don't create
        else {
            //question doesn't already exist, so we can save it.
            console.log('In the save part');

            mongoose.model('Quest').create(req.body).then(function(data) {

                mongoose.model('User').findById(req.body.owner, function(err, userObj){
                    if (err) {
                        console.log(err);
                    } else {
                        userObj.created.push(data._id);
                        userObj.save(); 
                    }
                });
                res.send(data._id);
            });

        }
    });

});

router.get('/', function (req, res) {
    mongoose.model('Quest').find({}).exec(function(err, quests) {
        if (err) res.send(err);
        res.json(quests);
    });
});

router.get('/:id', function (req, res) {
    var questId = req.params.id;
    mongoose.model('Quest').find({_id: questId}).exec(function(err,quest) {
        if(err) res.send(err);
        res.json(quest);
    });
});

router.post('/:id', function (req, res) {
    console.log("req.body", req.body);

    async.parallel([
        function() {
            mongoose.model('User').findById(req.body.participants[req.body.participants.length - 1], function (err, user) {
                console.log("user", user);
                var alreadyParticipating = _.findIndex(user.participating, function (questPlaying) {
                    return questPlaying.questId == req.body._id;
                });
                console.log("alreadyParticipating", alreadyParticipating);
                if (alreadyParticipating !== -1) return;
                else {
                    user.participating.push({
                        questId: req.body._id,
                        currentStep: 0,
                        pointsFromQuest: 0,
                        stepsPurchased:[]
                    });
                    user.save();
                }
            });
        },
        function() {
            mongoose.model('Quest').findById(req.params.id, function (err, quest) {
                console.log("quest.participants.indexOf(req.params.id)", quest.participants.indexOf(req.params.id));
                if (quest.participants.indexOf(req.params.id) !== -1) return;
                else {
                    quest.participants = req.body.participants;
                    quest.save();
                }
            });
        }], function() {
            res.json(req.body);
    });
});