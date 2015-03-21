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

app.controller('CreateCtrl', function($scope) {
    $scope.currState = 'quest';
    $scope.quest = {};
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
        //whoopie.
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

app.controller('CreateStep', function($scope, createStep) {
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
        console.log('Adjusted Step:', step);
    
        var stepsJson = angular.toJson(steps);
        sessionStorage.stepsStr+=stepsJson+'|';
        step = {};
    };

});

app.controller('QuestMap', function($scope) {
    $scope.$parent.currState = 'Map';
});