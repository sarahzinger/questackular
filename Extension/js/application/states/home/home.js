'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    resolve: {
      getLoggedInUser: function(UserFactory, $state, $http){
        return UserFactory.getUserInfo().then(function(user){
          if (user) {
            return user;
          } else {
            $state.go("home");
          }
        });
      }
    },
    url: '/home',
    templateUrl: 'js/application/states/home/home.html', 
    controller: 'HomeCtrl'
    });
});


app.controller('HomeCtrl', function ($scope  ){

});