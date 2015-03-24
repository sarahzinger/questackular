'use strict';
app.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
app.config(function($stateProvider) {
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


app.controller('editCtrl', function($scope, QuestFactory, AuthService, $state) {
    //the following scope vars are 'parental' to the child scopes. 

    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.questList = [];
    $scope.quest = {}; //curent quest object, via ng-change
    $scope.stepList = []; //list of current steps.
    $scope.questExists = false;
    $scope.selectedQuest;
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
    if (sessionStorage.newQuest) {
        $scope.questExists = true;
    }
    AuthService.getLoggedInUser().then(function(user) {
        $scope.quest.owner = user._id;
        //save the quest
        QuestFactory.getQuestsByUser(user._id).then(function(questList) {
            $scope.questList = questList;
        });
    })
    $scope.saveFullQuest = function() {
        //this will save the full quest.
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            if (!confirm('(\u0CA0_\u0CA0) This quest has no steps! Are you sure you want to save it?')) {
                return; //user canceled save
            }
        }
        //parse and readjust quest
        ($scope.quest.openClosed === 'open') ? $scope.quest.open = true: $scope.quest.open = false;
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.openClosed;
        delete $scope.quest.pubPriv;
        //final-presave stuff: get the current user ID
        AuthService.getLoggedInUser().then(function(user) {
            $scope.quest.owner = user._id;
            //save the quest
            QuestFactory.sendQuest($scope.quest).then(function(questId) {
                console.log('quest item:', questId);
                $scope.stepList.forEach(function(item) {
                    item.quest = questId;
                    //save this step
                    QuestFactory.sendStep(item).then(function(data) {
                        console.log('Saved quest! Woohoo!')
                            //redirect, clear vars on NEXT PAGE!
                        $state.go('thanks');
                    });
                });
            });
        })
    };
    $scope.pickQuest = function(id) {
        //this needs to get a quest by id and then get its associated steps
        QuestFactory.getStepListById(id).then(function(data) {
            $scope.stepList = data;
        });
    };

    //TEMPORARY------------------------
    //AAAAAAAH!------------------------
    //DELETE ME------------------------
    $scope.showData = function() {
        console.log('Quest List:', $scope.questList, ', Quest: ', $scope.quest, ', Steps: ', $scope.stepList);
    };

});

app.controller('editQuest', function($scope) {
    window.addEventListener('beforeunload', function(e) {
        e.returnValue = "You haven't saved! Click Okay to continue without saving, or Cancel to stay on this page!";
    })
});

app.controller('editStep', function($scope) {
    
});

app.controller('editQuestMap', function($scope) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
    $scope.divsTop = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    $scope.divsLeft = [0, 5, 10, 5, 0, 5, 10, 5, 0, 5, 10, 5, 0, 5, 10, 5, 0];
    $scope.$parent.currState = 'Map';
});