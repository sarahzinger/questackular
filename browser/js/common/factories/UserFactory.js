'use strict';
app.factory('UserFactory', function($http, AuthService) {
	
	return {
		getCurrentUser: function() {
			return AuthService.getLoggedInUser().then(function (user) {
				var currentUserId = user._id;
				console.log("currentUserId is", currentUserId);
	            return $http.get('http://localhost:1337/api/users/' + currentUserId).then(function(response) {
	                return response.data;
	            });
			});
        }
	};
});