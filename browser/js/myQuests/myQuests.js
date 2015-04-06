app.config(function ($stateProvider) {
  $stateProvider.state('myQuests', {
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
    url: '/myQuests',
    templateUrl: 'js/myQuests/myQuests.html', 
    controller: 'MyQuestsCtrl'
    });
});

app.controller('MyQuestsCtrl', function ($scope, UserFactory, QuestFactory) {
  UserFactory.getCurrentUser().then(function (user) {
    $scope.user = user;
    $scope.userId = user._id;
    $scope.questsCreated = user.created;
    $scope.questsJoined = user.participating;
    if ($scope.questsJoined.length) {
      $scope.questsJoined.forEach(function (i) {
        i.questId.cat = i.questId.cat 
        i.questId.questImage = i.questId.img || i.questId.cat.url;
      });
    }
    $scope.questsCompleted = user.pastQuests;
  });

  $scope.leaveQuest = function (questId, userId) {
    // removes user from quest and quest from user in db
    console.log("before leavequest api called");
    console.log("questId", questId);
    console.log("userId", userId);
    QuestFactory.leaveQuest(questId, userId); 
    UserFactory.getCurrentUser().then(function (user) {
      console.log(user);
      $scope.questsJoined = user.participating;
      if ($scope.questsJoined.length) {
        $scope.questsJoined.forEach(function (i) {
          i.questId.cat = i.questId.cat 
          i.questId.questImage = i.questId.img || i.questId.cat.url;
        });
      }
    });
  };

  $scope.searchBox = false;
  $scope.search = function() {
    if (!$scope.searchBox) $scope.searchBox = true;
    else $scope.searchBox = false;
  };

});