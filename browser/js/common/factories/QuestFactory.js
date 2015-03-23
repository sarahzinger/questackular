'use strict';
app.factory('QuestFactory', function($http, AuthService){
	return {
		getAllQuests: function() {
			return $http.get('/api/quests').then(function(res) {
				return res.data;
			});
		},
		getQuestById: function(questID){
			return $http.get('/api/quests/:id').then(function(res) {
				return res.data;
			});
		},
		joinQuest: function (questInfo) {
			console.log("questInfo", questInfo);
			return $http.post('/api/quests/' + questInfo._id, questInfo).then(function (response) {
				console.log(response);
			});
		}
	};

});