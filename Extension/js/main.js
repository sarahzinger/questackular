// function func(){
// 	alert('hi')
// }

// //for any inline event, we have to declare it in the JS file and THEN attach it
// document.getElementById('butt').addEventListener('click',func);

var app = angular.module('QuestackularExt', ['ui.router', 'ui.bootstrap']);

app.controller('extCont', function($scope, UserFactory) {
    $scope.login = function() {
        window.open('localhost:1337/auth/google', '_blank');
    };
    
    
    var getName = function(){
        UserFactory.getUserInfo().then(function(data){
            $scope.name = data.user.google.name;
            $scope.loggedIn = true;
        });
       
    };
    getName();


});

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

// app.run(function ($rootScope, $state) {

//     // The given state requires an authenticated user.
//     var destinationStateRequiresAuth = function (state) {
//         return state.data && state.data.authenticate;
//     };

//     // $stateChangeStart is an event fired
//     // whenever the process of changing a state begins.
//     $rootScope.$on('$stateChangeStart', function (event, toState) {

//         if (!destinationStateRequiresAuth(toState)) {
//             // The destination state does not require authentication
//             // Short circuit with return.
//             return;
//         }

//         if (AuthService.isAuthenticated()) {
//             // The user is authenticated.
//             // Short circuit with return.
//             return;
//         }

//         // Cancel navigating to new state.
//         event.preventDefault();

//         AuthService.getLoggedInUser().then(function (user) {
//             // If a user is retrieved, then renavigate to the destination
//             // (the second time, AuthService.isAuthenticated() will work)
//             // otherwise, if no user is logged in, go to "login" state.
//             var destination = user ? toState.name : 'login';
//             $state.go(destination);
//         });

//     });

// });


app.factory('UserFactory', function($http){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then( function(res) {
				console.log("name from factory",res.data.user.google.name)
				return res.data;
   			});
		}
	}
})
'use strict';


app.directive('navbar', function ($rootScope, UserFactory, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/application/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [{
                label: 'Create a Quest', state: 'create.quest' 
            }, {
                label: 'Join a Quest', state: 'join' 
            }, {
                label: 'My Quests', state: 'MyQuests' 
            }];

            scope.user = null;

            scope.login = function() {
                window.open('localhost:1337/auth/google', '_blank');
            };
            
            
            var getName = function(){
                UserFactory.getUserInfo().then(function(data){
                    scope.user = data.user;
                    scope.loggedIn = true;
                });
               
            };
            getName();

            // scope.isLoggedIn = function () {
            //     return AuthService.isAuthenticated();
            // };

            // scope.logout = function () {
            //     console.log('logout called');
            //     AuthService.logout().then(function () {
            //        $state.go('start');
            //     });
            // };

            // var setUser = function () {
            //     AuthService.getLoggedInUser().then(function (user) {
            //         scope.user = user;
            //     });
            // };

            // var removeUser = function () {
            //     scope.user = null;
            // };

            // setUser();

            // $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            // $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            // $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});
app.config(function ($stateProvider) {
  $stateProvider.state('MyQuests', {
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
    url: '/MyQuests',
    templateUrl: 'js/MyQuests/MyQuests.html', 
    controller: 'MyQuestsCtrl'
    });
});


app.controller('MyQuestsCtrl', function ($scope, UserFactory, QuestFactory){
  // console.log("UserFactory.getCurrentUser()", UserFactory.getCurrentUser());
  UserFactory.getCurrentUser().then(function (user) {
    $scope.user = user;
    $scope.userId = user._id;
    $scope.questsCreated = user.created;
    $scope.questsJoined = user.participating;
    $scope.questsCompleted = user.pastQuests;
  });

  $scope.leaveQuest = function (questId, userId) {
    // removes user from quest and quest from user in db
    QuestFactory.leaveQuest(questId, userId); 
    UserFactory.getCurrentUser().then(function (user) {
      $scope.questsJoined = user.participating;
    });
    
  };
});
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
        })
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
    }, {
        type: 'Short Answer'
    }];
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList); //get steps on list
    $scope.saveStep = function(step) {
        if ($scope.step.qType === "Multiple Choice") {
            //pushing a multi-choice q to the list
            //so we need to parse all of the answer options
            $scope.step.multipleAns = [];
            for (var n = 1; n < 5; n++) {
                console.log($scope.step['ans'+n]);
                $scope.step.multipleAns.push(step['ans' + n]);
                delete $scope.step['ans' + n];
                console.log('multiAns so far: ',step.multiAns)
            }
        } else if ($scope.step.qType === "Short Answer") $scope.step.shortAns = false;
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
            // $scope.$parent.stepList = angular.fromJson(sessionStorage.stepStr);

        $scope.step = {}; //clear step
    };

});

app.controller('QuestMap', function($scope) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);

    //GIANT LIST O TEST DATA!
    $scope.$parent.stepList = [{
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
    $scope.divsLeft= [18,116,90,40,160,198,250,280,365,470,480,460,0,0,0,0,0,0,0,0];
    $scope.divsTop = [67,120,190,260,310,250,183,110,40,100,180,270,0,0,0,0,0,0,0,0];
    $scope.$parent.currState = 'Map';
});
'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
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
    url: '/home',
    templateUrl: 'js/home/home.html', 
    controller: 'HomeCtrl'
    });
});


app.controller('HomeCtrl', function ($scope  ){

});
app.config(function ($stateProvider) {

    $stateProvider.state('join', {
    	resolve: {
                getLoggedInUser: function(AuthService, $state, $http){
                    return AuthService.getLoggedInUser(true).then(function(user) {
                        if (user) {
                            return user;
                        }else{
                            $state.go("start");
                        }
                    });
                }
            },
        url: '/join',
        templateUrl: 'js/join/join.html',
        controller: 'JoinCtrl'
    });

});


app.controller('JoinCtrl', function ($scope, QuestFactory, AuthService){
    $scope.alerts = [
        { type: 'alert-danger', msg: 'You are already participating in this quest.', show: false },
        { type: 'alert-success', msg: 'You\'ve successfully joined the quest.', show: false }
    ];

    QuestFactory.getAllQuests().then(function(quests) {
        $scope.quests = quests; // $scope.unjoinedQuests 
    });
    $scope.searchBox = false;
    $scope.search = function() {
        if (!$scope.searchBox) $scope.searchBox = true;
        else $scope.searchBox = false;
    };

    $scope.joinQuest = function(quest) {
        console.log("quest", quest);

        AuthService.getLoggedInUser().then(function (user) {
            $scope.userId = user._id;
            // if already joined, do something
            console.log("quest.participants", quest.participants);
            console.log("user._id", user._id);
            console.log("quest.participants.indexOf(user._id)", quest.participants.indexOf(user._id));

            if (quest.participants.indexOf(user._id) > -1) {
                // show alert
                console.log("quest.participants.indexOf(user._id)", quest.participants.indexOf(user._id));
                if ($scope.alerts[1].show) $scope.alerts[1].show = false;
                if (!$scope.alerts[0].show) $scope.alerts[0].show = true;
            } else {
                quest.participants.push($scope.userId);
                QuestFactory.joinQuest(quest);
                if ($scope.alerts[0].show) $scope.alerts[0].show = false;
                if (!$scope.alerts[1].show) $scope.alerts[1].show = true;
            }

        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9jcmVhdGUvY3JlYXRlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9qb2luL2pvaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBmdW5jdGlvbiBmdW5jKCl7XG4vLyBcdGFsZXJ0KCdoaScpXG4vLyB9XG5cbi8vIC8vZm9yIGFueSBpbmxpbmUgZXZlbnQsIHdlIGhhdmUgdG8gZGVjbGFyZSBpdCBpbiB0aGUgSlMgZmlsZSBhbmQgVEhFTiBhdHRhY2ggaXRcbi8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidXR0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmMpO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ1F1ZXN0YWNrdWxhckV4dCcsIFsndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCddKTtcblxuYXBwLmNvbnRyb2xsZXIoJ2V4dENvbnQnLCBmdW5jdGlvbigkc2NvcGUsIFVzZXJGYWN0b3J5KSB7XG4gICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgJHNjb3BlLm5hbWUgPSBkYXRhLnVzZXIuZ29vZ2xlLm5hbWU7XG4gICAgICAgICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICBcbiAgICB9O1xuICAgIGdldE5hbWUoKTtcblxuXG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHN0YXRlKSB7XG5cbi8vICAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuLy8gICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4vLyAgICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuLy8gICAgIH07XG5cbi8vICAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuLy8gICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuLy8gICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSkge1xuXG4vLyAgICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuLy8gICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbi8vICAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4vLyAgICAgICAgICAgICByZXR1cm47XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbi8vICAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4vLyAgICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuLy8gICAgICAgICAgICAgcmV0dXJuO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuLy8gICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4vLyAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbi8vICAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbi8vICAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbi8vICAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbi8vICAgICAgICAgICAgIHZhciBkZXN0aW5hdGlvbiA9IHVzZXIgPyB0b1N0YXRlLm5hbWUgOiAnbG9naW4nO1xuLy8gICAgICAgICAgICAgJHN0YXRlLmdvKGRlc3RpbmF0aW9uKTtcbi8vICAgICAgICAgfSk7XG5cbi8vICAgICB9KTtcblxuLy8gfSk7XG5cbiIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJue1xuXHRcdGdldFVzZXJJbmZvOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb24nKS50aGVuKCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJuYW1lIGZyb20gZmFjdG9yeVwiLHJlcy5kYXRhLnVzZXIuZ29vZ2xlLm5hbWUpXG5cdFx0XHRcdHJldHVybiByZXMuZGF0YTtcbiAgIFx0XHRcdH0pO1xuXHRcdH1cblx0fVxufSkiLCIndXNlIHN0cmljdCc7XG5cblxuYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDcmVhdGUgYSBRdWVzdCcsIHN0YXRlOiAnY3JlYXRlLnF1ZXN0JyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0pvaW4gYSBRdWVzdCcsIHN0YXRlOiAnam9pbicgXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBRdWVzdHMnLCBzdGF0ZTogJ015UXVlc3RzJyBcbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5hbWUoKTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ2xvZ291dCBjYWxsZWQnKTtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAkc3RhdGUuZ28oJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnTXlRdWVzdHMnLCB7XG4gICAgcmVzb2x2ZToge1xuICAgICAgZ2V0TG9nZ2VkSW5Vc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSwgJHN0YXRlLCAkaHR0cCl7XG4gICAgICAgIHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIodHJ1ZSkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICBpZih1c2VyKXtcbiAgICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgJHN0YXRlLmdvKFwic3RhcnRcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVybDogJy9NeVF1ZXN0cycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9NeVF1ZXN0cy9NeVF1ZXN0cy5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ015UXVlc3RzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdNeVF1ZXN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSwgUXVlc3RGYWN0b3J5KXtcbiAgLy8gY29uc29sZS5sb2coXCJVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpXCIsIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkpO1xuICBVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAkc2NvcGUudXNlciA9IHVzZXI7XG4gICAgJHNjb3BlLnVzZXJJZCA9IHVzZXIuX2lkO1xuICAgICRzY29wZS5xdWVzdHNDcmVhdGVkID0gdXNlci5jcmVhdGVkO1xuICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gICAgJHNjb3BlLnF1ZXN0c0NvbXBsZXRlZCA9IHVzZXIucGFzdFF1ZXN0cztcbiAgfSk7XG5cbiAgJHNjb3BlLmxlYXZlUXVlc3QgPSBmdW5jdGlvbiAocXVlc3RJZCwgdXNlcklkKSB7XG4gICAgLy8gcmVtb3ZlcyB1c2VyIGZyb20gcXVlc3QgYW5kIHF1ZXN0IGZyb20gdXNlciBpbiBkYlxuICAgIFF1ZXN0RmFjdG9yeS5sZWF2ZVF1ZXN0KHF1ZXN0SWQsIHVzZXJJZCk7IFxuICAgIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IHVzZXIucGFydGljaXBhdGluZztcbiAgICB9KTtcbiAgICBcbiAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3JlYXRlJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGdldExvZ2dlZEluVXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRzdGF0ZSwgJGh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcih0cnVlKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhcInN0YXJ0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXJsOiAnL2NyZWF0ZScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NyZWF0ZS9jcmVhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ3JlYXRlQ3RybCdcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjcmVhdGUucXVlc3QnLCB7XG4gICAgICAgICAgICB1cmw6ICcvcXVlc3QnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jcmVhdGUvcXVlc3QuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ3JlYXRlUXVlc3QnXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY3JlYXRlLnN0ZXAnLCB7XG4gICAgICAgICAgICB1cmw6ICcvc3RlcCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NyZWF0ZS9zdGVwLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NyZWF0ZVN0ZXAnXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY3JlYXRlLm1hcCcsIHtcbiAgICAgICAgICAgIHVybDogJy9tYXAnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jcmVhdGUvbWFwLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1F1ZXN0TWFwJ1xuICAgICAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdDcmVhdGVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBRdWVzdEZhY3RvcnksIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcbiAgICAvL3RoZSBmb2xsb3dpbmcgc2NvcGUgdmFycyBhcmUgJ3BhcmVudGFsJyB0byB0aGUgY2hpbGQgc2NvcGVzLiBcblxuICAgIC8vV2UgbmVlZCB0aGVtIGhlcmUgc28gdGhhdCBjbGlja2luZyAnc2F2ZScgb24gYW55IHBhZ2Ugc2F2ZXMgdGhlIGVudGlyZSBxdWVzdCtzdGVwcyBncm91cFxuICAgICRzY29wZS5jdXJyU3RhdGUgPSAncXVlc3QnO1xuICAgICRzY29wZS5xdWVzdCA9IHt9OyAvL2N1cmVudCBxdWVzdCBvYmplY3QsIHZpYSBuZy1jaGFuZ2VcbiAgICAkc2NvcGUucXVlc3QuYWN0SW5hY3QgPSAnYWN0aXZlJztcbiAgICAkc2NvcGUuc3RlcExpc3QgPSBbXTsgLy9saXN0IG9mIGN1cnJlbnQgc3RlcHMuXG4gICAgJHNjb3BlLnF1ZXN0RXhpc3RzID0gZmFsc2U7XG4gICAgJHNjb3BlLnRhYnMgPSBbe1xuICAgICAgICBsYWJlbDogXCJOZXcgUXVlc3RcIixcbiAgICAgICAgc3RhdGU6IFwiY3JlYXRlLnF1ZXN0XCJcbiAgICB9LCB7XG4gICAgICAgIGxhYmVsOiBcIk5ldyBTdGVwXCIsXG4gICAgICAgIHN0YXRlOiBcImNyZWF0ZS5zdGVwXCIsXG4gICAgICAgIGRpc2FibGVkOiAkc2NvcGUubm9RdWVzdFxuICAgIH0sIHtcbiAgICAgICAgbGFiZWw6IFwiUXVlc3QgTWFwXCIsXG4gICAgICAgIHN0YXRlOiBcImNyZWF0ZS5tYXBcIixcbiAgICAgICAgZGlzYWJsZWQ6ICRzY29wZS5ub1F1ZXN0XG4gICAgfV07XG4gICAgaWYgKHNlc3Npb25TdG9yYWdlLm5ld1F1ZXN0KSB7XG4gICAgICAgICRzY29wZS5xdWVzdEV4aXN0cyA9IHRydWU7XG4gICAgfVxuICAgICRzY29wZS5zYXZlRnVsbFF1ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vdGhpcyB3aWxsIHNhdmUgdGhlIGZ1bGwgcXVlc3QuXG4gICAgICAgIGlmICgkc2NvcGUuc3RlcExpc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgLy9ubyBzdGVwcyB5ZXQuIEFsZXJ0IHVzZXIhXG4gICAgICAgICAgICBpZiAoIWNvbmZpcm0oJyhcXHUwQ0EwX1xcdTBDQTApIFRoaXMgcXVlc3QgaGFzIG5vIHN0ZXBzISBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2F2ZSBpdD8nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy91c2VyIGNhbmNlbGVkIHNhdmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL3BhcnNlIGFuZCByZWFkanVzdCBxdWVzdFxuICAgICAgICAoJHNjb3BlLnF1ZXN0LmFjdEluYWN0ID09PSAnYWN0aXZlJykgPyAkc2NvcGUucXVlc3QuYWN0aXZlID0gdHJ1ZTogJHNjb3BlLnF1ZXN0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAoJHNjb3BlLnF1ZXN0LnB1YlByaXYgPT09ICdwcml2YXRlJykgPyAkc2NvcGUucXVlc3QucHJpdmFjeSA9IHRydWU6ICRzY29wZS5xdWVzdC5wcml2YWN5ID0gZmFsc2U7XG4gICAgICAgIGRlbGV0ZSAkc2NvcGUucXVlc3QuYWN0SW5hY3Q7XG4gICAgICAgIGRlbGV0ZSAkc2NvcGUucXVlc3QucHViUHJpdjtcbiAgICAgICAgLy9maW5hbC1wcmVzYXZlIHN0dWZmOiBnZXQgdGhlIGN1cnJlbnQgdXNlciBJRFxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS5xdWVzdC5vd25lciA9IHVzZXIuX2lkO1xuICAgICAgICAgICAgLy9zYXZlIHRoZSBxdWVzdFxuICAgICAgICAgICAgUXVlc3RGYWN0b3J5LnNlbmRRdWVzdCgkc2NvcGUucXVlc3QpLnRoZW4oZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdxdWVzdCBpdGVtOicsIHF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGVwTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5xdWVzdCA9IHF1ZXN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vc2F2ZSB0aGlzIHN0ZXBcbiAgICAgICAgICAgICAgICAgICAgUXVlc3RGYWN0b3J5LnNlbmRTdGVwKGl0ZW0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NhdmVkIHF1ZXN0ISBXb29ob28hJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3JlZGlyZWN0LCBjbGVhciB2YXJzIG9uIE5FWFQgUEFHRSFcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGhhbmtzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfTtcblxuICAgICRzY29wZS5jbGVhckRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNsZWFyQ29uZiA9IGNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjbGVhciB0aGlzIHF1ZXN0PyBJdCBoYXNuXFwndCB5ZXQgYmVlbiBzYXZlZCEnKTtcbiAgICAgICAgaWYgKGNsZWFyQ29uZikge1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnbmV3UXVlc3QnKTtcbiAgICAgICAgICAgICRzY29wZS5xdWVzdCA9IHt9O1xuICAgICAgICAgICAgJHNjb3BlLnN0ZXBMaXN0ID0gW107IC8vbGlzdCBvZiBjdXJyZW50IHN0ZXBzLlxuICAgICAgICAgICAgJHNjb3BlLnF1ZXN0RXhpc3RzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJHN0YXRlLmdvKCdjcmVhdGUucXVlc3QnKTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ3JlYXRlUXVlc3QnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAkc2NvcGUuJHBhcmVudC5jdXJyU3RhdGUgPSAnUXVlc3QnO1xuICAgIGlmIChzZXNzaW9uU3RvcmFnZS5uZXdRdWVzdCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCduZXdRdWVzdCcpO1xuICAgIH0gZWxzZSBpZiAoc2Vzc2lvblN0b3JhZ2UubmV3UXVlc3QpIHtcbiAgICAgICAgLy9zZXNoIHN0b3JhZ2Ugb2JqIGlzIGRlZmluZWQsXG4gICAgICAgICRzY29wZS4kcGFyZW50LnF1ZXN0ID0gYW5ndWxhci5mcm9tSnNvbihzZXNzaW9uU3RvcmFnZS5uZXdRdWVzdCk7XG4gICAgICAgICRzY29wZS4kcGFyZW50LnF1ZXN0RXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgLy9hbHNvIGRpc2FibGVcbiAgICB9XG4gICAgJHNjb3BlLnNhdmVRdWVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuJHBhcmVudC5xdWVzdEV4aXN0cyA9IHRydWU7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLm5ld1F1ZXN0ID0gYW5ndWxhci50b0pzb24oJHNjb3BlLiRwYXJlbnQucXVlc3QpO1xuICAgIH07XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ3JlYXRlU3RlcCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICRzY29wZS4kcGFyZW50LmN1cnJTdGF0ZSA9ICdTdGVwJztcbiAgICAkc2NvcGUudGVzdFR5cGVzID0gW3tcbiAgICAgICAgdHlwZTogJ011bHRpcGxlIENob2ljZSdcbiAgICB9LCB7XG4gICAgICAgIHR5cGU6ICdGaWxsLWluJ1xuICAgIH0sIHtcbiAgICAgICAgdHlwZTogJ1Nob3J0IEFuc3dlcidcbiAgICB9XTtcbiAgICBhbmd1bGFyLmNvcHkoYW5ndWxhci5mcm9tSnNvbihzZXNzaW9uU3RvcmFnZS5zdGVwU3RyKSwgJHNjb3BlLiRwYXJlbnQuc3RlcExpc3QpOyAvL2dldCBzdGVwcyBvbiBsaXN0XG4gICAgJHNjb3BlLnNhdmVTdGVwID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICBpZiAoJHNjb3BlLnN0ZXAucVR5cGUgPT09IFwiTXVsdGlwbGUgQ2hvaWNlXCIpIHtcbiAgICAgICAgICAgIC8vcHVzaGluZyBhIG11bHRpLWNob2ljZSBxIHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAvL3NvIHdlIG5lZWQgdG8gcGFyc2UgYWxsIG9mIHRoZSBhbnN3ZXIgb3B0aW9uc1xuICAgICAgICAgICAgJHNjb3BlLnN0ZXAubXVsdGlwbGVBbnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIG4gPSAxOyBuIDwgNTsgbisrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnN0ZXBbJ2Fucycrbl0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGVwLm11bHRpcGxlQW5zLnB1c2goc3RlcFsnYW5zJyArIG5dKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgJHNjb3BlLnN0ZXBbJ2FucycgKyBuXTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbXVsdGlBbnMgc28gZmFyOiAnLHN0ZXAubXVsdGlBbnMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnN0ZXAucVR5cGUgPT09IFwiU2hvcnQgQW5zd2VyXCIpICRzY29wZS5zdGVwLnNob3J0QW5zID0gZmFsc2U7XG4gICAgICAgIHZhciB0ZW1wVGFncyA9ICRzY29wZS5zdGVwLnRhZ3M7XG4gICAgICAgIGRlbGV0ZSAkc2NvcGUuc3RlcC50YWdzO1xuICAgICAgICAkc2NvcGUuc3RlcC50YWdzID0gdGVtcFRhZ3Muc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgcmV0dXJuIGkudHJpbSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9naXZlIGVhY2ggc3RlcCBhIG51bWJlciB0byBnbyBieS5cbiAgICAgICAgJHNjb3BlLnN0ZXAuc3RlcE51bSA9ICRzY29wZS4kcGFyZW50LnN0ZXBMaXN0Lmxlbmd0aCArIDE7XG4gICAgICAgICRzY29wZS5zdGVwLnF1ZXN0ID0gJ05PTkUnOyAvL3RoaXMgd2lsbCBnZXQgcmVwbGFjZWQgb25jZSB3ZSBzYXZlIHRoZSBwYXJlbnQgcXVlc3QgYW5kIHJldHJpZXZlIGl0cyBJRC5cblxuICAgICAgICB2YXIgc3RlcHNKc29uID0gYW5ndWxhci50b0pzb24oc3RlcCk7XG4gICAgICAgIGlmICghc2Vzc2lvblN0b3JhZ2Uuc3RlcFN0cikge1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc3RlcFN0ciA9ICdbJyArIHN0ZXBzSnNvbiArICddJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnN0ZXBTdHIgPSBzZXNzaW9uU3RvcmFnZS5zdGVwU3RyLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnN0ZXBTdHIgKz0gJywnICsgc3RlcHNKc29uICsgJ10nO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2Vzc2lvblN0b3JhZ2Uuc3RlcFN0clwiLCBzZXNzaW9uU3RvcmFnZS5zdGVwU3RyKTtcbiAgICAgICAgYW5ndWxhci5jb3B5KGFuZ3VsYXIuZnJvbUpzb24oc2Vzc2lvblN0b3JhZ2Uuc3RlcFN0ciksICRzY29wZS4kcGFyZW50LnN0ZXBMaXN0KVxuICAgICAgICAgICAgLy8gJHNjb3BlLiRwYXJlbnQuc3RlcExpc3QgPSBhbmd1bGFyLmZyb21Kc29uKHNlc3Npb25TdG9yYWdlLnN0ZXBTdHIpO1xuXG4gICAgICAgICRzY29wZS5zdGVwID0ge307IC8vY2xlYXIgc3RlcFxuICAgIH07XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignUXVlc3RNYXAnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICBhbmd1bGFyLmNvcHkoYW5ndWxhci5mcm9tSnNvbihzZXNzaW9uU3RvcmFnZS5zdGVwU3RyKSwgJHNjb3BlLiRwYXJlbnQuc3RlcExpc3QpO1xuXG4gICAgLy9HSUFOVCBMSVNUIE8gVEVTVCBEQVRBIVxuICAgICRzY29wZS4kcGFyZW50LnN0ZXBMaXN0ID0gW3tcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfSwge1xuICAgICAgICBxdWVzdGlvbjogJ1Rlc3QnLFxuICAgICAgICBwb2ludFZhbHVlOiA1MFxuICAgIH0sIHtcbiAgICAgICAgcXVlc3Rpb246ICdUZXN0JyxcbiAgICAgICAgcG9pbnRWYWx1ZTogNTBcbiAgICB9LCB7XG4gICAgICAgIHF1ZXN0aW9uOiAnVGVzdCcsXG4gICAgICAgIHBvaW50VmFsdWU6IDUwXG4gICAgfV07XG4gICAgJHNjb3BlLmRpdnNMZWZ0PSBbMTgsMTE2LDkwLDQwLDE2MCwxOTgsMjUwLDI4MCwzNjUsNDcwLDQ4MCw0NjAsMCwwLDAsMCwwLDAsMCwwXTtcbiAgICAkc2NvcGUuZGl2c1RvcCA9IFs2NywxMjAsMTkwLDI2MCwzMTAsMjUwLDE4MywxMTAsNDAsMTAwLDE4MCwyNzAsMCwwLDAsMCwwLDAsMCwwXTtcbiAgICAkc2NvcGUuJHBhcmVudC5jdXJyU3RhdGUgPSAnTWFwJztcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGdldExvZ2dlZEluVXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRzdGF0ZSwgJGh0dHApe1xuICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKHRydWUpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgaWYodXNlcil7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICRzdGF0ZS5nbyhcInN0YXJ0XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB1cmw6ICcvaG9tZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUgICl7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnam9pbicsIHtcbiAgICBcdHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBnZXRMb2dnZWRJblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUsICRodHRwKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcih0cnVlKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oXCJzdGFydFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2pvaW4vam9pbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0pvaW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSm9pbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIEF1dGhTZXJ2aWNlKXtcbiAgICAkc2NvcGUuYWxlcnRzID0gW1xuICAgICAgICB7IHR5cGU6ICdhbGVydC1kYW5nZXInLCBtc2c6ICdZb3UgYXJlIGFscmVhZHkgcGFydGljaXBhdGluZyBpbiB0aGlzIHF1ZXN0LicsIHNob3c6IGZhbHNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LXN1Y2Nlc3MnLCBtc2c6ICdZb3VcXCd2ZSBzdWNjZXNzZnVsbHkgam9pbmVkIHRoZSBxdWVzdC4nLCBzaG93OiBmYWxzZSB9XG4gICAgXTtcblxuICAgIFF1ZXN0RmFjdG9yeS5nZXRBbGxRdWVzdHMoKS50aGVuKGZ1bmN0aW9uKHF1ZXN0cykge1xuICAgICAgICAkc2NvcGUucXVlc3RzID0gcXVlc3RzOyAvLyAkc2NvcGUudW5qb2luZWRRdWVzdHMgXG4gICAgfSk7XG4gICAgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgICRzY29wZS5zZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUuc2VhcmNoQm94KSAkc2NvcGUuc2VhcmNoQm94ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgfTtcblxuICAgICRzY29wZS5qb2luUXVlc3QgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0XCIsIHF1ZXN0KTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcklkID0gdXNlci5faWQ7XG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IGpvaW5lZCwgZG8gc29tZXRoaW5nXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50c1wiLCBxdWVzdC5wYXJ0aWNpcGFudHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLl9pZFwiLCB1c2VyLl9pZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuXG4gICAgICAgICAgICBpZiAocXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGFsZXJ0XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVlc3QucGFydGljaXBhbnRzLnB1c2goJHNjb3BlLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgUXVlc3RGYWN0b3J5LmpvaW5RdWVzdChxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLmFsZXJ0c1tpbmRleF0uc2hvdyA9IGZhbHNlO1xuICAgIH07XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==