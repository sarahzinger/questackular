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
            return $http.delete(domain + '/api/quests/participants/'+questId).then(function(response) {
                console.log(response);
            });
        },
        updateQuest: function(updatedQuest){
            return $http.post(domain + '/api/quests/upd',updatedQuest).then(function(res){
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
        remStep: function(rem){
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.post(domain + '/api/step/rem/',rem).then(function(res){
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post(domain + '/api/step/upd',updatedStep).then(function(res){
                return res.data;
            });
        },
        getStepById: function(stepId){
            return $http.get(domain + '/api/step/'+stepId).then(function(res){
                return res.data;
            });
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
				UserFactory.changeCurrentStep($scope.stepId);
				$state.go('success');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlF1ZXN0RmFjdG9yeS5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIiwic3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmpzIiwic3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5qcyIsInN0YXRlcy9zdGVwL3N0ZXAuanMiLCJzdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdRdWVzdGFja3VsYXJFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnXSk7XG5cbmFwcC5jb250cm9sbGVyKCdleHRDb250JywgZnVuY3Rpb24oJHNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG4gICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgJHNjb3BlLm5hbWUgPSBkYXRhLnVzZXIuZ29vZ2xlLm5hbWU7XG4gICAgICAgICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICBcbiAgICB9O1xuICAgIGdldE5hbWUoKTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuXG4gICAgLy8gd2hpdGVsaXN0IHRoZSBjaHJvbWUtZXh0ZW5zaW9uOiBwcm90b2NvbCBcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIiAgIFxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgIC8vIEFuZ3VsYXIgYmVmb3JlIHYxLjIgdXNlcyAkY29tcGlsZVByb3ZpZGVyLnVybFNhbml0aXphdGlvbldoaXRlbGlzdCguLi4pXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAudmFsdWUoJ2RvbWFpbicsICdodHRwOi8vbG9jYWxob3N0OjEzMzcnKTtcblxuYXBwLmZhY3RvcnkoJ1F1ZXN0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCBkb21haW4pIHtcbiAgICBjb25zb2xlLmxvZyhcImRvbWFpblwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzZW5kUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgICAgICAgICAvL3NhdmVzIHRoZSBxdWVzdCwgcmV0dXJucyBpdHMgSURcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3F1ZXN0cycsIHF1ZXN0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0QWxsUXVlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvcXVlc3RzJykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UXVlc3RCeUlkOiBmdW5jdGlvbihxdWVzdElkKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArICcvYXBpL3F1ZXN0cy8nICsgcXVlc3RJZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgam9pblF1ZXN0OiBmdW5jdGlvbihxdWVzdEluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3F1ZXN0cy9wYXJ0aWNpcGFudHMnLCBxdWVzdEluZm8pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGVhdmVRdWVzdDogZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShkb21haW4gKyAnL2FwaS9xdWVzdHMvcGFydGljaXBhbnRzLycrcXVlc3RJZCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVRdWVzdDogZnVuY3Rpb24odXBkYXRlZFF1ZXN0KXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3F1ZXN0cy91cGQnLHVwZGF0ZWRRdWVzdCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdHNCeVVzZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldCBhbGwgcXVlc3RzICdvd25lZCcgYnkgdXNlclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMvdXNlci8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAvL3NhdmVzIHRoZSBxdWVzdFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoZG9tYWluICsgJy9hcGkvc3RlcCcsIHN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGVwTGlzdEJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldHMgYSBidW5jaCBvZiBzdGVwcyBieSB0aGVpciBRdWVzdCBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9zdGVwL2xpc3QvJyArIGlkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICByZW1TdGVwOiBmdW5jdGlvbihyZW0pe1xuICAgICAgICAgICAgLy9kZWxldGUgYSBzdGVwLiBvbmx5IG5lY2Vzc2FyeSBpZiBzdGVwIGhhcyBhbiBJRCBcbiAgICAgICAgICAgIC8vKGkuZS4sIHN0ZXAgYWxyZWFkeSBpcyBvbiBEQilcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAvcmVtLycscmVtKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVN0ZXA6IGZ1bmN0aW9uKHVwZGF0ZWRTdGVwKSB7XG4gICAgICAgICAgICAvL21vbmdvb3NlIHNlZW1zIHRvIOCypV/gsqUgd2hlbiB3ZSB0cnkgdG8gcmUtc2F2ZSBhbiBvYmplY3QgaWQuXG4gICAgICAgICAgICAvL1NPIHdlJ3JlIGRvaW5nIGEgZmluZGJ5aWRhbmR1cGRhdGVcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAvdXBkJyx1cGRhdGVkU3RlcCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGVwQnlJZDogZnVuY3Rpb24oc3RlcElkKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvc3RlcC8nK3N0ZXBJZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm57XG5cdFx0Z2V0VXNlckluZm86IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvbicpLnRoZW4oIGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRyZXR1cm4gcmVzLmRhdGE7XG4gICBcdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldFVzZXJGcm9tRGI6IGZ1bmN0aW9uICh1c2VySWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwidXNlcklkXCIsIHVzZXJJZCk7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzLycgKyB1c2VySWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImRiVXNlclwiLCBkYlVzZXIpO1xuXHRcdFx0XHRyZXR1cm4gZGJVc2VyLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNoYW5nZUN1cnJlbnRTdGVwOiBmdW5jdGlvbihzdGVwSWQpe1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwiY2hhbmdlQ3VycmVudFN0ZXAgbGF1bmNoZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzL3BhcnRpY2lwYXRpbmcvY3VycmVudFN0ZXAvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXHR9XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBhIFF1ZXN0Jywgc3RhdGU6ICdjcmVhdGUucXVlc3QnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnSm9pbiBhIFF1ZXN0Jywgc3RhdGU6ICdob21lJyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFF1ZXN0cycsIHN0YXRlOiAnTXlRdWVzdHMnIFxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IGRhdGEudXNlcjtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0TmFtZSgpO1xuXG4gICAgICAgICAgICAvLyBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGNhbGxlZCcpO1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICRzdGF0ZS5nbygnc3RhcnQnKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdteVF1ZXN0cycsIHtcbiAgICBcbiAgICB1cmw6ICcvbXlRdWVzdHMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL215UXVlc3RzL215UXVlc3RzLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnTXlRdWVzdHNDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ015UXVlc3RzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcbiAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uICh1c2VySW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwidXNlckluZm9cIiwgdXNlckluZm8pO1xuICAgIHZhciBpZCA9IHVzZXJJbmZvLnVzZXIuX2lkO1xuICAgIFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIoaWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIGZyb20gREJcIiwgZGJVc2VyKTtcbiAgICAgICRzY29wZS51c2VyID0gZGJVc2VyO1xuICAgICAgaWYgKGRiVXNlci5wYXJ0aWNpcGF0aW5nLmxlbmd0aCkgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IGRiVXNlci5wYXJ0aWNpcGF0aW5nO1xuICAgICAgZWxzZSAkc2NvcGUubm9QYXJ0aWNpcGF0aW5nUXVlc3RzID0gXCJZb3UgaGF2ZW4ndCBqb2luZWQgYW55IHF1ZXN0cyB5ZXQuXCJcbiAgICAgIGNvbnNvbGUubG9nKFwicXVlc3Qgam9pbmVkXCIsICRzY29wZS5xdWVzdHNKb2luZWRbMF0ucXVlc3RJZCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5oZWxsbyA9IFwiaGVsbG8hXCI7XG5cbiAgLy8gJHNjb3BlLmxlYXZlUXVlc3QgPSBmdW5jdGlvbiAocXVlc3RJZCwgdXNlcklkKSB7XG4gIC8vICAgLy8gcmVtb3ZlcyB1c2VyIGZyb20gcXVlc3QgYW5kIHF1ZXN0IGZyb20gdXNlciBpbiBkYlxuICAvLyAgIC8vIFF1ZXN0RmFjdG9yeS5sZWF2ZVF1ZXN0KHF1ZXN0SWQsIHVzZXJJZCk7IFxuICAvLyAgIFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gIC8vICAgICAkc2NvcGUucXVlc3RzSm9pbmVkID0gdXNlci5wYXJ0aWNpcGF0aW5nO1xuICAvLyAgIH0pO1xuICAvLyB9O1xuICAkc2NvcGUuY29udGludWVRdWVzdCA9IGZ1bmN0aW9uKHBhcnRpY2lwYXRpbmdJbmRleCl7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwYXJ0aWNpcGF0aW5nSW5kZXhcIiwgcGFydGljaXBhdGluZ0luZGV4KTtcbiAgICAkc3RhdGUuZ28oXCJzdGVwXCIpO1xuICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgdXJsOiAnLycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvaG9tZS9ob21lLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICRzY29wZS5zdGF0ZXMgPSBbe1xuICAgIHN0YXRlOiBcImxlYWRlckJvYXJkXCIsIHRpdGxlOiBcIkxlYWRlciBCb2FyZFwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJwcm9maWxlXCIsIHRpdGxlOiBcIlByb2ZpbGVcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwiam9pblwiLCB0aXRsZTogXCJKb2luIEEgUXVlc3RcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwibXlRdWVzdHNcIiwgdGl0bGU6IFwiTXkgUXVlc3RzXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcInN0ZXBcIiwgdGl0bGU6IFwiVGVtcG9yYXJ5IFN0ZXAgQnV0dG9uXCJcbiAgfV07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnam9pbicsIHtcbiAgICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9qb2luL2pvaW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0pvaW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBBdXRoU2VydmljZSl7XG4gICAgJHNjb3BlLmFsZXJ0cyA9IFtcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtZGFuZ2VyJywgbXNnOiAnWW91IGFyZSBhbHJlYWR5IHBhcnRpY2lwYXRpbmcgaW4gdGhpcyBxdWVzdC4nLCBzaG93OiBmYWxzZSB9LFxuICAgICAgICB7IHR5cGU6ICdhbGVydC1zdWNjZXNzJywgbXNnOiAnWW91XFwndmUgc3VjY2Vzc2Z1bGx5IGpvaW5lZCB0aGUgcXVlc3QuJywgc2hvdzogZmFsc2UgfVxuICAgIF07XG5cbiAgICBRdWVzdEZhY3RvcnkuZ2V0QWxsUXVlc3RzKCkudGhlbihmdW5jdGlvbihxdWVzdHMpIHtcbiAgICAgICAgJHNjb3BlLnF1ZXN0cyA9IHF1ZXN0czsgLy8gJHNjb3BlLnVuam9pbmVkUXVlc3RzIFxuICAgIH0pO1xuICAgICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICAkc2NvcGUuc2VhcmNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghJHNjb3BlLnNlYXJjaEJveCkgJHNjb3BlLnNlYXJjaEJveCA9IHRydWU7XG4gICAgICAgIGVsc2UgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICAkc2NvcGUuam9pblF1ZXN0ID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdFwiLCBxdWVzdCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJJZCA9IHVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBqb2luZWQsIGRvIHNvbWV0aGluZ1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHNcIiwgcXVlc3QucGFydGljaXBhbnRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5faWRcIiwgdXNlci5faWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcblxuICAgICAgICAgICAgaWYgKHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gc2hvdyBhbGVydFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzBdLnNob3cpICRzY29wZS5hbGVydHNbMF0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXN0LnBhcnRpY2lwYW50cy5wdXNoKCRzY29wZS51c2VySWQpO1xuICAgICAgICAgICAgICAgIFF1ZXN0RmFjdG9yeS5qb2luUXVlc3QocXVlc3QpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzBdLnNob3cpICRzY29wZS5hbGVydHNbMF0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2xvc2VBbGVydCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICRzY29wZS5hbGVydHNbaW5kZXhdLnNob3cgPSBmYWxzZTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGVhZGVyQm9hcmQnLCB7XG5cdFx0dXJsOiAnL2xlYWRlckJvYXJkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9sZWFkZXJCb2FyZC9sZWFkZXJCb2FyZC5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ0xlYWRlckJvYXJkQ3RybCdcblx0fSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTGVhZGVyQm9hcmRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuXHR2YXIgbiA9IDIwIC8vIGdldCBudW1iZXIgb2YgdXNlcnMgZnJvbSBkYjtcblx0JHNjb3BlLmxiID0ge307XG5cdCRzY29wZS5sYi5yYW5rTnVtcyA9IFtdO1xuXHRmb3IgKHZhciBpID0gMTsgaSA8PSBuOyBpKyspIHtcblx0XHQkc2NvcGUucmFua051bXMucHVzaChpKTtcblx0fVxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICBcbiAgICB1cmw6ICcvcHJvZmlsZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvcHJvZmlsZS9wcm9maWxlLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSkge1xuICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24gKHVzZXJJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJ1c2VySW5mb1wiLCB1c2VySW5mbyk7XG4gICAgJHNjb3BlLmZ1bGxuYW1lID0gdXNlckluZm8udXNlci5nb29nbGUubmFtZTtcbiAgICAkc2NvcGUuZW1haWwgPSB1c2VySW5mby51c2VyLmdvb2dsZS5lbWFpbDtcbiAgfSk7XG5cbiAgJHNjb3BlLmhlbGxvID0gXCJoZWxsbyFcIjtcblxuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3RlcCcsIHtcblx0XHR1cmw6ICcvc3RlcCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3RlcC9zdGVwLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnU3RlcEN0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N0ZXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cdCRzY29wZS5hbGVydHNob3cgPSBmYWxzZTtcblxuXHQkc2NvcGUucGFydGljaXBhdGluZ0luZGV4PSBOdW1iZXIobG9jYWxTdG9yYWdlW1wicGFydGljaXBhdGluZ0luZGV4XCJdKTtcblxuXHRVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odW5Qb3BVc2VyKXtcblx0XHRVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKHVuUG9wVXNlci51c2VyLl9pZCkudGhlbihmdW5jdGlvbihwb3BVc2VyKXtcblx0XHRcdCRzY29wZS5jaG9zZW5RdWVzdCA9IHBvcFVzZXIucGFydGljaXBhdGluZ1skc2NvcGUucGFydGljaXBhdGluZ0luZGV4XTtcblx0XHRcdCRzY29wZS5zdGVwSWQgPSBwb3BVc2VyLnBhcnRpY2lwYXRpbmdbJHNjb3BlLnBhcnRpY2lwYXRpbmdJbmRleF0uY3VycmVudFN0ZXA7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZyhcInN0ZXAgd2Ugc2VuZFwiLCAkc2NvcGUuc3RlcElkKVxuXHRcdFx0UXVlc3RGYWN0b3J5LmdldFN0ZXBCeUlkKCRzY29wZS5zdGVwSWQpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdCRzY29wZS5zdGVwID0gZGF0YTtcblx0XHRcdH0pXG5cdFx0fSlcblx0fSk7XG5cdCRzY29wZS5sYXVuY2hSZWFkaW5nID0gZnVuY3Rpb24oKXtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe3VybDogXCJodHRwOi8vXCIrJHNjb3BlLnN0ZXAudXJsfSk7XG5cdH1cblx0JHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG5cdFx0Ly93aWxsIHZlcmlmeSB0aGF0IHRoZSBhbnN3ZXIgaXMgY29ycmVjdFxuXHRcdC8vaWYgc28gd2lsbCB1cGRhdGUgY3VycmVudCBzdGVwIHRvIGJlIHRoZSBuZXh0IHN0ZXBcblx0XHQvL2FuZCBzZW5kIHVzZXIgdG8gc3VjY2VzcyBwYWdlXG5cdFx0aWYoJHNjb3BlLnN0ZXAucVR5cGUgPT0gXCJGaWxsLWluXCIpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjb3JyZWN0IHF1ZXN0aW9uIHR5cGVcIilcblx0XHRcdGlmKCRzY29wZS51c2VyQW5zd2VyID09ICRzY29wZS5zdGVwLmZpbGxJbil7XG5cdFx0XHRcdFVzZXJGYWN0b3J5LmNoYW5nZUN1cnJlbnRTdGVwKCRzY29wZS5zdGVwSWQpO1xuXHRcdFx0XHQkc3RhdGUuZ28oJ3N1Y2Nlc3MnKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQvL2Vsc2UgaXQgd2lsbCBhbGVydCB1c2VyIHRvIHRyeSBhZ2FpblxuXHRcdFx0XHQkc2NvcGUuYWxlcnRzaG93ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdH07XG5cdFxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Y2Nlc3MnLCB7XG5cdFx0dXJsOiAnL3N1Y2Nlc3MnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3N1Y2Nlc3Mvc3VjY2Vzcy5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ1N1Y2Nlc3NDdHJsJ1xuXHR9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTdWNjZXNzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXHQkc2NvcGUuY29udGludWUgPSBmdW5jdGlvbigpe1xuXHRcdCRzdGF0ZS5nbygnc3RlcCcpO1xuXHR9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9