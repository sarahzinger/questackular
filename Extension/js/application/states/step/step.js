'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('step', {
		url: '/step',
		templateUrl: 'js/application/states/step/step.html', 
		controller: 'StepCtrl'
	});
});


app.controller('StepCtrl', function ($scope, QuestFactory, UserFactory, $state) {
	$scope.alertshow = false;

	$scope.participatingIndex= Number(localStorage["participatingIndex"]);

	UserFactory.getUserInfo().then(function(unPopUser){
		UserFactory.getUserFromDb(unPopUser.user._id).then(function(popUser){
			$scope.chosenQuest = popUser.participating[$scope.participatingIndex];
			$scope.stepId = popUser.participating[$scope.participatingIndex].currentStep;
		// 	console.log("step we send", $scope.stepId)
			QuestFactory.getStepById($scope.stepId).then(function(data){
				$scope.step = data;
			})
		})
	});
	$scope.launchReading = function(){
		chrome.tabs.create({url: "http://"+$scope.step.url});
	}
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		if($scope.step.qType == "Fill-in"){
			console.log("correct question type")
			if($scope.userAnswer == $scope.step.fillIn){
				UserFactory.changeCurrentStep($scope.stepId);
				$state.go('success');
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}
		
	};
	
});