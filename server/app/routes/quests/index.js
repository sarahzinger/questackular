'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

router.post('/', function (req, res) {
    console.log("req.user", req.user);
    mongoose.model('Quest').findOne({
        title: req.body.title
    }, function(err, quest) {
        console.log('question:', quest);
        if (err) return next(err);
        if (quest !== null) {
            console.log("quest !== null", quest);
            return res.send("duplicateQuest"); //q exists. Don't create
        }
        else {
            //quest doesn't already exist, so we can save it.
            console.log('In the save part, quest == null', quest);

            mongoose.model('Quest').create(req.body).then(function(data) {
                console.log("quest.create promise data", data);

                req.user.created.push(data._id);
                req.user.save();
                res.send(data._id);
            });

        }
    });

});

router.get('/', function(req, res) {
    mongoose.model('Quest').find({}).exec(function(err, quests) {
        if (err) res.send(err);
        res.json(quests);
    });
});

router.get('/user/:id', function(req, res) {
    console.log(req.params);
    var user = req.params.id;
    mongoose.model('Quest').find({
        owner: user
    }, function(err, quests) {
        res.send(quests);
    });
});

router.get('/:id', function(req, res) {
    var questId = req.params.id;
    mongoose.model('Quest').find({
        _id: questId
    }).exec(function(err, quest) {
        if (err) res.send(err);
        res.json(quest);
    });
});

// when a user "joins" a quest

router.post('/participants', function(req, res) {
    console.log("req.user", req.user);
    var alreadyParticipating = _.findIndex(req.user.participating, function(questPlaying) {
        return questPlaying.questId == req.body._id;
    });
    console.log("alreadyParticipating?", alreadyParticipating);
    if (alreadyParticipating === -1) { // if NOT found in participating [], therefore NOT participating
        console.log("NOT yet participating");
        req.user.addQuestToUser(req.body._id, function(err, data) {
            if (err) console.log(err);
            console.log("addQuestToUser callback data", data);
            res.json(data);
        });
    }

});

//quest Completed route
router.put('/participants', function(req, res){
    req.user.questCompleted(req.body.questId, function(err, data){
        if(err) console.log(err);
        req.user.removeQuestFromUser(req.body.questId, function(err, data){
            res.send(data);
        })
    })
})

//does this get called?
router.get('/users/participants', function (req, res) {
        var users = quest.participants;
        users.forEach(mongoose.model('User').findById(user, function() {
            console.log('this happened');
            return user;
            })
        );
});



// when a user "leaves" a quest
router.delete('/participants/:id', function(req, res) {

    req.user.removeQuestFromUser(req.params.id, function(err, data){
        if (err) console.log(err);
        res.json(data);
    });
});


router.put('/', function(req, res) {
    //not sure if we can 'save' the id, so removing it
    mongoose.model('Quest').findByIdAndUpdate(req.body._id, req.body, function(err, updSt) {
        res.send(updSt._id);
    });
});