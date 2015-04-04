'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'js/application/states/home/home.html', 
    controller: 'HomeCtrl'
    });
});


app.controller('HomeCtrl', function ($scope) {
  $scope.states = [{
    state: "leaderBoard", title: "Leader Board", glyphicon: 'fa fa-graduation-cap'
  },
  {
    state: "profile", title: "Profile", glyphicon: 'fa fa-user'
  },
  {
    state: "join", title: "Join A Quest", glyphicon: 'fa fa-bicycle'
  },
  {
    state: "myQuests", title: "My Quests", glyphicon: 'fa fa-location-arrow'
  },
  {
    state: "step", title: "Continue Where I Left Off", glyphicon: 'fa-play-circle-o'
  }]; 
});