app.config(function ($stateProvider) {
  $stateProvider.state('pastQuests', {
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
    url: '/pastQuests',
    templateUrl: 'js/pastQuests/pastQuests.html', 
    controller: 'PastQuestsCtrl'
    });
});


app.controller('PastQuestsCtrl', function ($scope, UserFactory, QuestFactory){
  UserFactory.getCurrentUser().then(function (user) {
    $scope.user = user;
    $scope.questsCompleted = user.pastQuests;
    
    $scope.questsCompleted.forEach(function(quest, idx, array){
      $scope.questsCompleted[idx].allSteps = [];
      QuestFactory.getStepListById(quest.questId._id).then(function(steps){
        $scope.questsCompleted[idx].allSteps =steps ;

      })
    });
  });
});