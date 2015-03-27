'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('start', {
        resolve: {
           getLoggedInUser: function(AuthService, $state, $http){
           return AuthService.getLoggedInUser(true).then(function(user){
             if(user){
               $state.go('home');
             }
           });
           }

        },
        url: '/',
        templateUrl: 'js/start/start.html', 
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, $rootScope, AuthService, $state, AUTH_EVENTS, $window) {

    $scope.googleLogIn = function() {
        console.log("Redirecting to google log in");
        $window.location.href = "auth/google";
    };

    $scope.login = {};
    $scope.error = null;

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
        console.log("Login success");
        AuthService.getLoggedInUser().then(function (user) {
            console.log("what do we get in user?", user);
            $scope.user = user.user;
            console.log($scope.user);
        });
        $scope.loggedIn = true;
        // $scope.digest();
    });

    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
        console.log("Logout!");
        $scope.loggedIn = false;
        $scope.user = null;
    });
    
    $scope.logOut = function() {
        AuthService.logout();
    };

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});