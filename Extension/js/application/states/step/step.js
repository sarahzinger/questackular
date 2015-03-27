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
	//how do we keep track of the chosen Quest? Can we inject it somehow?
	//assuming we know what the Quest is....

	//Identify the user, and get the current step for that quest
	UserFactory.getPopulatedUser().then(function(data){
		//currently hard coding it to just access the first quest in participating
		//but maybe we can keep track of the current index
		$scope.chosenQuest = data.participating[0];
		$scope.stepId = data.participating[0].currentStep;
		console.log("step we send", $scope.stepId)
		QuestFactory.getStepById($scope.stepId).then(function(data){
			$scope.step = data
			console.log("whole step", data)
		})
		//once we get the stepId we need to get the full step object to display

	});
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		if($scope.step.qType == "Fill-in"){
			console.log("correct question type")
			if($scope.userAnswer == $scope.step.fillIn){
				// UserFactory.changeCurrentStep($scope.stepId);
				$state.go('success');
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}
		
	};
	
});