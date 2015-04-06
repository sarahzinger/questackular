'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    // resolve: {
    //   getLoggedInUser: function(AuthService, $state, $http){
    //     return AuthService.getLoggedInUser(true).then(function(user){
    //       if(user){
    //         return user;
    //       }else{
    //         $state.go("start");
    //       }
    //     });
    //   }
    // },
    url: '/home',
    templateUrl: 'js/home/home.html', 
    controller: 'HomeCtrl'
    });
});


app.controller('HomeCtrl', function ($scope  ){

});