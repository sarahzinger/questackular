'use strict';
app.factory('QuestFactory', function($http){

	return {
		getAllQuests: function() {
			return $http.get('/quests').then(function(res) {
				return res.data;
			});
		}

	};

});