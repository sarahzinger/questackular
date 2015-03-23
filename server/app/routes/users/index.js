'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');

router.get('/:id', function(req, res, next) {
    console.log("in /users/req.params.id", req.params.id);
    mongoose.model('User').findOne({_id: req.params.id})
        .populate('created participating pastQuests')
        .exec(function (err, data) {
            console.log("what's in there?", data);
            res.json(data);
        });
});