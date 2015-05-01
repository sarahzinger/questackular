'use strict';


app.directive('navbar', function () {

    return {
        restrict: 'E',
        templateUrl: 'js/application/directives/navbar/navbar.html',
        controller: function($rootScope, UserFactory, $state, $scope){
            $rootScope.$on("updatePoints", function(){
                UserFactory.getTotalPoints().then(function(data){
                    console.log(data)
                    $rootScope.totalPoints = data;
                });
            });

            $scope.user = null;
            
            
            var getName = function(){
                UserFactory.getUserInfo().then(function (data) {
                    $scope.user = data.user;
                    $scope.loggedIn = true;
                });
                UserFactory.getTotalPoints().then(function (data) {
                    $rootScope.totalPoints = data;
                });
            };
            getName();

        }

    };

});
