'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.post('/save', function(req, res) {

    mongoose.model('Step').findOne({
            question: req.body.step.question
        })
        .exec(function(err, question) {
            if (err) return res.json(err);
            if (question) return res.send("This 'Step' already exists");
            else {
                mongoose.model('Step').create(req.body.step, function(err, data) {
                    if (err) return res.json(err);
                    res.send('saved question ' + data.question);
                });
            }
        });

});