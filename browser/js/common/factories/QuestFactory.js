'use strict';
app.factory('QuestFactory', function($http, AuthService) {
    return {
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get('/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get('/api/quests/' + questId).then(function(res) {
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post('/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete('/api/quests/participants/'+questId).then(function(response) {
                console.log(response);
            });
        },
        updateQuest: function(updatedQuest){
            return $http.put('/api/quests/:id',updatedQuest).then(function(res){
                return res.data;
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get('/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        sendStep: function(step) {
            //saves the quest
            return $http.post('/api/step', step).then(function(response) {
                return response.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get('/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(rem){
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.post('/api/step/rem/',rem).then(function(res){
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post('/api/step/upd',updatedStep).then(function(res){
                return res.data;
            });
        }
    };

});