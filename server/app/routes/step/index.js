'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.post('/save', function(req, res) {
    mongoose.model('Step').findOne({
            question: req.body.question,
            _id: req.body._id
        })
        .exec(function(err, question) {
            if (err) return res.json(err);
            if (question) return res.send("This 'Step' already exists");
            else {
                mongoose.model('Step').create(req.body).then(function(data) {
                    res.send('Saved!');
                });
            }
        });
});