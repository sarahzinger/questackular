app.config(function ($stateProvider) {
  $stateProvider.state('MyQuests', {
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
    url: '/MyQuests',
    templateUrl: 'js/MyQuests/MyQuests.html', 
    controller: 'MyQuestsCtrl'
    });
});


app.controller('MyQuestsCtrl', function ($scope, UserFactory, AuthService){
  // console.log("UserFactory.getCurrentUser()", UserFactory.getCurrentUser());
  UserFactory.getCurrentUser().then(function (user) {
    $scope.questsCreated = user.created;
    $scope.questsJoined = user.participating;
    $scope.questsCompleted = user.pastQuests;
  });
});