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
        var itemId = req.body.itemId;
        var itemCost = req.body.price;

        mongoose.model('User').findOne({
            _id: req.user.id
        }, function(err, user) {
            if (!user.itemsBought){
                user.itemsBought=[];
            }
            if (!user.pointsSpent){
                user.pointsSpent=0;
            }
            user.itemsBought.push(itemId);
            user.pointsSpent += itemCost;
            console.log('User after purchase:',user);
            user.save().then(function(err, resp) {
                var userStoreData = {
                    spent: req.user.pointsSpent,
                    owned: req.user.itemsBought,
                    total: req.user.totalPoints
                };
                //resend store data, since we've updated stuff and things.
                res.send(userStoreData);
            });
        });
    });
    // when a user "leaves" a quest