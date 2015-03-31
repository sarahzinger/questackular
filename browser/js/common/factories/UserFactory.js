'use strict';
app.factory('UserFactory', function($http, AuthService) {
	return {
		getCurrentUser: function() {
			return AuthService.getLoggedInUser().then(function (user) {
				var currentUserId = user._id;
				console.log("currentUserId is", currentUserId);
	            return $http.get('api/users/' + currentUserId).then(function(response) {
	                return response.data;
	            });
			});
        },
        getUserById: function(userId){
			return $http.get('api/users/' + userId).then(function(response) {
	            return response.data;
	        });
        },
        getAllUsers: function() {
            return $http.get(domain + '/api/users').then(function (res) {
                console.log("getAllUsers factory $http.get response", res);
                return res.data;
            });
        }
	};
});