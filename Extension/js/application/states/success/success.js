'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('success', {
		url: '/success',
		templateUrl: 'js/application/states/success/success.html', 
		controller: 'SuccessCtrl'
	});
});


app.controller('SuccessCtrl', function ($scope, QuestFactory, UserFactory, $state,storeFactory) {
	$scope.allItems = [];
	$scope.userData = {};
	$scope.goodResps = ['Good Job!','Nice job!','Well done!','You got it!','That&rsquo;s it!'];
	$scope.yayMessage = 'Congrats. You broke our app.';
	$scope.pickSuccess = function(){
		var which = Math.floor(Math.random()*$scope.goodResps.length)
		$scope.yayMessage = $scope.goodResps[which];
	}
	$scope.pickSuccess();
	//initial setup: get products and current yoozr data
	storeFactory.getAllProds().then(function(data){
		$scope.allItems = data;
		storeFactory.getUserData().then(function(uData){
			$scope.userData = uData;
		});
	});
	$scope.buy = function(id,price){
		//got a target item and a target price, so check if we can buy
		var tempPoints = userData.pointsSpent + price;
		if (totalPoints.tempPoints>=0){
			//can afford;
			alert('You could buy this if our store worked!')
		} else{
			alert('You can\'t afford this yet!');
		}
	};
	$scope.continue = function(){
		$state.go('step');
	};
});