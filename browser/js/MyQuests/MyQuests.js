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


app.controller('MyQuestsCtrl', function ($scope, QuestFactory, AuthService){
  AuthService.getLoggedInUser().then(function (user) {
    $scope.user = user;
    $scope.questsJoined = [];
    $scope.questsCreated = [];
    $scope.user.participating.forEach(function(questObj){
      var questID = questObj.questID;
      $scope.questsJoined.push(QuestFactory.getQuestById(questID));
    });
    $scope.user.created.forEach(function(questObj){
      var questID = questObj.questID;
      $scope.questsCreated.push(QuestFactory.getQuestById(questID));
    }); 
  });
});