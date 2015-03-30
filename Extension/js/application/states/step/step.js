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
			$scope.step = popUser.participating[$scope.participatingIndex].currentStep;
			if($scope.step.qType == "Multiple Choice"){
				console.log("$scope.step",$scope.step)
				$scope.multipleChoice = true;
			}
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
			console.log("is this logging at all though?")
			console.log("HELLO ANSWER?", $scope.selectedAnswer)
			console.log("multipleAns", $scope.step.multipleAns)
			console.log("$scope.step.multipleAnsCor", $scope.step.multipleAnsCor)
			if($scope.step.multipleAns[$scope.selectedAnswer] === $scope.step.multiAnsCor){
				console.log("trying to add points", $scope.step._id)
				UserFactory.addPoints($scope.step._id).then(function(data){
					console.log("back from adding points about to change step")
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