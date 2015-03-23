app.config(function ($stateProvider) {

    $stateProvider.state('embark', {
    	resolve: {
                getLoggedInUser: function(AuthService, $state, $http){
                    return AuthService.getLoggedInUser(true).then(function(user){
                        if(user){
                            return user;
                        }else{
                            $state.go("start");
                        }
                    });
                }
            },
        url: '/embark',
        templateUrl: 'js/embark/embark.html',
        controller: 'EmbarkCtrl'
    });

});


app.controller('EmbarkCtrl', function ($scope){
	$scope.quests = [{title:"Title of Quest", description: "This would be the description, eventually this will come from the model"}]
});
