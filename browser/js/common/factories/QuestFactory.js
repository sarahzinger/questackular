'use strict';
app.factory('QuestFactory', function($http){

	return {
		getAllQuests: function() {
			return $http.get('api/quests/').then(function(res) {
				return res.data;
			});
		}

	};

});