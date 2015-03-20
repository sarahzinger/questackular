app.factory('userFactory', function($http){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then( function(res) {
				console.log("name from factory",res.data.user.google.name)
				return res.data;
   			});
		}
	}
})