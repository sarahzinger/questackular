'use strict';
app.factory('QuestFactory', function($http){

	return {
		getAllQuests: function() {
			return $http.get('/api/quests').then(function(res) {
				return res.data;
			});
		},
		getCreatedQuestsByID: function(creatorID){
			return $http.get('/api/quests/creator/'+creatorID).then(function(res) {
				return res.data;
			});
		},
		getJoinedQuestsById: function(userID){
			return $http.get('/api/quests/participant/'+userID).then(function(res) {
				return res.data;
			});
		}

	};

});