'use strict';
app.factory('saveQuest', function($http) {

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
        }
    };

});