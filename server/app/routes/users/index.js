'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');


router.get('/points/', function(req, res, next) {
    if (req.user) {
        var total = req.user.totalPoints;
        res.json(total);
    } else {
        res.send("nope")
    }
});

router.put('/points/:id', function(req, res, next) {
    console.log("trying to add points on the backend right now");
    var stepId = req.params.id;
    console.log("stepId", stepId);
    //get the step object to get point worth
    mongoose.model('Step').findOne({
        _id: stepId
    }, function(err, stepObject) {
        console.log('found the step', stepObject);
        var points = stepObject.pointValue;
        //find the quest in req.user which has a current step that matches our stepid
        req.user.participating.forEach(function(quest, idx, arr) {
            if (quest.currentStep == stepId) {
                //push the new point worth to pointsfromQuest on the participating array in users
                console.log("BEFORE quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest);
                console.log("points we are trying to add", points);
                req.user.participating[idx].pointsFromQuest += points;
                console.log("After quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest);
                req.user.save(function(err, updatedUser) {
                    console.log("updatedUser", updatedUser);
                    res.json(updatedUser.participating[idx].pointsFromQuest);
                });
            }
        });
    });

});

router.put('/participating/currentStep/:id', function(req, res, next) {
    var stepId = req.params.id;
    //find the entire step object associated with the step id
    mongoose.model('Step').findOne({
        _id: stepId
    }, function(err, oldStepObject) {
        //find the stepNum of the current step object that we just found

        var oldStepNum = oldStepObject.stepNum;
        var currentQuest = oldStepObject.quest;
        //find the other steps associated with the quest of the oldStepObject    
        mongoose.model('Step').find({
            quest: oldStepObject.quest
        }, function(err, allStepsFromQuest) {

            allStepsFromQuest.forEach(function(step) {
                if (step.stepNum == oldStepNum + 1) {
                    var newCurrentStep = step;
                    req.user.participating.forEach(function(quest) {
                        if (String(quest.questId) === String(currentQuest)) {
                            quest.currentStep = newCurrentStep._id;
                            req.user.save();
                            res.json(newCurrentStep);
                        }
                    });
                }
            });
        });
    });
});

router.get('/', function(req, res, next) {
    mongoose.model('User').find().populate('created participating pastQuests').exec(function(err, users) {
        if (err) return res.json(err);
        mongoose.model('User').populate(users, 'participating.questId participating.currentStep pastQuests.questId', function(err, populatedUsers) {
            if (err) return res.json(err);
            console.log("populated users", populatedUsers);
            populatedUsers.forEach(function(user) {
                user.toJSON();
            });
            console.log("populatedUsers", populatedUsers);
            res.json(populatedUsers);
        });
    });
});

router.get('/:id', function(req, res, next) {
    mongoose.model('User').findOne({
            _id: req.params.id
        })
        .populate('created participating pastQuests')
        .exec(function(err, userInfo) {
            if (err) return res.json(err);
            // if (userInfo.participating.length) {
            mongoose.model('User').populate(userInfo, 'participating.questId participating.currentStep pastQuests.questId', function(err, userFullyPopulated) {
                if (err) return res.json(err);
                console.log('STEPS THINGS', userFullyPopulated)
                res.json(userFullyPopulated);
            });
            
        });

});

router.put('/purchase/:id', function(req, res, next) {
    /*this router will SUBTRACT the current points of the inputted step (from front end)
    It will then continue the user to the next step. Essentially, only dif btwn this and 
    answering a q correctly is that this subs pts, whereas that adds em.
    */
    
    var stepId = req.params.id;
    console.log("in the backend purchasing a step and we caught a stepid", stepId)
    //get the step object to get point worth
    mongoose.model('Step').findOne({
        _id: stepId
    }, function(err, stepObject) {
        console.log("found a stepObject to take points from", stepObject)
        var points = stepObject.pointValue;
        console.log("these are the points we are adding to the user", points)
        //commented this out because we dont actually subtract from the quest: we just dont add
        //find the quest in req.user which has a current step that matches our stepid
        // req.user.participating.forEach(function(quest, idx, arr) {

        //     if (quest.currentStep == stepId) {
        //         //push the new point worth to pointsfromQuest on the participating array in users
        //         console.log("BEFORE quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest);
        //         console.log("points we are trying to remove", points);
        //         req.user.participating[idx].pointsFromQuest -= points;
        //         
        //         console.log("After quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest);
        //         req.user.save(function(afterSave) {
        //             res.end();
        //         });
        //     }
        // });
        console.log("**req.user", req.user);
        if(!req.user.pointsSpent){
            console.log("pointsSpent is zero");
            req.user.pointsSpent = 0;
        }
        req.user.pointsSpent += points;
        req.user.save(function(err, resp) {
            res.end();
        });
    });
})
