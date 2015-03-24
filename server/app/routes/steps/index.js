'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.post('/save', function(req, res, next) {
    mongoose.model('Step').findOne({
        question: req.body.question,
        quest: req.body.quest
    }, function(err, step) {
        if (err) return next(err);
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

router.get('/list/:id',function(req,res){
    var questId = req.params.id;
    console.log('Quest: ',questId)
    mongoose.model('Step').find({quest:questId},function(err,steps){
        res.send(steps);
    })
})