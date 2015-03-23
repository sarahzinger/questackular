'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('thanks', {
        resolve: {
            getLoggedInUser: function(AuthService, $state, $http) {
                return AuthService.getLoggedInUser(true).then(function(user) {
                    if (user) {
                        return user;
                    } else {
                        $state.go("start");
                    }
                });
            }
        },
        url: '/thanks',
        templateUrl: 'js/thanks/thanks.html',
        controller: 'thanksCtrl'
    });
});


app.controller('thanksCtrl', function($scope) {
    $scope.quest = angular.fromJson(sessionStorage.newQuest);
    $scope.steps = angular.fromJson(sessionStorage.stepStr);
    // sessionStorage.removeItem('newQuest');
    // sessionStorage.removeItem('stepStr');
    console.log('Quest Obj', $scope.quest);
    console.log('Steps Obj', $scope.steps);
    //this gets the 
});