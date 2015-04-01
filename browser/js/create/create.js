'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('create', {
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


app.controller('CreateCtrl', function($scope, QuestFactory, AuthService, $state, catFactory) {
    //the following scope vars are 'parental' to the child scopes. 
    sessionStorage.removeItem('newQuest');
    sessionStorage.removeItem('stepStr');
    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.quest = {}; //curent quest object, via ng-change
    $scope.quest.cat = {
        cat: 'Miscellaneous',
        url: 'http://i.imgur.com/jFkV2.jpg'
    };
    $scope.quest.actInact = 'active';
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

    $scope.cats = catFactory.cats;

    if (sessionStorage.newQuest) {
        $scope.questExists = true;
    }
    $scope.saveFullQuest = function() {
        //this will save the full quest.
        console.log("$scope.stepList", $scope.stepList)
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            bootbox.confirm('This quest has no steps! Are you sure you wanna save it?', function(result) {
                if (result == false) {
                    return;
                }
            });
        }
        //parse and readjust quest
        ($scope.quest.actInact === 'active') ? $scope.quest.active = true: $scope.quest.active = false;
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.actInact;
        delete $scope.quest.pubPriv;
        //final-presave stuff: get the current user ID
        AuthService.getLoggedInUser().then(function(user) {
            console.log("user from AuthService", user);
            $scope.quest.owner = user._id;
            //save the quest
            QuestFactory.sendQuest($scope.quest)
                .then(function(questId) {
                    console.log('questId item:', questId);

                    // questId = questId.toString();
                    if (questId == "duplicateQuest") {
                        bootbox.alert("This quest already exists! Please create your steps in the 'edit' page.");
                    } else {
                        console.log("questId !== duplicateQuest");
                        $scope.stepList.forEach(function(item) {
                            item.quest = questId;
                            //save this step
                            QuestFactory.sendStep(item).then(function(data) {
                                console.log('Saved quest! Woohoo!');
                                //redirect, clear vars on NEXT PAGE!
                                $state.go('thanks');
                            });
                        });

                    }

                });
        });
    };

    $scope.clearData = function() {
        bootbox.confirm('Are you sure you want to clear this quest? It hasn\'t yet been saved!', function(result) {
            if (result != false) {
                sessionStorage.removeItem('newQuest');
                $scope.quest = {};
                $scope.stepList = []; //list of current steps.
                $scope.questExists = false;
            }
        });
    };
    $scope.$on('$stateChangeStart', function(e, to, n, from) {
        var parentF = from.name.split('.')[0];
        var parentT = to.name.split('.')[0];
        
        if (parentF != parentT && (sessionStorage.stepStr || sessionStorage.newQuest) && parentT !== 'thanks') {
            if (!confirm('Are you sure you wanna leave? This quest has not been saved yet!')) {
                e.preventDefault();
            }
        }
    })
    $state.go('create.quest');
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
        //now assign correct url to cats.url prop
        for (var n = 0; n < $scope.$parent.cats.length; n++) {
            if ($scope.$parent.cats[n].cat == $scope.$parent.quest.cat.cat) {
                $scope.$parent.quest.cat.url = $scope.$parent.cats[n].url;
            }
        }
        sessionStorage.newQuest = angular.toJson($scope.$parent.quest);
    };

});

app.controller('CreateStep', function($scope, QuestFactory) {
    $scope.$parent.currState = 'Step';
    $scope.testTypes = ['Multiple Choice', 'Fill-in'];
    $scope.alerts = [
        { type: 'warning', msg: 'All steps must have a Url.', show: false },
        { type: 'warning', msg: 'All steps must have a question.', show: false },
        { type: 'warning', msg: 'All steps must have a point value.', show: false },
        { type: 'warning', msg: 'All steps must have a question type.', show: false },
    ];
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList); //get steps on list
    $scope.saveStep = function(newStep) {
        console.log(newStep);
        if (!newStep.url) {
            console.log('yes');
            $scope.alerts[0].show = true;
        } else if (!newStep.question) {
            $scope.alerts[1].show = true;
        } else if (!newStep.pointValue) {
            $scope.alerts[2].show = true;
        } else if (!newStep.qType) {
            $scope.alerts[3].show = true;
        } else {
            $scope.$parent.stepList = QuestFactory.saveStepIter(newStep, $scope.$parent.stepList) || $scope.$parent.stepList;
            $scope.step = {}; //clear step
        }
    };
    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
});

app.controller('QuestMap', function($scope, MapFactory) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);

    //GIANT LIST O TEST DATA!

    //begin mapDraw code
    MapFactory.drawMap($scope, $scope.$parent.stepList);
    $scope.$parent.currState = 'Map';
});