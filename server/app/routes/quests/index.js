'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var request = require('request');

// var mandrill = app.getValue('env').MANDRILL;

router.post('/', function (req, res) {
    mongoose.model('Quest').findOne({
        title: req.body.title
    }, function (err, quest) {
        console.log("quest", quest)
        if (err) return next(err);
        if (quest !== null) {
            return res.send("duplicateQuest"); //q exists. Don't create
        } else {
            //quest doesn't already exist, so we can save it.
            mongoose.model('Quest').create(req.body).then(function (data) {
                req.user.created.push(data._id);
                req.user.save();
                res.send(data._id);
            });

        }
    });

});

router.get('/', function (req, res) {
    mongoose.model('Quest').find({}).exec(function (err, quests) {
        if (err) res.send(err);
        res.json(quests);
    });
});

router.get('/user/:id', function (req, res) {
    var user = req.params.id;
    mongoose.model('Quest').find({
        owner: user
    }, function(err, quests) {
        res.send(quests);
    });
});

router.get('/:id', function (req, res) {
    var questId = req.params.id;
    mongoose.model('Quest').find({
        _id: questId
    }).exec(function(err, quest) {
        if (err) res.send(err);
        res.json(quest);
    });
});

// when a user "joins" a quest
router.post('/participants', function (req, res) {
    var alreadyParticipating = _.findIndex(req.user.participating, function(questPlaying) {
        return questPlaying.questId == req.body._id;
    });
    console.log("alreadyParticipating?", alreadyParticipating);
    if (alreadyParticipating === -1) { // if NOT found in participating [], therefore NOT participating
        req.user.addQuestToUser(req.body._id, function (err, data) {
            if (err) console.log(err);
            res.json(data);
        });
    } else {
        res.send("already completed");     
    }

});

//quest Completed route
router.put('/participants', function(req, res){
    var alreadyStored = _.findIndex(req.user.pastQuests, function (quest) {
          return quest.questId == req.body.questId;
    });
    if(alreadyStored === -1) {
        req.user.questCompleted(req.body.questId, function (err, data) {
            if(err) console.log(err);
            req.user.removeQuestFromUser(req.body.questId, function(err, data){
                res.send(data);
            })
        })
    }else{
        req.user.removeQuestFromUser(req.body.questId, function (err, data) {
            res.send();
        })
    }
})

//does this get called?
router.get('/users/participants', function (req, res) {
    var users = quest.participants;
    users.forEach(mongoose.model('User').findById(user, function() {
        return user;
        })
    );
});

// when a user "leaves" a quest
router.delete('/participants/:id', function (req, res) {
    req.user.removeQuestFromUser(req.params.id, function (err, data) {
        if (err) console.log(err);
        res.json(data);
    });
});

router.put('/', function (req, res) {
    console.log("entering api/quests")
    console.log('req.body', req.body);
    //not sure if we can 'save' the id, so removing it
    mongoose.model('Quest').findByIdAndUpdate(req.body._id, req.body, function (err, updSt) {
        res.send(updSt._id);
    });
});

router.post('/invite', function (req, res) {
    console.log('req.user', req.user);

    for (var i = 0; i < req.body.invitees.length; i++) {
        // make ajax req to mandrill
        console.log("running for req.body.invtiees at number", req.body.invitees[i]);
        request.post({url: 'https://mandrillapp.com/api/1.0/messages/send.json', 
            form: {
                key: 'hM6OlbcTpHE7fYJp-GQNsw',
                message: {
                    from_email: req.user.google.email,
                    to: [{
                        name: req.body.invitees[i].name,
                        email: req.body.invitees[i].email
                    }],
                    autotext: true,
                    subject:req.user.google.name + ' has invited you to join a quest!',
                    html: req.user.google.name + ' has invited you to join ' + req.body.quest.title + ', a quest on <a href="http://questackular.herokuapp.com">Questackular!</a>. Log in at <a href="http://questackular.herokuapp.com">Questackular!</a> to find out more!'
                }
            }
        }, function (err, httpResponse, body) {
            console.log("request.post callback 'err'", err);
            console.log("request.post callback httpResponse", httpResponse);
            console.log("request.post callback body", body)
            
        });   
    }
    
    res.send("done");
});


