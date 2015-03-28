app.config(function ($stateProvider) {
  $stateProvider.state('myQuests', {
    
    url: '/myQuests',
    templateUrl: 'js/application/states/myQuests/myQuests.html', 
    controller: 'MyQuestsCtrl'
    });
});


app.controller('MyQuestsCtrl', function ($scope, UserFactory, $state) {
  UserFactory.getUserInfo().then(function (userInfo) {
    console.log("userInfo", userInfo);
    var id = userInfo.user._id;
    UserFactory.getUserFromDb(id).then(function (dbUser) {
      console.log("user from DB", dbUser);
      $scope.user = dbUser;
      if (dbUser.participating.length) $scope.questsJoined = dbUser.participating;
      else $scope.noParticipatingQuests = "You haven't joined any quests yet."
      console.log("quest joined", $scope.questsJoined[0].questId);
    });
  });

  $scope.hello = "hello!";

  // $scope.leaveQuest = function (questId, userId) {
  //   // removes user from quest and quest from user in db
  //   // QuestFactory.leaveQuest(questId, userId); 
  //   UserFactory.getUserFromDb().then(function (user) {
  //     $scope.questsJoined = user.participating;
  //   });
  // };
  $scope.continueQuest = function(participatingIndex){
    localStorage.setItem("participatingIndex", participatingIndex);
    $state.go("step");
  };
});