'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');

router.put('/participating/currentStep/:id'), function(req, res, next){
  var stepId = req.params.id;
  //find the entire step object associated with the step id
  mongoose.model('Step').findOne({_id: stepId}, function(err, oldStepObject) {
    //find the stepNum of the current step object that we just found
        var oldStepNum = oldStepObject.stepNum;
        var currentQuest = oldStepObject.quest;
    //find the other steps associated with the quest of the oldStepObject    
    mongoose.model('Step').find({quest: oldStepObject.quest}, function(err, allStepsFromQuest) {
      allStepsFromQuest.forEach(function(step) {
        if(step.stepNum==oldStepNum+1) {
          var newCurrentStep = step;
          req.user.participating.forEach(function(quest) {
            if (quest.questId==currentQuest){
              quest.currentStep=newCurrentStep._id;
              req.user.save();
              res.json(newCurrentStep);
            }
          })
        }
      });
    })
  })
      //find the step with the old stepNum+1
        //set the currentStep for the user as this new stepNum

}
router.get('/:id', function(req, res, next) {
    console.log("in /users/req.params.id", req.params.id);
    mongoose.model('User').findOne({_id: req.params.id})
        .populate('created pastQuests participating')
        .exec(function (err, userInfo) {
            console.log("what's in there?", userInfo);
            if (err) return res.json(err);
            // if (userInfo.participating.length) {
	            mongoose.model('User').populate(userInfo, 'participating.questId', function (err, userFullyPopulated) {
	            	if (err) return res.json(err);
		    		res.json(userFullyPopulated);
	            });	
    		// }
    		// res.json(userInfo);

    		// MAYBE??? eventually we will need to do async stuff so that both "participating" and "pastQuests"
       //      async.parallel([
       //      	function(done) {
       //      		if (userInfo.participating.length) {
       //      			console.log("running participating");
			    //         mongoose.model('User').populate(userInfo, 'participating.questId', function (err, userI) {
			    //         	if (err) return res.json(err);
			    //         	console.log("ran participating");
			    //         });	
       //      		}
       //      		done();
       //      		console.log("not / after running participating.questid populate");
       //      	},
       //      	function(done) {
       //      		if (userInfo.pastQuests.length) {
       //      			console.log("running pastQuests");
			    //         mongoose.model('User').populate(userInfo, 'pastQuests.questId', function (err, singleUser) {
			    //         	if (err) return res.json(err);
			    //         	console.log("ran pastQuests");
			    //         });
       //      		}
       //      		done();
       //      		console.log("not / after running userinfo.questid populate");
       //      	}
 		   	// ], function(err, results) {
 		   	// 	console.log("success?", results);
 		   	// 	res.json(results);
 		   	// });
        });

});