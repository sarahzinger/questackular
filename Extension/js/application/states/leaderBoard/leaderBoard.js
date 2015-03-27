'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('leaderBoard', {
		url: '/leaderBoard',
		templateUrl: 'js/application/states/leaderBoard/leaderBoard.html', 
		controller: 'LeaderBoardCtrl'
	});
});


app.controller('LeaderBoardCtrl', function ($scope) {
	var n = 20 // get number of users from db;
	$scope.lb = {};
	$scope.lb.rankNums = [];
	for (var i = 1; i <= n; i++) {
		$scope.rankNums.push(i);
	}

});