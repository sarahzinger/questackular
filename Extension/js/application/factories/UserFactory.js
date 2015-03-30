app.factory('UserFactory', function($http, domain){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then(function (res) {
				return res.data;
   			});
		},
		getUserFromDb: function(userId) {
			console.log("userId", userId);
			return $http.get('http://localhost:1337/api/users/' + userId).then(function (dbUser) {
				console.log("dbUser", dbUser);
				return dbUser.data;
			});
		},
		changeCurrentStep: function(stepId) {
        	console.log("changeCurrentStep launched");
            return $http.put('http://localhost:1337/api/users/participating/currentStep/'+stepId).then(function (res){
                return res.data;
            });
        },
        addPoints: function(stepId) {
            console.log("stepId on the front end", stepId)
            return $http.put('http://localhost:1337/api/users/points/' + stepId).then(function (res) {
                return res.data;
            });
        },
        getTotalPoints: function() {
        	return $http.get('http://localhost:1337/api/users/points/').then(function (res){
        		return res.data;
        	})
        },
        getUserById: function(userId){
            return $http.get(domain + '/api/users/' + userId).then(function (response) {
                return response.data;
            });
        },
        getAllUsers: function() {
            return $http.get(domain + '/api/users').then(function (res) {
                console.log("getAllUsers factory $http.get response", res);
                return res.data;
            });
        }
	}
})