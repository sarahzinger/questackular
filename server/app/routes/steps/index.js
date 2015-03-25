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

router.get('/list/:id',function(req,res){
    var questId = req.params.id;
    console.log('Quest: ',questId)
    mongoose.model('Step').find({quest:questId},function(err,steps){
        res.send(steps);
    });
});

router.get('/rem/:id',function(req,res){
    var stepToRemId = req.params.id;
    console.log('Oh no! You removed step id-'+stepToRemId);
    mongoose.model('Step').findByIdAndRemove(stepToRemId,function(err,step){
        res.send(step);
    });
});

router.post('/upd',function(req,res,next){
    //not sure if we can 'save' the id, so removing it
    var theId = req.body._id;
    delete req.body._id;

    mongoose.model('Step').findByIdAndUpdate(theId,req.body,function(err,updSt){
        res.send(updSt);
    });
});