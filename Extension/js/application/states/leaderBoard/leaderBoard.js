'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('leaderBoard', {
		url: '/leaderBoard',
		templateUrl: 'js/application/states/leaderBoard/leaderBoard.html', 
		controller: 'LeaderBoardCtrl'
	});
});


app.controller('LeaderBoardCtrl', function ($scope, UserFactory) {
	var n = 20 // get number of users from db;
	$scope.lb = {};
	// $scope.lb.rankNums = [];
	// for (var i = 1; i <= n; i++) {
	// 	$scope.rankNums.push(i);
	// }

	UserFactory.getAllUsers().then(function (users) {
		console.log("getAllUsers().then(response)", users);
		$scope.allUsers = users;
		$scope.sortedUsers = _.sortBy($scope.allUsers, 'points');
		console.log("sortedUsers", $scope.sortedUsers);
	});

});