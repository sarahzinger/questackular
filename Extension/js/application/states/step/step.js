'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('step', {
        url: '/step',
        templateUrl: 'js/application/states/step/step.html',
        controller: 'StepCtrl'
    });
});

app.controller('StepCtrl', function($scope, QuestFactory, UserFactory, $state, chromeExtId, $rootScope) {

    $scope.participatingIndex = Number(localStorage["participatingIndex"]);
    console.log("$scope.participatingIndex", $scope.participatingIndex)
    if ($scope.participatingIndex === -1) {
        $state.go("finish")
    }

	UserFactory.getUserInfo().then(function (unPopUser) {
		UserFactory.getUserFromDb(unPopUser.user._id).then(function (popUser){
			$scope.chosenQuest = popUser.participating[$scope.participatingIndex];
			console.log("$scope.chosenQuest", $scope.chosenQuest);
			QuestFactory.getStepListById($scope.chosenQuest.questId._id).then(function (steplist) {
				$scope.totalStepNum = steplist.length;
				$scope.step = popUser.participating[$scope.participatingIndex].currentStep;
                if (typeof $scope.step == "undefined") {
                    bootbox.alert("This quest has no steps! Please go back to 'my quests' to select a quest that has steps!", function (response) {
                        console.log("response", response);
                    });
                } else {
    				console.log("$scope.step", $scope.step);

                    if ($scope.step.url.indexOf("http://") == -1 && $scope.step.url.indexOf("https://") == -1) {
                        $scope.step.url = "http://" + $scope.step.url
                    }
                    console.log("$scope.step.url ", $scope.step.url);
    				chrome.runtime.sendMessage(chromeExtId, {stepUrl: $scope.step.url }, function (response) {
    					console.log("chrome.runtime.sendMessage response", response.hello);
    				});
    				$scope.userQuestPts = $scope.chosenQuest.pointsFromQuest;

    				$scope.progressPct = ($scope.step.stepNum / $scope.totalStepNum) * 100;
    				if ($scope.progressPct < 25) {
    			    	$scope.progressType = 'danger';
    			    } else if ($scope.progressPct < 50) {
    			    	$scope.progressType = 'warning';
    			    } else if ($scope.progressPct < 75) {
    			    	$scope.progressType = 'info';
    			    } else {
    			    	$scope.progressType = 'success';
    			    }

    				if ($scope.step.qType == "Multiple Choice") {
    					console.log("multipleChoice");
    					$scope.multipleChoice = true;
    				}
                    
                }
			});
		});
	});


	$scope.submit = function() {
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		if ($scope.step.qType === "Fill-in") {
			if ($scope.userAnswer == $scope.step.fillIn) {
				UserFactory.addPoints($scope.step._id).then(function (userAddPtsData) {
					$rootScope.$emit('updatePoints')

					if($scope.step.stepNum == $scope.totalStepNum) {
                        console.log("this is totally the last step")
                        console.log("$scope.chosenQuest.questId._id", $scope.chosenQuest.questId._id)
                        QuestFactory.completeQuest($scope.chosenQuest.questId._id).then(function(data) {
                            participatingIndex = -1
                            localStorage.setItem("participatingIndex", participatingIndex);
                            $state.go('finish');
                        });


                    } else {
                        UserFactory.changeCurrentStep($scope.step._id);
                        $state.go('success');
                    }

                })
            } else {
                //else it will alert user to try again
                // $scope.alertshow = true;
                bootbox.alert('Try Again');
            }
        } else {
            if (Number($scope.selectedAnswer) + 1 === Number($scope.step.multiAnsCor)) {
                UserFactory.addPoints($scope.step._id).then(function(userAddPtsData) {
                    $rootScope.$emit('updatePoints')
                    if ($scope.step.stepNum === $scope.totalStepNum) {
                        QuestFactory.completeQuest($scope.chosenQuest.questId._id).then(function(data) {
                            console.log("inside!")
                            participatingIndex = -1;
                            localStorage.setItem("participatingIndex", participatingIndex);
                            $state.go('finish');
                        });
                    } else {
                        UserFactory.changeCurrentStep($scope.step._id);
                        $state.go('success');
                    }
                })
            } else {
                //else it will alert user to try again
                // $scope.alertshow = true;
                bootbox.alert('Try Again')
            }
        }

    };

    $scope.closeAlert = function() {
        $scope.alertshow = false;
    };

    $scope.giveUp = function(num) {
        bootbox.confirm("Are you sure you wanna give up? That'll cost " + num + " points!", function(purch) {
            if (purch) {
                $scope.purchStep();
            }
        })
    };
    $scope.purchStep = function() {
        UserFactory.buyStep($scope.step._id).then(function(data) {
            $rootScope.$emit('updatePoints')
            if ($scope.step.stepNum == $scope.totalStepNum) {
                console.log("this is totally the last step")
                console.log("$scope.chosenQuest.questId._id", $scope.chosenQuest.questId._id)
                QuestFactory.completeQuest($scope.chosenQuest.questId._id).then(function(data) {
                    participatingIndex = -1
                    localStorage.setItem("participatingIndex", participatingIndex);
                    $state.go('finish');
                });

            } else {
                UserFactory.changeCurrentStep($scope.step._id);
                $state.go('success');
            }

        })
    }

});