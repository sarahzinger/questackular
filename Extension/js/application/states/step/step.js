'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('step', {
		url: '/step',
		templateUrl: 'js/application/states/step/step.html', 
		controller: 'StepCtrl'
	});
});

app.controller('StepCtrl', function ($scope, QuestFactory, UserFactory, $state, chromeExtId) {
	console.log("chromeExtId", chromeExtId);
	$scope.alertshow = false;
	$scope.participatingIndex= Number(localStorage["participatingIndex"]);

	UserFactory.getUserInfo().then(function (unPopUser) {
		UserFactory.getUserFromDb(unPopUser.user._id).then(function (popUser){
			$scope.chosenQuest = popUser.participating[$scope.participatingIndex];

			$scope.step = popUser.participating[$scope.participatingIndex].currentStep;
			if($scope.step.qType == "Multiple Choice"){
				console.log("$scope.step",$scope.step)
				$scope.multipleChoice = true;
			}
		})
	});
	$scope.launchReading = function() {
		chrome.tabs.create({url: "http://"+$scope.step.url});
	}

	chrome.runtime.sendMessage({stepUrl: "http://www.google.com"}, function (response) {
		console.log("chrome.runtime.sendMessage response", response);
	});

	// chrome.runtime.sendMessage(string extensionId, any message, object options, function (res) {
	// 	console.log(res);
	// });
	// consider chrome.webRequest??
	

	$scope.submit = function() {
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		if($scope.step.qType == "Fill-in"){
			if($scope.userAnswer == $scope.step.fillIn){
				UserFactory.addPoints($scope.step._id).then(function(data){
					UserFactory.changeCurrentStep($scope.step._id);
                	$state.go('success');
				})
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}else{
			if($scope.selectedAnswer === $scope.step.multiAnsCor){
				UserFactory.addPoints($scope.step._id).then(function(data){
					UserFactory.changeCurrentStep($scope.step._id);
                	$state.go('success');
				})
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}
		
	};
	
});