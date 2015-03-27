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


app.controller('CreateCtrl', function($scope, QuestFactory, AuthService, $state) {
    //the following scope vars are 'parental' to the child scopes. 
    sessionStorage.removeItem('newQuest');
    sessionStorage.removeItem('stepStr');
    document.getElementById('unloadDiv').onunload = function(e) {
        console.log('Leavin on a jetplane');
        if (!confirm('Are you sure you want to leave?')) {
            e.preventDefault();
        }
    };
    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.quest = {}; //curent quest object, via ng-change
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
    if (sessionStorage.newQuest) {
        $scope.questExists = true;
    }
    $scope.saveFullQuest = function() {
        //this will save the full quest.
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            if (!confirm('(\u0CA0_\u0CA0) This quest has no steps! Are you sure you want to save it?')) {
                return; //user canceled save
            }
        }
        //parse and readjust quest
        ($scope.quest.actInact === 'active') ? $scope.quest.active = true: $scope.quest.active = false;
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.actInact;
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
        });
    };

    $scope.clearData = function() {
        var clearConf = confirm('Are you sure you want to clear this quest? It hasn\'t yet been saved!');
        if (clearConf) {
            sessionStorage.removeItem('newQuest');
            $scope.quest = {};
            $scope.stepList = []; //list of current steps.
            $scope.questExists = false;
        }
    };

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
        sessionStorage.newQuest = angular.toJson($scope.$parent.quest);
    };

});

app.controller('CreateStep', function($scope) {
    $scope.$parent.currState = 'Step';
    $scope.testTypes = [{
        type: 'Multiple Choice'
    }, {
        type: 'Fill-in'
    }];
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList); //get steps on list
    $scope.saveStep = function(step) {
        if ($scope.step.qType === "Multiple Choice") {
            //pushing a multi-choice q to the list
            //so we need to parse all of the answer options
            $scope.step.multipleAns = [];
            for (var n = 1; n < 5; n++) {
                console.log($scope.step['ans' + n]);
                $scope.step.multipleAns.push(step['ans' + n]);
                delete $scope.step['ans' + n];
                console.log('multiAns so far: ', step.multiAns)
            }
        }
        var tempTags = $scope.step.tags;
        delete $scope.step.tags;
        $scope.step.tags = tempTags.split(',').map(function(i) {
            return i.trim();
        });
        //give each step a number to go by.
        $scope.step.stepNum = $scope.$parent.stepList.length + 1;
        $scope.step.quest = 'NONE'; //this will get replaced once we save the parent quest and retrieve its ID.

        var stepsJson = angular.toJson(step);
        if (!sessionStorage.stepStr) {
            sessionStorage.stepStr = '[' + stepsJson + ']';
        } else {
            sessionStorage.stepStr = sessionStorage.stepStr.slice(0, -1);
            sessionStorage.stepStr += ',' + stepsJson + ']';
        }
        console.log("sessionStorage.stepStr", sessionStorage.stepStr);
        angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList)

        $scope.step = {}; //clear step
    };

});

app.controller('QuestMap', function($scope) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);

    //GIANT LIST O TEST DATA!
    $scope.$parent.stepList = [{
        question: 'What is your name?',
        pointValue: 150
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }, {
        question: 'Test',
        pointValue: 50
    }];
    //begin mapDraw code
    $scope.c = document.getElementById('map');
    $scope.cDraw = $scope.c.getContext('2d');
    $scope.lefts = [];
    $scope.tops = [];
    var holding = false;
    var num = $scope.$parent.stepList.length;


    $scope.c.addEventListener('mousemove', function(e) {
        x = e.x || e.clientX;
        y = e.y || e.clientY;

        x = x - 285 + $('body').scrollLeft();
        y = y - 205 + $('body').scrollTop();
        if (holding) {
            var id = parseInt(currDiv.id.split('l')[1]);
            $scope.lefts[id] = x;
            $scope.tops[id] = y;
            $scope.redrawNodes(num);
        }
    });

    $scope.drawNodes = function(num) {
        for (var i = 0; i < num; i++) {
            var el = document.createElement('div');
            el.className = 'cov';
            el.id = 'el' + i;
            el.innerHTML = '<div class="qExpl">Points: ' + $scope.$parent.stepList[i].pointValue + '</div>' + $scope.$parent.stepList[i].question;
            var lPos = (Math.random() * 900) + 25;
            el.style.left = (lPos + 270) + 'px';
            var tPos = (i * (1000 / num));
            el.style.top = (tPos + 110) + 'px';
            $scope.lefts.push(lPos);
            $scope.tops.push(tPos);
            el.onclick = function(e) {
                $scope.moveThis(e);
            };
            $('#mapCont').append(el);
        }
        $scope.drawLines();
    };

    $scope.redrawNodes = function(num) {
        for (var i = 0; i < num; i++) {
            var el = document.getElementById('el' + i);
            document.getElementById('el' + i).style.left = ($scope.lefts[i] + 270) + 'px';
            document.getElementById('el' + i).style.top = ($scope.tops[i] + 110) + 'px';
        }
        $scope.c.width = $scope.c.width;
        var img = new Image();
        img.onload = function() {
            console.log(img);
            img.src = '/js/create/mapBg.jpg';
            $scope.cDraw.drawImage(img, 1, 1, 1000, 1000);
        };
        $scope.drawLines();
    };

    $scope.drawLines = function() {

        for (var j = 0; j < num - 1; j++) {
            var LS = $scope.lefts[j] + 30;
            var LE = $scope.lefts[j + 1] + 30;
            var TS = $scope.tops[j] + 15;
            var TE = $scope.tops[j + 1] + 15;
            $scope.cDraw.moveTo(LS, TS);
            $scope.cDraw.lineTo(LE, TE);
            $scope.cDraw.stroke();
        }


    };

    $scope.moveThis = function(e) {
        var banner = e.target.children[0];
        if (!holding) {
            //not currently holding, so can pick something up;
            currDiv = e.target;
            currDiv.style.zIndex = 5;
            banner.style.height = '100px';
            holding = true;
        } else {
            banner.style.height = 0;
            currDiv.style.zIndex = 3;
            holding = false;
        }

    };

    $scope.drawNodes(num);
    var x,
        y,
        currDiv;
    $scope.$parent.currState = 'Map';
});