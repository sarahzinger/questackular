'use strict';
app.factory('domain', function(){
    var domain = {};
    if(window.chrome && chrome.runtime && chrome.runtime.id){
        domain.path = "https://questackular.herokuapp.com";
    } else {
        domain.path = "";
    }
    return domain;
})

app.factory('QuestFactory', function($http, domain) {
    return {
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post(domain.path + '/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get(domain.path + '/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get(domain.path + '/api/quests/' + questId).then(function(res) {
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post(domain.path + '/api/quests/participants', questInfo).then(function(response) {
                return response.data;
            });
        },
        leaveQuest: function(questId) {
            return $http.delete(domain.path + '/api/quests/participants/' + questId).then(function(response) {
                return response.data;
            });
        },
        updateQuest: function(updatedQuest) {
            console.log("entering factory, with updatedQuest", updatedQuest)
            return $http.put(domain.path+'/api/quests/', updatedQuest).then(function(res) {
                return res.data;
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get(domain.path + '/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        sendStep: function(step) {
            //saves the quest
            return $http.post(domain.path + '/api/step', step).then(function(response) {
                return response.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get(domain.path + '/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(rem) {
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.post(domain.path + '/api/step/rem/', rem).then(function(res) {
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post(domain.path + '/api/step/upd', updatedStep).then(function(res) {
                return res.data;
            });
        },
        getStepById: function(stepId) {
            return $http.get(domain.path + '/api/step/' + stepId).then(function(res) {
                return res.data;
            });
        },
        saveStepIter: function(step,stepList) {
            console.log('Q type:', step.qtype)
            for (var r = 0; r < stepList.length; r++) {
                console.log('new Q: ', step.question, ', old Q:', stepList[r]);
                if (step.question === stepList[r].question) {
                    //err! question already exists!
                    bootbox.alert('This step already exists! You can\'t have the same step multiple times in the same quest!');
                    return false;
                }
            }
            if (step.qType === "Multiple Choice") {
                //pushing a multi-choice q to the list
                //so we need to parse all of the answer options
                step.multipleAns = [];
                for (var n = 1; n < 5; n++) {
                    step.multipleAns.push(step['ans' + n]);
                    delete step['ans' + n];
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
            angular.copy(angular.fromJson(sessionStorage.stepStr), stepList);
            return stepList;
        },
        completeQuest: function (questId) {
            return $http.put(domain.path + '/api/quests/participants', {questId:questId}).then(function (response) {
                return response.data;
            });
        },
        sendInvite: function(invitees, quest) {
            console.log("invitee received in sendInvite", invitees);
            console.log("quest received in sendInvite", quest);
            return $http.post(domain.path + '/api/quests/invite', {invitees: invitees, quest: quest}).then(function (response) {
                console.log("quest factory sendInvite response", response);
                return response.data;
            });
        }
    };

});