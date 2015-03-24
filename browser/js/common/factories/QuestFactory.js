'use strict';
app.factory('QuestFactory', function($http, AuthService) {
    return {
        sendStep: function(step) {
            //saves the quest
            return $http.post('/api/step/save', step).then(function(response) {
                return response.data;
            });
        },
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('/api/quests/save', quest).then(function(response) {
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
            console.log("questInfo", questInfo);
            return $http.post('/api/quests/' + questInfo._id, questInfo).then(function(response) {
                console.log(response);
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get('/api/quests/user/' + id).then(function(res) {
                return res.data;
            })
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get('/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        }
    };

});