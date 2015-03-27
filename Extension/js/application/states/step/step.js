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
// 	angular.value to store index
// or localStorage?

// say you get participating 'index', and step id:
// var place = {
// 	index:index,
// 	stepId: stepId
// }
// localStorage.myPlace = angular.toJson(place)

	UserFactory.getUserInfo().then(function(unPopUser){
		UserFactory.getUserFromDb(unPopUser.user._id).then(function(popUser){
			$scope.chosenQuest = popUser.participating[0];
			$scope.stepId = popUser.participating[0].currentStep;
		// 	console.log("step we send", $scope.stepId)
			QuestFactory.getStepById($scope.stepId).then(function(data){
				$scope.step = data
			})
		})
	});
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