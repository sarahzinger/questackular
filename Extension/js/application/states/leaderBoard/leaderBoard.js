'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('leaderBoard', {
		url: '/leaderBoard',
		templateUrl: 'js/application/states/leaderBoard/leaderBoard.html', 
		controller: 'LeaderBoardCtrl'
	});
});


app.controller('LeaderBoardCtrl', function ($scope, UserFactory) {
	UserFactory.getAllUsers().then(function (users) {
		console.log("getAllUsers().then(response)", users);
		$scope.allUsers = users;
		$scope.sortedUsers = _.sortBy($scope.allUsers, 'totalPoints').reverse();
		console.log("sortedUsers", $scope.sortedUsers);
	});

});