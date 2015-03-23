'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.post('/save', function(req, res, next) {
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
                    if (err){
                        console.log(err)
                    }else{
                        userObj.created.push(data._id);
                        userObj.save(); 
                    }
                })
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

router.get('/:id', function(req, res) {
    var questId = req.params.id;
    mongoose.model('Quest').find({_id: questId}).exec(function(err,quest) {
        if(err) res.send(err);
        res.json(quest);
    });
});
