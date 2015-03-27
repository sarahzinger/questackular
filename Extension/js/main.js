var app = angular.module('QuestackularExt', ['ui.router', 'ui.bootstrap']);

app.controller('extCont', function($scope, UserFactory, $state) {
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

app.config(function ($urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');


    // whitelist the chrome-extension: protocol 
    // so that it does not add "unsafe:"   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
});
'use strict';
app.value('domain', 'http://localhost:1337');

app.factory('QuestFactory', function($http, domain) {
    console.log("domain");
    return {
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post(domain + '/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get(domain + '/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get(domain + '/api/quests/' + questId).then(function(res) {
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post(domain + '/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete(domain + '/api/quests/participants/' + questId).then(function(response) {
                console.log(response);
            });
        },
        updateQuest: function(updatedQuest) {
            return $http.put('/api/quests/:id', updatedQuest).then(function(res) {
                return res.data;
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get(domain + '/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        sendStep: function(step) {
            //saves the quest
            return $http.post(domain + '/api/step', step).then(function(response) {
                return response.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get(domain + '/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(rem) {
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.post(domain + '/api/step/rem/', rem).then(function(res) {
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post(domain + '/api/step/upd', updatedStep).then(function(res) {
                return res.data;
            });
        },
        getStepById: function(stepId) {
            return $http.get(domain + '/api/step/' + stepId).then(function(res) {
                return res.data;
            });
        },
        saveStepIter: function(step,stepList) {
            for (var r = 0; r < stepList.length; r++) {
                console.log('new Q: ', step.question, ', old Q:', stepList[r]);
                if (step.question === stepList[r].question) {
                    //err! question already exists!
                    alert('This step already exists! You can\'t have the same step multiple times in the same quest!');
                    return false;
                }
            }
            if (step.qType === "Multiple Choice") {
                //pushing a multi-choice q to the list
                //so we need to parse all of the answer options
                step.multipleAns = [];
                for (var n = 1; n < 5; n++) {
                    console.log(step['ans' + n]);
                    step.multipleAns.push(step['ans' + n]);
                    delete step['ans' + n];
                    console.log('multiAns so far: ', step.multiAns);
                }
            }

            //give each step a number to go by.
            step.stepNum = stepList.length + 1;
            step.quest = 'NONE'; //this will get replaced once we save the parent quest and retrieve its ID.

            var seshObj = [];
            // var stepsJson = angular.toJson(newStep);

            if (sessionStorage.stepStr) {
                //this quest has steps, so before we push, we need to get those from the ss.stepStr var
                seshObj = angular.fromJson(sessionStorage.stepStr);
            }
            seshObj.push(step);
            angular.copy(seshObj, stepList);
            sessionStorage.stepStr = angular.toJson(seshObj);

            console.log("sessionStorage.stepStr currently has: ", sessionStorage.stepStr);

            angular.copy(angular.fromJson(sessionStorage.stepStr), stepList);
            return stepList;
        }
    };

});
app.factory('UserFactory', function($http){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then( function(res) {
				return res.data;
   			});
		},
		getUserFromDb: function (userId) {
			console.log("userId", userId);
			return $http.get('http://localhost:1337/api/users/' + userId).then(function (dbUser) {
				console.log("dbUser", dbUser);
				return dbUser.data;
			});
		},
		changeCurrentStep: function(stepId){
        	console.log("changeCurrentStep launched");
            return $http.put('http://localhost:1337/api/users/participating/currentStep/'+stepId).then(function(res){
                return res.data;
            });
        },
        addPoints: function(stepId){
            return $http.put('http://localhost:1337/api/users/points/'+stepId).then(function(res){
            	console.log("points", res.data)
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
                label: 'Join a Quest', state: 'home' 
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
  $stateProvider.state('myQuests', {
    
    url: '/myQuests',
    templateUrl: 'js/application/states/myQuests/myQuests.html', 
    controller: 'MyQuestsCtrl'
    });
});


app.controller('MyQuestsCtrl', function ($scope, UserFactory, $state) {
  UserFactory.getUserInfo().then(function (userInfo) {
    console.log("userInfo", userInfo);
    var id = userInfo.user._id;
    UserFactory.getUserFromDb(id).then(function (dbUser) {
      console.log("user from DB", dbUser);
      $scope.user = dbUser;
      if (dbUser.participating.length) $scope.questsJoined = dbUser.participating;
      else $scope.noParticipatingQuests = "You haven't joined any quests yet."
      console.log("quest joined", $scope.questsJoined[0].questId);
    });
  });

  $scope.hello = "hello!";

  // $scope.leaveQuest = function (questId, userId) {
  //   // removes user from quest and quest from user in db
  //   // QuestFactory.leaveQuest(questId, userId); 
  //   UserFactory.getUserFromDb().then(function (user) {
  //     $scope.questsJoined = user.participating;
  //   });
  // };
  $scope.continueQuest = function(participatingIndex){
    localStorage.setItem("participatingIndex", participatingIndex);
    $state.go("step");
  };
});
'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'js/application/states/home/home.html', 
    controller: 'HomeCtrl'
    });
});


app.controller('HomeCtrl', function ($scope) {
  $scope.states = [{
    state: "leaderBoard", title: "Leader Board"
  },
  {
    state: "profile", title: "Profile"
  },
  {
    state: "join", title: "Join A Quest"
  },
  {
    state: "myQuests", title: "My Quests"
  },
  {
    state: "step", title: "Temporary Step Button"
  }];

});
app.config(function ($stateProvider) {

    $stateProvider.state('join', {
        url: '/join',
        templateUrl: 'js/application/states/join/join.html',
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

'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('leaderBoard', {
		url: '/leaderBoard',
		templateUrl: 'js/application/states/leaderBoard/leaderBoard.html', 
		controller: 'LeaderBoardCtrl'
	});
});


app.controller('LeaderBoardCtrl', function ($scope) {
	var n = 20 // get number of users from db;
	$scope.lb = {};
	$scope.lb.rankNums = [];
	for (var i = 1; i <= n; i++) {
		$scope.rankNums.push(i);
	}

});
app.config(function ($stateProvider) {
  $stateProvider.state('profile', {
    
    url: '/profile',
    templateUrl: 'js/application/states/profile/profile.html', 
    controller: 'ProfileCtrl'
    });
});


app.controller('ProfileCtrl', function ($scope, UserFactory) {
  UserFactory.getUserInfo().then(function (userInfo) {
    console.log("userInfo", userInfo);
    $scope.fullname = userInfo.user.google.name;
    $scope.email = userInfo.user.google.email;
  });

  $scope.hello = "hello!";


});
'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('step', {
		url: '/step',
		templateUrl: 'js/application/states/step/step.html', 
		controller: 'StepCtrl'
	});
});


app.controller('StepCtrl', function ($scope, QuestFactory, UserFactory, $state) {
	$scope.alertshow = false;

	$scope.participatingIndex= Number(localStorage["participatingIndex"]);

	UserFactory.getUserInfo().then(function(unPopUser){
		UserFactory.getUserFromDb(unPopUser.user._id).then(function(popUser){
			$scope.chosenQuest = popUser.participating[$scope.participatingIndex];
			$scope.stepId = popUser.participating[$scope.participatingIndex].currentStep;
		// 	console.log("step we send", $scope.stepId)
			QuestFactory.getStepById($scope.stepId).then(function(data){
				$scope.step = data;
			})
		})
	});
	$scope.launchReading = function(){
		chrome.tabs.create({url: "http://"+$scope.step.url});
	}
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		if($scope.step.qType == "Fill-in"){
			console.log("correct question type")
			if($scope.userAnswer == $scope.step.fillIn){
				UserFactory.addPoints($scope.stepId).then(function(data){
					UserFactory.changeCurrentStep($scope.stepId);
					$state.go('success');
				})
			}else{
				//else it will alert user to try again
				$scope.alertshow = true;
			}
		}
		
	};
	
});
'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('success', {
		url: '/success',
		templateUrl: 'js/application/states/success/success.html', 
		controller: 'SuccessCtrl'
	});
});


app.controller('SuccessCtrl', function ($scope, QuestFactory, UserFactory, $state) {
	$scope.continue = function(){
		$state.go('step');
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlF1ZXN0RmFjdG9yeS5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIiwic3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmpzIiwic3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5qcyIsInN0YXRlcy9zdGVwL3N0ZXAuanMiLCJzdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ1F1ZXN0YWNrdWxhckV4dCcsIFsndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCddKTtcblxuYXBwLmNvbnRyb2xsZXIoJ2V4dENvbnQnLCBmdW5jdGlvbigkc2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcbiAgICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93Lm9wZW4oJ2xvY2FsaG9zdDoxMzM3L2F1dGgvZ29vZ2xlJywgJ19ibGFuaycpO1xuICAgIH07XG4gICAgXG4gICAgXG4gICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAkc2NvcGUubmFtZSA9IGRhdGEudXNlci5nb29nbGUubmFtZTtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgIFxuICAgIH07XG4gICAgZ2V0TmFtZSgpO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sIFxuICAgIC8vIHNvIHRoYXQgaXQgZG9lcyBub3QgYWRkIFwidW5zYWZlOlwiICAgXG4gICAgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxtYWlsdG98Y2hyb21lLWV4dGVuc2lvbik6Lyk7XG4gICAgLy8gQW5ndWxhciBiZWZvcmUgdjEuMiB1c2VzICRjb21waWxlUHJvdmlkZXIudXJsU2FuaXRpemF0aW9uV2hpdGVsaXN0KC4uLilcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC52YWx1ZSgnZG9tYWluJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNycpO1xuXG5hcHAuZmFjdG9yeSgnUXVlc3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsIGRvbWFpbikge1xuICAgIGNvbnNvbGUubG9nKFwiZG9tYWluXCIpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNlbmRRdWVzdDogZnVuY3Rpb24ocXVlc3QpIHtcbiAgICAgICAgICAgIC8vc2F2ZXMgdGhlIHF1ZXN0LCByZXR1cm5zIGl0cyBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoZG9tYWluICsgJy9hcGkvcXVlc3RzJywgcXVlc3QpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRBbGxRdWVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdEJ5SWQ6IGZ1bmN0aW9uKHF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvcXVlc3RzLycgKyBxdWVzdElkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBqb2luUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0SW5mbykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoZG9tYWluICsgJy9hcGkvcXVlc3RzL3BhcnRpY2lwYW50cycsIHF1ZXN0SW5mbykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBsZWF2ZVF1ZXN0OiBmdW5jdGlvbihxdWVzdElkKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKGRvbWFpbiArICcvYXBpL3F1ZXN0cy9wYXJ0aWNpcGFudHMvJyArIHF1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlUXVlc3Q6IGZ1bmN0aW9uKHVwZGF0ZWRRdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9xdWVzdHMvOmlkJywgdXBkYXRlZFF1ZXN0KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdHNCeVVzZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldCBhbGwgcXVlc3RzICdvd25lZCcgYnkgdXNlclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMvdXNlci8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAvL3NhdmVzIHRoZSBxdWVzdFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoZG9tYWluICsgJy9hcGkvc3RlcCcsIHN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGVwTGlzdEJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldHMgYSBidW5jaCBvZiBzdGVwcyBieSB0aGVpciBRdWVzdCBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9zdGVwL2xpc3QvJyArIGlkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICByZW1TdGVwOiBmdW5jdGlvbihyZW0pIHtcbiAgICAgICAgICAgIC8vZGVsZXRlIGEgc3RlcC4gb25seSBuZWNlc3NhcnkgaWYgc3RlcCBoYXMgYW4gSUQgXG4gICAgICAgICAgICAvLyhpLmUuLCBzdGVwIGFscmVhZHkgaXMgb24gREIpXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9zdGVwL3JlbS8nLCByZW0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVN0ZXA6IGZ1bmN0aW9uKHVwZGF0ZWRTdGVwKSB7XG4gICAgICAgICAgICAvL21vbmdvb3NlIHNlZW1zIHRvIOCypV/gsqUgd2hlbiB3ZSB0cnkgdG8gcmUtc2F2ZSBhbiBvYmplY3QgaWQuXG4gICAgICAgICAgICAvL1NPIHdlJ3JlIGRvaW5nIGEgZmluZGJ5aWRhbmR1cGRhdGVcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAvdXBkJywgdXBkYXRlZFN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFN0ZXBCeUlkOiBmdW5jdGlvbihzdGVwSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvc3RlcC8nICsgc3RlcElkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBzYXZlU3RlcEl0ZXI6IGZ1bmN0aW9uKHN0ZXAsc3RlcExpc3QpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgc3RlcExpc3QubGVuZ3RoOyByKyspIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbmV3IFE6ICcsIHN0ZXAucXVlc3Rpb24sICcsIG9sZCBROicsIHN0ZXBMaXN0W3JdKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RlcC5xdWVzdGlvbiA9PT0gc3RlcExpc3Rbcl0ucXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy9lcnIhIHF1ZXN0aW9uIGFscmVhZHkgZXhpc3RzIVxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnVGhpcyBzdGVwIGFscmVhZHkgZXhpc3RzISBZb3UgY2FuXFwndCBoYXZlIHRoZSBzYW1lIHN0ZXAgbXVsdGlwbGUgdGltZXMgaW4gdGhlIHNhbWUgcXVlc3QhJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RlcC5xVHlwZSA9PT0gXCJNdWx0aXBsZSBDaG9pY2VcIikge1xuICAgICAgICAgICAgICAgIC8vcHVzaGluZyBhIG11bHRpLWNob2ljZSBxIHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgLy9zbyB3ZSBuZWVkIHRvIHBhcnNlIGFsbCBvZiB0aGUgYW5zd2VyIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBzdGVwLm11bHRpcGxlQW5zID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDE7IG4gPCA1OyBuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RlcFsnYW5zJyArIG5dKTtcbiAgICAgICAgICAgICAgICAgICAgc3RlcC5tdWx0aXBsZUFucy5wdXNoKHN0ZXBbJ2FucycgKyBuXSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzdGVwWydhbnMnICsgbl07XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtdWx0aUFucyBzbyBmYXI6ICcsIHN0ZXAubXVsdGlBbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9naXZlIGVhY2ggc3RlcCBhIG51bWJlciB0byBnbyBieS5cbiAgICAgICAgICAgIHN0ZXAuc3RlcE51bSA9IHN0ZXBMaXN0Lmxlbmd0aCArIDE7XG4gICAgICAgICAgICBzdGVwLnF1ZXN0ID0gJ05PTkUnOyAvL3RoaXMgd2lsbCBnZXQgcmVwbGFjZWQgb25jZSB3ZSBzYXZlIHRoZSBwYXJlbnQgcXVlc3QgYW5kIHJldHJpZXZlIGl0cyBJRC5cblxuICAgICAgICAgICAgdmFyIHNlc2hPYmogPSBbXTtcbiAgICAgICAgICAgIC8vIHZhciBzdGVwc0pzb24gPSBhbmd1bGFyLnRvSnNvbihuZXdTdGVwKTtcblxuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLnN0ZXBTdHIpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMgcXVlc3QgaGFzIHN0ZXBzLCBzbyBiZWZvcmUgd2UgcHVzaCwgd2UgbmVlZCB0byBnZXQgdGhvc2UgZnJvbSB0aGUgc3Muc3RlcFN0ciB2YXJcbiAgICAgICAgICAgICAgICBzZXNoT2JqID0gYW5ndWxhci5mcm9tSnNvbihzZXNzaW9uU3RvcmFnZS5zdGVwU3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlc2hPYmoucHVzaChzdGVwKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuY29weShzZXNoT2JqLCBzdGVwTGlzdCk7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zdGVwU3RyID0gYW5ndWxhci50b0pzb24oc2VzaE9iaik7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2Vzc2lvblN0b3JhZ2Uuc3RlcFN0ciBjdXJyZW50bHkgaGFzOiBcIiwgc2Vzc2lvblN0b3JhZ2Uuc3RlcFN0cik7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuY29weShhbmd1bGFyLmZyb21Kc29uKHNlc3Npb25TdG9yYWdlLnN0ZXBTdHIpLCBzdGVwTGlzdCk7XG4gICAgICAgICAgICByZXR1cm4gc3RlcExpc3Q7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnVXNlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdHJldHVybntcblx0XHRnZXRVc2VySW5mbzogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uJykudGhlbiggZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdHJldHVybiByZXMuZGF0YTtcbiAgIFx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0VXNlckZyb21EYjogZnVuY3Rpb24gKHVzZXJJZCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ1c2VySWRcIiwgdXNlcklkKTtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvdXNlcnMvJyArIHVzZXJJZCkudGhlbihmdW5jdGlvbiAoZGJVc2VyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZGJVc2VyXCIsIGRiVXNlcik7XG5cdFx0XHRcdHJldHVybiBkYlVzZXIuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y2hhbmdlQ3VycmVudFN0ZXA6IGZ1bmN0aW9uKHN0ZXBJZCl7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJjaGFuZ2VDdXJyZW50U3RlcCBsYXVuY2hlZFwiKTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvdXNlcnMvcGFydGljaXBhdGluZy9jdXJyZW50U3RlcC8nK3N0ZXBJZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRQb2ludHM6IGZ1bmN0aW9uKHN0ZXBJZCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzL3BvaW50cy8nK3N0ZXBJZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgXHRjb25zb2xlLmxvZyhcInBvaW50c1wiLCByZXMuZGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXHR9XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBhIFF1ZXN0Jywgc3RhdGU6ICdjcmVhdGUucXVlc3QnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnSm9pbiBhIFF1ZXN0Jywgc3RhdGU6ICdob21lJyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFF1ZXN0cycsIHN0YXRlOiAnTXlRdWVzdHMnIFxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IGRhdGEudXNlcjtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0TmFtZSgpO1xuXG4gICAgICAgICAgICAvLyBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGNhbGxlZCcpO1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICRzdGF0ZS5nbygnc3RhcnQnKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdteVF1ZXN0cycsIHtcbiAgICBcbiAgICB1cmw6ICcvbXlRdWVzdHMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL215UXVlc3RzL215UXVlc3RzLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnTXlRdWVzdHNDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ015UXVlc3RzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcbiAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uICh1c2VySW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwidXNlckluZm9cIiwgdXNlckluZm8pO1xuICAgIHZhciBpZCA9IHVzZXJJbmZvLnVzZXIuX2lkO1xuICAgIFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIoaWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIGZyb20gREJcIiwgZGJVc2VyKTtcbiAgICAgICRzY29wZS51c2VyID0gZGJVc2VyO1xuICAgICAgaWYgKGRiVXNlci5wYXJ0aWNpcGF0aW5nLmxlbmd0aCkgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IGRiVXNlci5wYXJ0aWNpcGF0aW5nO1xuICAgICAgZWxzZSAkc2NvcGUubm9QYXJ0aWNpcGF0aW5nUXVlc3RzID0gXCJZb3UgaGF2ZW4ndCBqb2luZWQgYW55IHF1ZXN0cyB5ZXQuXCJcbiAgICAgIGNvbnNvbGUubG9nKFwicXVlc3Qgam9pbmVkXCIsICRzY29wZS5xdWVzdHNKb2luZWRbMF0ucXVlc3RJZCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5oZWxsbyA9IFwiaGVsbG8hXCI7XG5cbiAgLy8gJHNjb3BlLmxlYXZlUXVlc3QgPSBmdW5jdGlvbiAocXVlc3RJZCwgdXNlcklkKSB7XG4gIC8vICAgLy8gcmVtb3ZlcyB1c2VyIGZyb20gcXVlc3QgYW5kIHF1ZXN0IGZyb20gdXNlciBpbiBkYlxuICAvLyAgIC8vIFF1ZXN0RmFjdG9yeS5sZWF2ZVF1ZXN0KHF1ZXN0SWQsIHVzZXJJZCk7IFxuICAvLyAgIFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gIC8vICAgICAkc2NvcGUucXVlc3RzSm9pbmVkID0gdXNlci5wYXJ0aWNpcGF0aW5nO1xuICAvLyAgIH0pO1xuICAvLyB9O1xuICAkc2NvcGUuY29udGludWVRdWVzdCA9IGZ1bmN0aW9uKHBhcnRpY2lwYXRpbmdJbmRleCl7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwYXJ0aWNpcGF0aW5nSW5kZXhcIiwgcGFydGljaXBhdGluZ0luZGV4KTtcbiAgICAkc3RhdGUuZ28oXCJzdGVwXCIpO1xuICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgdXJsOiAnLycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvaG9tZS9ob21lLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICRzY29wZS5zdGF0ZXMgPSBbe1xuICAgIHN0YXRlOiBcImxlYWRlckJvYXJkXCIsIHRpdGxlOiBcIkxlYWRlciBCb2FyZFwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJwcm9maWxlXCIsIHRpdGxlOiBcIlByb2ZpbGVcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwiam9pblwiLCB0aXRsZTogXCJKb2luIEEgUXVlc3RcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwibXlRdWVzdHNcIiwgdGl0bGU6IFwiTXkgUXVlc3RzXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcInN0ZXBcIiwgdGl0bGU6IFwiVGVtcG9yYXJ5IFN0ZXAgQnV0dG9uXCJcbiAgfV07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnam9pbicsIHtcbiAgICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9qb2luL2pvaW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0pvaW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBBdXRoU2VydmljZSl7XG4gICAgJHNjb3BlLmFsZXJ0cyA9IFtcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtZGFuZ2VyJywgbXNnOiAnWW91IGFyZSBhbHJlYWR5IHBhcnRpY2lwYXRpbmcgaW4gdGhpcyBxdWVzdC4nLCBzaG93OiBmYWxzZSB9LFxuICAgICAgICB7IHR5cGU6ICdhbGVydC1zdWNjZXNzJywgbXNnOiAnWW91XFwndmUgc3VjY2Vzc2Z1bGx5IGpvaW5lZCB0aGUgcXVlc3QuJywgc2hvdzogZmFsc2UgfVxuICAgIF07XG5cbiAgICBRdWVzdEZhY3RvcnkuZ2V0QWxsUXVlc3RzKCkudGhlbihmdW5jdGlvbihxdWVzdHMpIHtcbiAgICAgICAgJHNjb3BlLnF1ZXN0cyA9IHF1ZXN0czsgLy8gJHNjb3BlLnVuam9pbmVkUXVlc3RzIFxuICAgIH0pO1xuICAgICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICAkc2NvcGUuc2VhcmNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghJHNjb3BlLnNlYXJjaEJveCkgJHNjb3BlLnNlYXJjaEJveCA9IHRydWU7XG4gICAgICAgIGVsc2UgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICAkc2NvcGUuam9pblF1ZXN0ID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdFwiLCBxdWVzdCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJJZCA9IHVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBqb2luZWQsIGRvIHNvbWV0aGluZ1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHNcIiwgcXVlc3QucGFydGljaXBhbnRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5faWRcIiwgdXNlci5faWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcblxuICAgICAgICAgICAgaWYgKHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gc2hvdyBhbGVydFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzBdLnNob3cpICRzY29wZS5hbGVydHNbMF0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXN0LnBhcnRpY2lwYW50cy5wdXNoKCRzY29wZS51c2VySWQpO1xuICAgICAgICAgICAgICAgIFF1ZXN0RmFjdG9yeS5qb2luUXVlc3QocXVlc3QpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzBdLnNob3cpICRzY29wZS5hbGVydHNbMF0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2xvc2VBbGVydCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICRzY29wZS5hbGVydHNbaW5kZXhdLnNob3cgPSBmYWxzZTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGVhZGVyQm9hcmQnLCB7XG5cdFx0dXJsOiAnL2xlYWRlckJvYXJkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9sZWFkZXJCb2FyZC9sZWFkZXJCb2FyZC5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ0xlYWRlckJvYXJkQ3RybCdcblx0fSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTGVhZGVyQm9hcmRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuXHR2YXIgbiA9IDIwIC8vIGdldCBudW1iZXIgb2YgdXNlcnMgZnJvbSBkYjtcblx0JHNjb3BlLmxiID0ge307XG5cdCRzY29wZS5sYi5yYW5rTnVtcyA9IFtdO1xuXHRmb3IgKHZhciBpID0gMTsgaSA8PSBuOyBpKyspIHtcblx0XHQkc2NvcGUucmFua051bXMucHVzaChpKTtcblx0fVxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICBcbiAgICB1cmw6ICcvcHJvZmlsZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvcHJvZmlsZS9wcm9maWxlLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSkge1xuICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24gKHVzZXJJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJ1c2VySW5mb1wiLCB1c2VySW5mbyk7XG4gICAgJHNjb3BlLmZ1bGxuYW1lID0gdXNlckluZm8udXNlci5nb29nbGUubmFtZTtcbiAgICAkc2NvcGUuZW1haWwgPSB1c2VySW5mby51c2VyLmdvb2dsZS5lbWFpbDtcbiAgfSk7XG5cbiAgJHNjb3BlLmhlbGxvID0gXCJoZWxsbyFcIjtcblxuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3RlcCcsIHtcblx0XHR1cmw6ICcvc3RlcCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3RlcC9zdGVwLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnU3RlcEN0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N0ZXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cdCRzY29wZS5hbGVydHNob3cgPSBmYWxzZTtcblxuXHQkc2NvcGUucGFydGljaXBhdGluZ0luZGV4PSBOdW1iZXIobG9jYWxTdG9yYWdlW1wicGFydGljaXBhdGluZ0luZGV4XCJdKTtcblxuXHRVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odW5Qb3BVc2VyKXtcblx0XHRVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKHVuUG9wVXNlci51c2VyLl9pZCkudGhlbihmdW5jdGlvbihwb3BVc2VyKXtcblx0XHRcdCRzY29wZS5jaG9zZW5RdWVzdCA9IHBvcFVzZXIucGFydGljaXBhdGluZ1skc2NvcGUucGFydGljaXBhdGluZ0luZGV4XTtcblx0XHRcdCRzY29wZS5zdGVwSWQgPSBwb3BVc2VyLnBhcnRpY2lwYXRpbmdbJHNjb3BlLnBhcnRpY2lwYXRpbmdJbmRleF0uY3VycmVudFN0ZXA7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZyhcInN0ZXAgd2Ugc2VuZFwiLCAkc2NvcGUuc3RlcElkKVxuXHRcdFx0UXVlc3RGYWN0b3J5LmdldFN0ZXBCeUlkKCRzY29wZS5zdGVwSWQpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdCRzY29wZS5zdGVwID0gZGF0YTtcblx0XHRcdH0pXG5cdFx0fSlcblx0fSk7XG5cdCRzY29wZS5sYXVuY2hSZWFkaW5nID0gZnVuY3Rpb24oKXtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe3VybDogXCJodHRwOi8vXCIrJHNjb3BlLnN0ZXAudXJsfSk7XG5cdH1cblx0JHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG5cdFx0Ly93aWxsIHZlcmlmeSB0aGF0IHRoZSBhbnN3ZXIgaXMgY29ycmVjdFxuXHRcdC8vaWYgc28gd2lsbCB1cGRhdGUgY3VycmVudCBzdGVwIHRvIGJlIHRoZSBuZXh0IHN0ZXBcblx0XHQvL2FuZCBzZW5kIHVzZXIgdG8gc3VjY2VzcyBwYWdlXG5cdFx0aWYoJHNjb3BlLnN0ZXAucVR5cGUgPT0gXCJGaWxsLWluXCIpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjb3JyZWN0IHF1ZXN0aW9uIHR5cGVcIilcblx0XHRcdGlmKCRzY29wZS51c2VyQW5zd2VyID09ICRzY29wZS5zdGVwLmZpbGxJbil7XG5cdFx0XHRcdFVzZXJGYWN0b3J5LmFkZFBvaW50cygkc2NvcGUuc3RlcElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdFVzZXJGYWN0b3J5LmNoYW5nZUN1cnJlbnRTdGVwKCRzY29wZS5zdGVwSWQpO1xuXHRcdFx0XHRcdCRzdGF0ZS5nbygnc3VjY2VzcycpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdC8vZWxzZSBpdCB3aWxsIGFsZXJ0IHVzZXIgdG8gdHJ5IGFnYWluXG5cdFx0XHRcdCRzY29wZS5hbGVydHNob3cgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fTtcblx0XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VjY2VzcycsIHtcblx0XHR1cmw6ICcvc3VjY2VzcycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnU3VjY2Vzc0N0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N1Y2Nlc3NDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cdCRzY29wZS5jb250aW51ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0JHN0YXRlLmdvKCdzdGVwJyk7XG5cdH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=