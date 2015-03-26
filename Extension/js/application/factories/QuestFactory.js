'use strict';
app.factory('QuestFactory', function($http) {
    return {
        sendStep: function(step) {
            //saves the quest
            return $http.post('http://localhost:1337/api/step', step).then(function(response) {
                return response.data;
            });
        },
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('http://localhost:1337/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get('http://localhost:1337/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get('http://localhost:1337/api/quests/' + questId).then(function(res) {
                console.log("what we get back from getQuestById", res.data)
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post('http://localhost:1337/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete('http://localhost:1337/api/quests/participants/'+questId).then(function(response) {
                console.log(response);
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get('http://localhost:1337/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get('http://localhost:1337/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(id){
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.get('http://localhost:1337/api/step/rem/'+id).then(function(res){
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post('http://localhost:1337/api/step/upd',updatedStep).then(function(res){
                return res.data;
            });
        },
        changeCurrentStep: function(stepId){
            return $http.put('http://localhost:1337/participating/currentStep/'+stepId).then(function(res){
                return res.data;
            });
        }


    };

});