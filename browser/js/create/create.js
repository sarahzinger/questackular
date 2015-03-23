'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('create', {
            resolve: {
                getLoggedInUser: function(AuthService, $state, $http){
                    return AuthService.getLoggedInUser(true).then(function(user){
                        if(user){
                            return user;
                        }else{
                            $state.go("start");
                        }
                    });
                }
            },
            url: '/create',
            templateUrl: 'js/create/create.html',
            controller: 'CreateCtrl'
        })
        .state('create.quest', {
            url: '/quest',
            templateUrl: 'js/create/quest.html',
            controller: 'CreateQuest'
        })
        .state('create.step', {
            url: '/step',
            templateUrl: 'js/create/step.html',
            controller: 'CreateStep'
        })
        .state('create.map', {
            url: '/map',
            templateUrl: 'js/create/map.html',
            controller: 'QuestMap'
        });
});

app.controller('CreateCtrl', function($scope, saveQuest, AuthService) {
    //the following scope vars are 'parental' to the child scopes. 

    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.quest = {}; //curent quest object, via ng-change
    $scope.stepList = []; //list of current steps.
    $scope.questExists = false;
    $scope.tabs = [{
        label: "New Quest",
        state: "create.quest"
    }, {
        label: "New Step",
        state: "create.step",
        disabled: $scope.noQuest
    }, {
        label: "Quest Map",
        state: "create.map",
        disabled: $scope.noQuest
    }];
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
            saveQuest.sendQuest($scope.quest).then(function(questId) {
                $scope.stepList.forEach(function(item) {
                    item.quest = questId;
                    //save this step
                    saveQuest.sendStep();
                });
            });
        })
    };
});

app.controller('CreateQuest', function($scope) {
    $scope.$parent.currState = 'Quest';
    if (sessionStorage.newQuest == 'undefined') {
        sessionStorage.removeItem('newQuest');
    } else if (sessionStorage.newQuest) {
        //sesh storage obj is defined,
        $scope.$parent.quest = angular.fromJson(sessionStorage.newQuest);
        $scope.$parent.questExists = true;
        //also disable
    }
    $scope.saveQuest = function() {
        $scope.$parent.questExists = true;
        sessionStorage.newQuest = angular.toJson($scope.$parent.quest);
    };
    $scope.clearData = function() {
        var clearConf = confirm('Are you sure you want to clear this quest? It hasn\'t yet been saved!');
        if (clearConf) {
            sessionStorage.removeItem('newQuest');
            $scope.$parent.quest = {};
        }
    };
});

app.controller('CreateStep', function($scope) {
    $scope.$parent.currState = 'Step';
    $scope.testTypes = [{
        type: 'Multiple Choice'
    }, {
        type: 'Fill-in'
    }, {
        type: 'Short Answer'
    }, {
        type: 'Find Me'
    }];
    $scope.saveStep = function(step) {
        if (step.type === "Multiple Choice") {
            //pushing a multi-choice q to the list
            //so we need to parse all of the answer options
            step.multipleAns = [];
            for (var n = 1; n < 5; n++) {
                step.multipleAns.push(step['ans' + n]);
                delete step['ans' + n];
            }
        } else if (step.type === "Short Answer") step.shortAns = false;
        var tempTags = step.tags;
        delete step.tags;
        step.tags = tempTags.split(',').map(function(i) {
            return i.trim();
        });
        //give each step a number to go by.
        step.stepNum = $scope.$parent.stepList.length + 1;
        step.quest = 'NONE'; //this will get replaced once we save the parent quest and retrieve its ID.

        var stepsJson = angular.toJson(step);
        if (!sessionStorage.stepStr) {
            sessionStorage.stepStr = '['+stepsJson+']';
        } else {
            sessionStorage.stepStr = sessionStorage.stepStr.slice(0,-1);
            sessionStorage.stepStr += ',' + stepsJson+']';
        }
        console.log("sessionStorage.stepStr", sessionStorage.stepStr);
        angular.copy(angular.fromJson(sessionStorage.stepStr),$scope.$parent.stepList)
        // $scope.$parent.stepList = angular.fromJson(sessionStorage.stepStr);

        step = {}; //clear step
    };

});

app.controller('QuestMap', function($scope) {
    $scope.$parent.currState = 'Map';
});