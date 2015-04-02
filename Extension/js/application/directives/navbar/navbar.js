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
            })
            $scope.items = [{
                label: 'Create a Quest', state: 'create.quest' 
            }, {
                label: 'Join a Quest', state: 'home' 
            }, {
                label: 'My Quests', state: 'myQuests' 
            }];

            $scope.user = null;

            $scope.login = function() {
                window.open('questackular.herokuapp.com/auth/google', '_blank');
            };
            
            
            var getName = function(){
                UserFactory.getUserInfo().then(function(data){
                    $scope.user = data.user;
                    $scope.loggedIn = true;
                });
                UserFactory.getTotalPoints().then(function(data){
                    $rootScope.totalPoints = data;
                });
            };
            getName();

        }

    };

});
