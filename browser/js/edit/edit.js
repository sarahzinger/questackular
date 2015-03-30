'use strict';
app.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
app.config(function ($stateProvider) {
    $stateProvider.state('edit', {
            resolve: {
                getLoggedInUser: function(AuthService, $state, $http) {
                    return AuthService.getLoggedInUser(true).then(function(user) {
                        if (user) {
                            return user;
                        } else {
                            $state.go("start");
                        }
                    });
                }
            },
            abstract: true,
            url: '/edit',
            templateUrl: 'js/edit/edit.html',
            controller: 'editCtrl'
        })
        .state('edit.quest', {
            url: '/quest',
            templateUrl: 'js/edit/editQuest.html',
            controller: 'editQuest'
        })
        .state('edit.step', {
            url: '/step',
            templateUrl: 'js/edit/editStep.html',
            controller: 'editStep'
        })
        .state('edit.map', {
            url: '/map',
            templateUrl: 'js/edit/editMap.html',
            controller: 'editQuestMap'
        });
});


app.controller('editCtrl', function ($scope, QuestFactory, AuthService, $state) {
    //remove session storage in case there's anything stored from /create or watever
    sessionStorage.removeItem('stepStr');
    sessionStorage.removeItem('newQuest');
    $scope.alerts = [{
        type: 'alert-danger',
        msg: 'Warning: This active quest currently has participants! Deactivating it will destroy their hard work! Are you sure you wanna make enemies like this? If not, you may wanna activate it!',
        show: false
    }, {
        type: 'alert-danger',
        msg: 'Warning: Activating a deactive quest will make it uneditable (unless you close it again). Is your quest awesome enough to activate yet? If not, you may wanna deactivate it!',
        show: false
    }, {
        type: 'alert-danger',
        msg: 'Warning: This active quest currently does not seem to have any participants. However, deactivating it will make it unplayable to your adoring fanbase! Make sure you only deactivate a quest that you need to work on!',
        show: false
    }];
    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.questList = [];
    $scope.quest = {}; //curent quest object
    $scope.stepList = []; //list of current steps.
    $scope.stepsToRemove = []; //when we run our save function, we loop thru this and 
    //remove any steps on this list.
    $scope.questPicked = false;
    $scope.selectedQuest = {};
    $scope.addForm = false;
    $scope.tabs = [{
        label: "Edit Quest",
        state: "edit.quest"
    }, {
        label: "Edit Step",
        state: "edit.step",
        disabled: $scope.noQuest
    }, {
        label: "View Map",
        state: "edit.map",
        disabled: $scope.noQuest
    }];
    AuthService.getLoggedInUser().then(function(user) {

        //save the quest
        QuestFactory.getQuestsByUser(user._id).then(function(questList) {
            $scope.questList = questList;
            console.log(questList);
            $scope.selectedQuest = $scope.questList[0];
        });
    });
    $scope.saveFullQuest = function() {
        //this will save the full quest.
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            if (!confirm('(\u0CA0_\u0CA0) This quest has no steps! Are you sure you want to save it?')) {
                return; //user canceled save
            }
        }
        //parse and readjust quest
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.pubPriv;
        //final-presave stuff: get the current user ID
        AuthService.getLoggedInUser().then(function(user) {
            $scope.quest.owner = user._id;
            //save the quest
            QuestFactory.updateQuest($scope.quest).then(function(questId) {
                console.log('quest item:', questId);
                $scope.stepsToRemove.forEach(function(remItem) {
                    QuestFactory.remStep(remItem).then(function(data) {
                        angular.copy(data, $scope.stepList);
                    });
                });

                $scope.stepList.forEach(function(item) {
                    item.quest = questId;
                    //modify clues and tags.
                    if (item.clueStr) {
                        //step has clues to parse. 
                        item.clues = clueStr.split(',');
                        delete item.clueStr;
                    }
                    if (item.tagStr) {
                        //step has tags to parse. parse dem tagz
                        item.tags = item.tagStr.split(',');
                        delete item.clueStr;
                    }
                    //save this step
                    QuestFactory.updateStep(item).then(function(data) {
                        angular.copy(data, $scope.stepList);
                    });
                });
                //yes, this is and the above foreach are asynchronous, but the completion of the save does not depend upon the removal of stepsToRemove quest (or vice-versa)
                $scope.stepsToRemove = [];
            });
        });
    };
    $scope.pickQuest = function(id) {
        //this needs to get a quest by id and then get its associated steps
        $scope.questPicked = true;
        for (var n = 0; n < $scope.questList.length; n++) {
            //find the current target 'quest' and designate this as scope.quest
            if ($scope.questList[n]._id == id) {
                $scope.quest = $scope.questList[n];
            }
        }
        QuestFactory.getStepListById(id).then(function(data) {
            // $scope.stepList = data;
            angular.copy(data, $scope.stepList);
            if ($scope.stepList.length > 0) {
                sessionStorage.stepStr = angular.toJson($scope.stepList);
            } else {
                sessionStorage.removeItem('stepStr');
            }
            $scope.stepList.forEach(function(el) {
                if (el.clues) {
                    el.clueStr = el.clues.join();
                }
                if (el.tags) {
                    el.tagStr = el.tags.join();
                }
            });
        });
    };

    //TEMPORARY------------------------
    //AAAAAAAH!------------------------
    //DELETE ME------------------------
    $scope.showData = function() {
        console.log('Quest List:', $scope.questList, ', Quest: ', $scope.quest, ', Steps: ', $scope.stepList);
    };

    $scope.correctAns = function(ansNum, stepNum) {
        //this function simply chooses the correct answer for the multi-choice answers.
        console.log('Correct: ', ansNum, 'ID: ', stepNum);
        $scope.stepList[stepNum].multiAnsCor=ansNum.toString();

    };

    $scope.checkOpenStatus = function(quest) {
        //if quest is currently ACTIVE and HAS PARTICIPANTS, show ARRAY at 0.
        //if quest is currently INACTIVE, show ARRAY at 1
        //if active and no partis, show ARRAY at 2.
        (quest.active) ? quest.active = false: quest.active = true;
        console.log('quest active?', quest.active);
        if (quest.active && quest.participants.length >= 1) {
            $scope.alerts[0].show = true;
            $scope.alerts[1].show = false;
            $scope.alerts[2].show = false;
        } else if (!quest.active) {
            $scope.alerts[0].show = false;
            $scope.alerts[1].show = true;
            $scope.alerts[2].show = false;
        } else if (quest.active && quest.participants.length < 1) {
            $scope.alerts[0].show = false;
            $scope.alerts[1].show = false;
            $scope.alerts[2].show = true;
        }
    };
    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
    $scope.removeStep = function(step) {
        //pop a confirm box and remove a step
        var remConf = confirm('Are you sure you wanna remove this step? Removing a step is permanent (once you click the save button)!');
        if (!remConf) {
            return;
        }
        //See if the object to remove has an id. if so, add to the list of objs to remove, since it's stored in db.
        if (step._id) {
            $scope.stepsToRemove.push(step);
        }
        //now remove the step from the frontEnd. first stepList arr
        for (var r = 0; r < $scope.stepList.length; r++) {
            if ($scope.stepList[r].question === step.question) {
                //remove it!
                $scope.stepList.splice(r, 1);
            }
        }
        //then sesh storage!
        sessionStorage.stepStr = angular.toJson($scope.stepList);
    };

    $state.go('edit.quest');

});

app.controller('editQuest', function($scope) {
    // window.addEventListener('beforeunload', function(e) {
    //     e.returnValue = "You haven't saved! Click Okay to continue without saving, or Cancel to stay on this page!";
    // })

    //add an event listener to an object ON THIS PAGE
});

app.controller('editStep', function($scope, QuestFactory) {
    $scope.newStep = {};
    $scope.step = {};
    //filter stuff
    $scope.searchBox = false;
    $scope.search = function() {
        if (!$scope.searchBox) $scope.searchBox = true;
        else $scope.searchBox = false;
    };

    console.log($scope.$parent.stepList);
    $scope.testTypes = ['Multiple Choice', 'Fill-in'];
    $scope.addStep = function() {
        $scope.$parent.addForm = true;
        console.log($scope.$parent.quest._id);
    };
    $scope.removeForm = function() {
        $scope.$parent.addForm = false;
    };
    $scope.saveStep = function(newStep) {
        $scope.$parent.stepList = QuestFactory.saveStepIter(newStep, $scope.$parent.stepList)||$scope.$parent.stepList;
        console.log('save step stuff successfully switched to smaller sequences',$scope.$parent.stepList)
        $scope.newStep = {}; //clear step
        $scope.$parent.addForm = false; //hide form.
    };
});

app.controller('editQuestMap', function($scope, MapFactory) {
    //lists quest on a nice, pretty map.
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);

    //GIANT LIST O TEST DATA!

    //begin mapDraw code
    MapFactory.drawMap($scope, $scope.$parent.stepList);
    $scope.$parent.currState = 'Map';
});