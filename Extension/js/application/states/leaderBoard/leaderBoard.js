'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('leaderBoard', {
		url: '/leaderBoard',
		templateUrl: 'js/application/states/leaderBoard/leaderBoard.html', 
		controller: 'LeaderBoardCtrl'
	});
});


app.controller('LeaderBoardCtrl', function ($scope, UserFactory) {
	console.log("what is going on??");
	UserFactory.getAllUsers().then(function (users) {
		console.log("getAllUsers().then(response)", users);
		$scope.allUsers = users;
		$scope.sortedUsers = _.sortBy($scope.allUsers, 'points');
		console.log("sortedUsers", $scope.sortedUsers);
	});

});