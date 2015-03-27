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
    state: "leaderBoard", title: "Leader Board"
  },
  {
    state: "profile", title: "Profile"
  },
  {
    state: "join", title: "Join A Quest"
  },
  {
    state: "myQuests", title: "My Quests"
  },
  {
    state: "step", title: "Temporary Step Button"
  }];

});