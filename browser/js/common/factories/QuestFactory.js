'use strict';
app.value('domain', 'http://localhost:1337');

app.factory('QuestFactory', function($http, domain) {
    console.log("domain");
    return {
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post(domain + '/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get(domain + '/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get(domain + '/api/quests/' + questId).then(function(res) {
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post(domain + '/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete(domain + '/api/quests/participants/' + questId).then(function(response) {
                console.log(response);
            });
        },
        updateQuest: function(updatedQuest) {
            return $http.put('/api/quests/:id', updatedQuest).then(function(res) {
                return res.data;
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get(domain + '/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        sendStep: function(step) {
            //saves the quest
            return $http.post(domain + '/api/step', step).then(function(response) {
                return response.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get(domain + '/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(rem) {
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.post(domain + '/api/step/rem/', rem).then(function(res) {
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post(domain + '/api/step/upd', updatedStep).then(function(res) {
                return res.data;
            });
        },
        getStepById: function(stepId) {
            return $http.get(domain + '/api/step/' + stepId).then(function(res) {
                console.log("this is the step being returned from the factory", res.data)
                return res.data;
            });
        },
        saveStepIter: function(step,stepList) {
            for (var r = 0; r < stepList.length; r++) {
                console.log('new Q: ', step.question, ', old Q:', stepList[r]);
                if (step.question === stepList[r].question) {
                    //err! question already exists!
                    alert('This step already exists! You can\'t have the same step multiple times in the same quest!');
                    return false;
                }
            }
            if (step.qType === "Multiple Choice") {
                //pushing a multi-choice q to the list
                //so we need to parse all of the answer options
                step.multipleAns = [];
                for (var n = 1; n < 5; n++) {
                    console.log(step['ans' + n]);
                    step.multipleAns.push(step['ans' + n]);
                    delete step['ans' + n];
                    console.log('multiAns so far: ', step.multiAns);
                }
            }

            //give each step a number to go by.
            step.stepNum = stepList.length + 1;
            step.quest = 'NONE'; //this will get replaced once we save the parent quest and retrieve its ID.

            var seshObj = [];
            // var stepsJson = angular.toJson(newStep);

            if (sessionStorage.stepStr) {
                //this quest has steps, so before we push, we need to get those from the ss.stepStr var
                seshObj = angular.fromJson(sessionStorage.stepStr);
            }
            seshObj.push(step);
            angular.copy(seshObj, stepList);
            sessionStorage.stepStr = angular.toJson(seshObj);

            console.log("sessionStorage.stepStr currently has: ", sessionStorage.stepStr);

            angular.copy(angular.fromJson(sessionStorage.stepStr), stepList);
            return stepList;
        }
    };

});