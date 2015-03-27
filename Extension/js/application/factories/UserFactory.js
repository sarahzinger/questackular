app.factory('UserFactory', function($http){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then( function(res) {
				return res.data;
   			});
		},
		getPopulatedUser: function() {
			return $http.get('http://localhost:1337/session').then(function(response) {
				var currentUserId = response.data.user._id;
				console.log("currentUserId is", currentUserId);
	            return $http.get('http://localhost:1337/api/users/' + currentUserId).then(function(response) {
	            	console.log("fully populated",response.data);
	                return response.data;
	            });
			});
        },
        changeCurrentStep: function(stepId){
        	console.log("changeCurrentStep launched");
            return $http.put('http://localhost:1337/api/users/participating/currentStep/'+stepId).then(function(res){
                return res.data;
            });
        }
	}
})