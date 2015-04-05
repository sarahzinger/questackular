'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var request = require('request');

router.post('/', function (req, res) {
    mongoose.model('Link').create({
        title: req.body.title,
        url: req.body.url,
        highlighted: req.body.highlighted,
        owner: req.user._id
    }).then(function (createdLink) {
        console.log("createdLink", createdLink);
        res.json(createdLink);
    });
});

router.get('/', function (req, res) {
	console.log("req.user", req.user);
	mongoose.model('Link').find({owner: req.user._id}).exec(function (err, links) {
		console.log("err?", err);
		console.log("links", links);
		if (err) return res.json(err);
		res.json(links);
	});
});