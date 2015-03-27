'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('step', {
    url: '/step',
    templateUrl: 'js/application/states/step/step.html', 
    controller: 'StepCtrl'
    });
});


app.controller('StepCtrl', function ($scope, QuestFactory, UserFactory) {
	UserFactory.getUserInfo().then(function(user){
		$scope.user = user.user;
		QuestFactory.getStepListById("551482a559c52ae8cd292232").then(function(steps){
			steps.forEach(function(step){
				if($scope.user.participating[1].currentStep == step._id){
					$scope.step = step
				}
			})
		});
	})
	QuestFactory.getQuestById("551482a559c52ae8cd292232").then(function(data){
		$scope.quest = data;
	});
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		//else it will alert user to try again
		console.log("step Id we are sending", $scope.step._id)
		QuestFactory.changeCurrentStep($scope.step._id);
	}
	
});