app.config(function ($stateProvider) {
  $stateProvider.state('profile', {
    
    url: '/profile',
    templateUrl: 'js/application/states/profile/profile.html', 
    controller: 'ProfileCtrl'
    });
});


app.controller('ProfileCtrl', function ($scope, UserFactory) {
  UserFactory.getUserInfo().then(function (userInfo) {
    console.log("userInfo", userInfo);
    var id = userInfo.user._id;
    // UserFactory.getUserFromDb(id).then(function (dbUser) {
    //   $scope.user = dbUser;
    //   $scope.questsJoined = dbUser.participating;
    // });
  });

  $scope.hello = "hello!";


});