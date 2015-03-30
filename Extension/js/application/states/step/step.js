'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('step', {
        url: '/step',
        templateUrl: 'js/application/states/step/step.html',
        controller: 'StepCtrl'
    });
});

app.controller('StepCtrl', function($scope, QuestFactory, UserFactory, $state, chromeExtId, $rootScope) {

    console.log("chromeExtId", chromeExtId);
    $scope.alertshow = false;
    $scope.participatingIndex = Number(localStorage["participatingIndex"]);
    console.log("$scope.participatingIndex", $scope.participatingIndex)
    if ($scope.participatingIndex === -1){
        $state.go("finish")
    }

	UserFactory.getUserInfo().then(function (unPopUser) {

		UserFactory.getUserFromDb(unPopUser.user._id).then(function (popUser){
			$scope.chosenQuest = popUser.participating[$scope.participatingIndex];
			QuestFactory.getStepListById($scope.chosenQuest.questId._id).then(function(steplist){
				$scope.totalStepNum = steplist.length
			})
			$scope.step = popUser.participating[$scope.participatingIndex].currentStep;
			if($scope.step.qType == "Multiple Choice"){
				$scope.multipleChoice = true;
			}
		})
	});
	$scope.launchReading = function() {
		chrome.tabs.create({url: "http://"+$scope.step.url});
	}


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
					$rootScope.$emit('updatePoints')
					if($scope.step.stepNum == $scope.totalStepNum){
                        console.log("this is totally the last step")
                        console.log("$scope.chosenQuest.questId._id", $scope.chosenQuest.questId._id)
                        QuestFactory.completeQuest($scope.chosenQuest.questId._id).then(function(data){
                            participatingIndex = -1
                            localStorage.setItem("participatingIndex", participatingIndex);
                            $state.go('finish');
                        });
						
					}else{
						UserFactory.changeCurrentStep($scope.step._id);
                		$state.go('success');
					}
					
				})
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}else{
			if(Number($scope.selectedAnswer) +1 === Number($scope.step.multiAnsCor)){
				UserFactory.addPoints($scope.step._id).then(function(data){
					$rootScope.$emit('updatePoints')
					if($scope.step.stepNum == $scope.totalStepNum){
                        QuestFactory.completeQuest($scope.chosenQuest.questId._id).then(function(data){
                            participatingIndex = -1;
                            localStorage.setItem("participatingIndex", participatingIndex);
                            $state.go('finish');
                        });
					}else{
						UserFactory.changeCurrentStep($scope.step._id);
                		$state.go('success');
					}
				})
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}
		
	};
	
    $scope.closeAlert = function() {
        $scope.alertshow = false;
    };

});