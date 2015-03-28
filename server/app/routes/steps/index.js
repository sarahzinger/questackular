'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');


router.get('/:id', function (req, res, next) {
    console.log("req.params.id", req.params.id);
    mongoose.model('Step').findById(req.params.id, function(err, step) {
        if(err) console.log(err);
        res.json(step);
    });
});

router.post('/', function (req, res, next) {
    mongoose.model('Step').findOne({
        question: req.body.question,
        quest: req.body.quest
    }, function (err, step) {
        if (err) return next(err);
        //the following message should really never be triggered
        if (step !== null) return res.send("This step already exists!");
        else {
            //save the step
            console.log('We are saving a step!Yay!');
            console.log(req.body);
            console.log(step);

            mongoose.model('Step').create(req.body).then(function(data) {
                console.log('HELLO');
                res.send('Saved!');
            });
        }
    });
});

router.get('/list/:id', function (req, res) {
    var questId = req.params.id;
    console.log('Quest: ', questId);
    mongoose.model('Step').find({
        quest: questId
    }, function (err, steps) {
        res.send(steps);
    });
});

router.post('/rem/', function(req, res) {
    //rem: its the end of the step as we know it, and i feel fine
    var stepToRemId = req.body._id;
    var stepToRenumQ = req.body.quest;
    console.log('Oh no! You removed step id-' + stepToRemId);
    mongoose.model('Step').findByIdAndRemove(stepToRemId, function(err, step) {
        //removed step. Now renumber the other steps. First find them
        mongoose.model('Step').find({
            quest: stepToRenumQ
        }, function(err, stepsToRename) {
            //loop thru all remaining steps and renumber them sequentially.
            for (var i = 0; i < stepsToRename.length; i++) {
                stepsToRename[i].stepNum = i;
                stepsToRename[i].save();
            }
            res.send(stepsToRename);
        });
    });
});

router.post('/upd', function(req, res, next) {
    //not sure if we can 'save' the id, so removing it
    var theId = req.body._id;
    var theQuest = req.body.quest;
    mongoose.model('Step').findById(theId, function(err, stepToUpd) {
        console.log('to be updated on backend', stepToUpd);
        console.log('quest for this step: ',theQuest)
        if (stepToUpd === null) {
            //not found, create new. Dave speak. DAVE SMASH.
            mongoose.model('Step').create(req.body).then(function(err, notDoinAnythingWithThis) {
                mongoose.model('Step').find({
                    quest: theQuest
                }, function(err, respondy) {
                    //saved, so now return the updated list of steps!
                    res.send(respondy);
                });
            });
        } else if (stepToUpd !== null) {
            for (var updVal in req.body) {
                //loop thru all keys in object and replace with those from req.body.
                if (req.body.hasOwnProperty(updVal)) {
                    stepToUpd[updVal] = req.body[updVal];
                }
            }
            stepToUpd.save(function(err, notDoinAnythingWithThis) {
                mongoose.model('Step').find({
                    quest: theQuest
                }, function(err, respondy) {
                    //saved, so now return the updated list of steps!
                    res.send(respondy);
                });
            });
        }
    });
});