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


app.controller('MyQuestsCtrl', function ($scope, UserFactory) {
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
	//how do we keep track of the chosen Quest? Can we inject it somehow?
	//assuming we know what the Quest is....

	UserFactory.getUserInfo().then(function(unPopUser){
		UserFactory.getUserFromDb(unPopUser.user._id).then(function(popUser){
			$scope.chosenQuest = popUser.participating[0];
			$scope.stepId = popUser.participating[0].currentStep;
		// 	console.log("step we send", $scope.stepId)
			QuestFactory.getStepById($scope.stepId).then(function(data){
				$scope.step = data
			})
		})
	});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlF1ZXN0RmFjdG9yeS5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIiwic3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmpzIiwic3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5qcyIsInN0YXRlcy9zdGVwL3N0ZXAuanMiLCJzdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnUXVlc3RhY2t1bGFyRXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJ10pO1xuXG5hcHAuY29udHJvbGxlcignZXh0Q29udCcsIGZ1bmN0aW9uKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gZGF0YS51c2VyLmdvb2dsZS5uYW1lO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfTtcbiAgICBnZXROYW1lKCk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2wgXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCIgICBcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBBbmd1bGFyIGJlZm9yZSB2MS4yIHVzZXMgJGNvbXBpbGVQcm92aWRlci51cmxTYW5pdGl6YXRpb25XaGl0ZWxpc3QoLi4uKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLnZhbHVlKCdkb21haW4nLCAnaHR0cDovL2xvY2FsaG9zdDoxMzM3Jyk7XG5cbmFwcC5mYWN0b3J5KCdRdWVzdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgZG9tYWluKSB7XG4gICAgY29uc29sZS5sb2coXCJkb21haW5cIik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VuZFF1ZXN0OiBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICAgICAgLy9zYXZlcyB0aGUgcXVlc3QsIHJldHVybnMgaXRzIElEXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9xdWVzdHMnLCBxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEFsbFF1ZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArICcvYXBpL3F1ZXN0cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0QnlJZDogZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMvJyArIHF1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGpvaW5RdWVzdDogZnVuY3Rpb24ocXVlc3RJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9xdWVzdHMvcGFydGljaXBhbnRzJywgcXVlc3RJbmZvKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxlYXZlUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoZG9tYWluICsgJy9hcGkvcXVlc3RzL3BhcnRpY2lwYW50cy8nK3F1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlUXVlc3Q6IGZ1bmN0aW9uKHVwZGF0ZWRRdWVzdCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9xdWVzdHMvdXBkJyx1cGRhdGVkUXVlc3QpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UXVlc3RzQnlVc2VyOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgLy9nZXQgYWxsIHF1ZXN0cyAnb3duZWQnIGJ5IHVzZXJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvcXVlc3RzL3VzZXIvJyArIGlkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBzZW5kU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgLy9zYXZlcyB0aGUgcXVlc3RcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAnLCBzdGVwKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U3RlcExpc3RCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgLy9nZXRzIGEgYnVuY2ggb2Ygc3RlcHMgYnkgdGhlaXIgUXVlc3QgSURcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvc3RlcC9saXN0LycgKyBpZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtU3RlcDogZnVuY3Rpb24ocmVtKXtcbiAgICAgICAgICAgIC8vZGVsZXRlIGEgc3RlcC4gb25seSBuZWNlc3NhcnkgaWYgc3RlcCBoYXMgYW4gSUQgXG4gICAgICAgICAgICAvLyhpLmUuLCBzdGVwIGFscmVhZHkgaXMgb24gREIpXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9zdGVwL3JlbS8nLHJlbSkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVTdGVwOiBmdW5jdGlvbih1cGRhdGVkU3RlcCkge1xuICAgICAgICAgICAgLy9tb25nb29zZSBzZWVtcyB0byDgsqVf4LKlIHdoZW4gd2UgdHJ5IHRvIHJlLXNhdmUgYW4gb2JqZWN0IGlkLlxuICAgICAgICAgICAgLy9TTyB3ZSdyZSBkb2luZyBhIGZpbmRieWlkYW5kdXBkYXRlXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9zdGVwL3VwZCcsdXBkYXRlZFN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U3RlcEJ5SWQ6IGZ1bmN0aW9uKHN0ZXBJZCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArICcvYXBpL3N0ZXAvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJue1xuXHRcdGdldFVzZXJJbmZvOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb24nKS50aGVuKCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0cmV0dXJuIHJlcy5kYXRhO1xuICAgXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRVc2VyRnJvbURiOiBmdW5jdGlvbiAodXNlcklkKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInVzZXJJZFwiLCB1c2VySWQpO1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS91c2Vycy8nICsgdXNlcklkKS50aGVuKGZ1bmN0aW9uIChkYlVzZXIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJkYlVzZXJcIiwgZGJVc2VyKTtcblx0XHRcdFx0cmV0dXJuIGRiVXNlci5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjaGFuZ2VDdXJyZW50U3RlcDogZnVuY3Rpb24oc3RlcElkKXtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcImNoYW5nZUN1cnJlbnRTdGVwIGxhdW5jaGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS91c2Vycy9wYXJ0aWNpcGF0aW5nL2N1cnJlbnRTdGVwLycrc3RlcElkKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblx0fVxufSkiLCIndXNlIHN0cmljdCc7XG5cblxuYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDcmVhdGUgYSBRdWVzdCcsIHN0YXRlOiAnY3JlYXRlLnF1ZXN0JyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0pvaW4gYSBRdWVzdCcsIHN0YXRlOiAnaG9tZScgXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBRdWVzdHMnLCBzdGF0ZTogJ015UXVlc3RzJyBcbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5hbWUoKTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ2xvZ291dCBjYWxsZWQnKTtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAkc3RhdGUuZ28oJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbXlRdWVzdHMnLCB7XG4gICAgXG4gICAgdXJsOiAnL215UXVlc3RzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9teVF1ZXN0cy9teVF1ZXN0cy5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ015UXVlc3RzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdNeVF1ZXN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSkge1xuICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24gKHVzZXJJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJ1c2VySW5mb1wiLCB1c2VySW5mbyk7XG4gICAgdmFyIGlkID0gdXNlckluZm8udXNlci5faWQ7XG4gICAgVXNlckZhY3RvcnkuZ2V0VXNlckZyb21EYihpZCkudGhlbihmdW5jdGlvbiAoZGJVc2VyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInVzZXIgZnJvbSBEQlwiLCBkYlVzZXIpO1xuICAgICAgJHNjb3BlLnVzZXIgPSBkYlVzZXI7XG4gICAgICBpZiAoZGJVc2VyLnBhcnRpY2lwYXRpbmcubGVuZ3RoKSAkc2NvcGUucXVlc3RzSm9pbmVkID0gZGJVc2VyLnBhcnRpY2lwYXRpbmc7XG4gICAgICBlbHNlICRzY29wZS5ub1BhcnRpY2lwYXRpbmdRdWVzdHMgPSBcIllvdSBoYXZlbid0IGpvaW5lZCBhbnkgcXVlc3RzIHlldC5cIlxuICAgICAgY29uc29sZS5sb2coXCJxdWVzdCBqb2luZWRcIiwgJHNjb3BlLnF1ZXN0c0pvaW5lZFswXS5xdWVzdElkKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmhlbGxvID0gXCJoZWxsbyFcIjtcblxuICAvLyAkc2NvcGUubGVhdmVRdWVzdCA9IGZ1bmN0aW9uIChxdWVzdElkLCB1c2VySWQpIHtcbiAgLy8gICAvLyByZW1vdmVzIHVzZXIgZnJvbSBxdWVzdCBhbmQgcXVlc3QgZnJvbSB1c2VyIGluIGRiXG4gIC8vICAgLy8gUXVlc3RGYWN0b3J5LmxlYXZlUXVlc3QocXVlc3RJZCwgdXNlcklkKTsgXG4gIC8vICAgVXNlckZhY3RvcnkuZ2V0VXNlckZyb21EYigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgLy8gICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gIC8vICAgfSk7XG4gIC8vIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICB1cmw6ICcvJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9ob21lL2hvbWUuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgJHNjb3BlLnN0YXRlcyA9IFt7XG4gICAgc3RhdGU6IFwibGVhZGVyQm9hcmRcIiwgdGl0bGU6IFwiTGVhZGVyIEJvYXJkXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcInByb2ZpbGVcIiwgdGl0bGU6IFwiUHJvZmlsZVwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJqb2luXCIsIHRpdGxlOiBcIkpvaW4gQSBRdWVzdFwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJteVF1ZXN0c1wiLCB0aXRsZTogXCJNeSBRdWVzdHNcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwic3RlcFwiLCB0aXRsZTogXCJUZW1wb3JhcnkgU3RlcCBCdXR0b25cIlxuICB9XTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdqb2luJywge1xuICAgICAgICB1cmw6ICcvam9pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2pvaW4vam9pbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0pvaW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSm9pbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIEF1dGhTZXJ2aWNlKXtcbiAgICAkc2NvcGUuYWxlcnRzID0gW1xuICAgICAgICB7IHR5cGU6ICdhbGVydC1kYW5nZXInLCBtc2c6ICdZb3UgYXJlIGFscmVhZHkgcGFydGljaXBhdGluZyBpbiB0aGlzIHF1ZXN0LicsIHNob3c6IGZhbHNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LXN1Y2Nlc3MnLCBtc2c6ICdZb3VcXCd2ZSBzdWNjZXNzZnVsbHkgam9pbmVkIHRoZSBxdWVzdC4nLCBzaG93OiBmYWxzZSB9XG4gICAgXTtcblxuICAgIFF1ZXN0RmFjdG9yeS5nZXRBbGxRdWVzdHMoKS50aGVuKGZ1bmN0aW9uKHF1ZXN0cykge1xuICAgICAgICAkc2NvcGUucXVlc3RzID0gcXVlc3RzOyAvLyAkc2NvcGUudW5qb2luZWRRdWVzdHMgXG4gICAgfSk7XG4gICAgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgICRzY29wZS5zZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUuc2VhcmNoQm94KSAkc2NvcGUuc2VhcmNoQm94ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgfTtcblxuICAgICRzY29wZS5qb2luUXVlc3QgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0XCIsIHF1ZXN0KTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcklkID0gdXNlci5faWQ7XG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IGpvaW5lZCwgZG8gc29tZXRoaW5nXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50c1wiLCBxdWVzdC5wYXJ0aWNpcGFudHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLl9pZFwiLCB1c2VyLl9pZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuXG4gICAgICAgICAgICBpZiAocXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGFsZXJ0XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVlc3QucGFydGljaXBhbnRzLnB1c2goJHNjb3BlLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgUXVlc3RGYWN0b3J5LmpvaW5RdWVzdChxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLmFsZXJ0c1tpbmRleF0uc2hvdyA9IGZhbHNlO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsZWFkZXJCb2FyZCcsIHtcblx0XHR1cmw6ICcvbGVhZGVyQm9hcmQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRDdHJsJ1xuXHR9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG5cdHZhciBuID0gMjAgLy8gZ2V0IG51bWJlciBvZiB1c2VycyBmcm9tIGRiO1xuXHQkc2NvcGUubGIgPSB7fTtcblx0JHNjb3BlLmxiLnJhbmtOdW1zID0gW107XG5cdGZvciAodmFyIGkgPSAxOyBpIDw9IG47IGkrKykge1xuXHRcdCRzY29wZS5yYW5rTnVtcy5wdXNoKGkpO1xuXHR9XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcm9maWxlJywge1xuICAgIFxuICAgIHVybDogJy9wcm9maWxlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9wcm9maWxlL3Byb2ZpbGUuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdQcm9maWxlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5KSB7XG4gIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbiAodXNlckluZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcInVzZXJJbmZvXCIsIHVzZXJJbmZvKTtcbiAgICAkc2NvcGUuZnVsbG5hbWUgPSB1c2VySW5mby51c2VyLmdvb2dsZS5uYW1lO1xuICAgICRzY29wZS5lbWFpbCA9IHVzZXJJbmZvLnVzZXIuZ29vZ2xlLmVtYWlsO1xuICB9KTtcblxuICAkc2NvcGUuaGVsbG8gPSBcImhlbGxvIVwiO1xuXG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdGVwJywge1xuXHRcdHVybDogJy9zdGVwJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9zdGVwL3N0ZXAuaHRtbCcsIFxuXHRcdGNvbnRyb2xsZXI6ICdTdGVwQ3RybCdcblx0fSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignU3RlcEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblx0JHNjb3BlLmFsZXJ0c2hvdyA9IGZhbHNlO1xuXHQvL2hvdyBkbyB3ZSBrZWVwIHRyYWNrIG9mIHRoZSBjaG9zZW4gUXVlc3Q/IENhbiB3ZSBpbmplY3QgaXQgc29tZWhvdz9cblx0Ly9hc3N1bWluZyB3ZSBrbm93IHdoYXQgdGhlIFF1ZXN0IGlzLi4uLlxuXG5cdFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1blBvcFVzZXIpe1xuXHRcdFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIodW5Qb3BVc2VyLnVzZXIuX2lkKS50aGVuKGZ1bmN0aW9uKHBvcFVzZXIpe1xuXHRcdFx0JHNjb3BlLmNob3NlblF1ZXN0ID0gcG9wVXNlci5wYXJ0aWNpcGF0aW5nWzBdO1xuXHRcdFx0JHNjb3BlLnN0ZXBJZCA9IHBvcFVzZXIucGFydGljaXBhdGluZ1swXS5jdXJyZW50U3RlcDtcblx0XHQvLyBcdGNvbnNvbGUubG9nKFwic3RlcCB3ZSBzZW5kXCIsICRzY29wZS5zdGVwSWQpXG5cdFx0XHRRdWVzdEZhY3RvcnkuZ2V0U3RlcEJ5SWQoJHNjb3BlLnN0ZXBJZCkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0JHNjb3BlLnN0ZXAgPSBkYXRhXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0pO1xuXHQkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKXtcblx0XHQvL3dpbGwgdmVyaWZ5IHRoYXQgdGhlIGFuc3dlciBpcyBjb3JyZWN0XG5cdFx0Ly9pZiBzbyB3aWxsIHVwZGF0ZSBjdXJyZW50IHN0ZXAgdG8gYmUgdGhlIG5leHQgc3RlcFxuXHRcdC8vYW5kIHNlbmQgdXNlciB0byBzdWNjZXNzIHBhZ2Vcblx0XHRpZigkc2NvcGUuc3RlcC5xVHlwZSA9PSBcIkZpbGwtaW5cIil7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNvcnJlY3QgcXVlc3Rpb24gdHlwZVwiKVxuXHRcdFx0aWYoJHNjb3BlLnVzZXJBbnN3ZXIgPT0gJHNjb3BlLnN0ZXAuZmlsbEluKXtcblx0XHRcdFx0VXNlckZhY3RvcnkuY2hhbmdlQ3VycmVudFN0ZXAoJHNjb3BlLnN0ZXBJZCk7XG5cdFx0XHRcdCRzdGF0ZS5nbygnc3VjY2VzcycpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdC8vZWxzZSBpdCB3aWxsIGFsZXJ0IHVzZXIgdG8gdHJ5IGFnYWluXG5cdFx0XHRcdCRzY29wZS5hbGVydHNob3cgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fTtcblx0XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VjY2VzcycsIHtcblx0XHR1cmw6ICcvc3VjY2VzcycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnU3VjY2Vzc0N0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N1Y2Nlc3NDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cdCRzY29wZS5jb250aW51ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0JHN0YXRlLmdvKCdzdGVwJyk7XG5cdH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=