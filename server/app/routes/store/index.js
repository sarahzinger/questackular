'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

router.get('/', function(req, res, next) {
    //gets all available items (ever created)
    mongoose.model('Item').find({}, function(err, items) {
        res.send(items);
    });
});

router.get('/userData/', function(req, res, next) {
    //get user's data
    var id = req.params.id;
    var userStoreData = {
        spent: req.user.pointsSpent || 0,
        owned: req.user.itemsBought || [],
        total: req.user.totalPoints
    };
    res.send(userStoreData);
});

router.post('/buy/', function(req, res, next) {
    console.log("buy is called")
    console.log("req.body", req.body);
    console.log("req.user", req.user)
    var itemId = req.body.itemId;
    var itemCost = req.body.price;
    if (!req.user.itemsBought) {
        req.user.itemsBought = [];
    }
    if (!req.user.pointsSpent) {
        req.user.pointsSpent = 0;
    }
    console.log(chalk.bgGreen.black('$ (1) $')+'x'+itemCost);
    req.user.itemsBought.push(itemId);
    req.user.pointsSpent += itemCost;
    console.log("req.user.pointsSpent", req.user.pointsSpent)
    req.user.save(function(err, resp) {
        console.log("resp", resp);
        var userStoreData = {
            spent: req.user.pointsSpent,
            owned: req.user.itemsBought,
            total: req.user.totalPoints
        };
        //resend store data, since we've updated stuff and things.
        res.send(userStoreData);
    });
});
// when a user "leaves" a quest
//save: