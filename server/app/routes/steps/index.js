'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.post('/', function(req, res, next) {
    mongoose.model('Step').findOne({
        question: req.body.question,
        quest: req.body.quest
    }, function(err, step) {
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

router.get('/list/:id', function(req, res) {
    var questId = req.params.id;
    console.log('Quest: ', questId)
    mongoose.model('Step').find({
        quest: questId
    }, function(err, steps) {
        res.send(steps);
    });
});

router.post('/rem/', function(req, res) {
    //rem: its the end of the step as we know it, and i feel fine
    var stepToRemId = req.body.id;
    var stepToRenumQ = req.body.quest;
    console.log('Oh no! You removed step id-' + stepToRemId);
    mongoose.model('Step').findByIdAndRemove(stepToRemId, function(err, step) {
        //removed step. Now renumber the other steps. First find them
        mongoose.model('Step').find({
            quest: stepToRenumQ
        }, function(err, stepsToRename) {
            //loop thru all remaining steps and renumber them sequentially.
            for (var i=0;i<stepsToRename.length;i++){
                stepsToRename.stepNum = i;
                stepsToRename.save();
            }
            res.send(step);
        });
    });
});

router.post('/upd', function(req, res, next) {
    //not sure if we can 'save' the id, so removing it
    var theId = req.body._id;
    delete req.body._id;

    mongoose.model('Step').findByIdAndUpdate(theId, req.body, function(err, updSt) {
        res.send(updSt);
    });
});