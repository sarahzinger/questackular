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
            return $http.put('/api/quests/:id',updatedQuest).then(function(res){
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
// 	angular.value to store index
// or localStorage?

// say you get participating 'index', and step id:
// var place = {
// 	index:index,
// 	stepId: stepId
// }
// localStorage.myPlace = angular.toJson(place)

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlF1ZXN0RmFjdG9yeS5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIiwic3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmpzIiwic3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5qcyIsInN0YXRlcy9zdGVwL3N0ZXAuanMiLCJzdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnUXVlc3RhY2t1bGFyRXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJ10pO1xuXG5hcHAuY29udHJvbGxlcignZXh0Q29udCcsIGZ1bmN0aW9uKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gZGF0YS51c2VyLmdvb2dsZS5uYW1lO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfTtcbiAgICBnZXROYW1lKCk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2wgXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCIgICBcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBBbmd1bGFyIGJlZm9yZSB2MS4yIHVzZXMgJGNvbXBpbGVQcm92aWRlci51cmxTYW5pdGl6YXRpb25XaGl0ZWxpc3QoLi4uKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLnZhbHVlKCdkb21haW4nLCAnaHR0cDovL2xvY2FsaG9zdDoxMzM3Jyk7XG5cbmFwcC5mYWN0b3J5KCdRdWVzdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgZG9tYWluKSB7XG4gICAgY29uc29sZS5sb2coXCJkb21haW5cIik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VuZFF1ZXN0OiBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICAgICAgLy9zYXZlcyB0aGUgcXVlc3QsIHJldHVybnMgaXRzIElEXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9xdWVzdHMnLCBxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEFsbFF1ZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArICcvYXBpL3F1ZXN0cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0QnlJZDogZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMvJyArIHF1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGpvaW5RdWVzdDogZnVuY3Rpb24ocXVlc3RJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChkb21haW4gKyAnL2FwaS9xdWVzdHMvcGFydGljaXBhbnRzJywgcXVlc3RJbmZvKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxlYXZlUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoZG9tYWluICsgJy9hcGkvcXVlc3RzL3BhcnRpY2lwYW50cy8nK3F1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlUXVlc3Q6IGZ1bmN0aW9uKHVwZGF0ZWRRdWVzdCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL3F1ZXN0cy86aWQnLHVwZGF0ZWRRdWVzdCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdHNCeVVzZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldCBhbGwgcXVlc3RzICdvd25lZCcgYnkgdXNlclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9xdWVzdHMvdXNlci8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAvL3NhdmVzIHRoZSBxdWVzdFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoZG9tYWluICsgJy9hcGkvc3RlcCcsIHN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGVwTGlzdEJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldHMgYSBidW5jaCBvZiBzdGVwcyBieSB0aGVpciBRdWVzdCBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS9zdGVwL2xpc3QvJyArIGlkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICByZW1TdGVwOiBmdW5jdGlvbihyZW0pe1xuICAgICAgICAgICAgLy9kZWxldGUgYSBzdGVwLiBvbmx5IG5lY2Vzc2FyeSBpZiBzdGVwIGhhcyBhbiBJRCBcbiAgICAgICAgICAgIC8vKGkuZS4sIHN0ZXAgYWxyZWFkeSBpcyBvbiBEQilcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAvcmVtLycscmVtKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVN0ZXA6IGZ1bmN0aW9uKHVwZGF0ZWRTdGVwKSB7XG4gICAgICAgICAgICAvL21vbmdvb3NlIHNlZW1zIHRvIOCypV/gsqUgd2hlbiB3ZSB0cnkgdG8gcmUtc2F2ZSBhbiBvYmplY3QgaWQuXG4gICAgICAgICAgICAvL1NPIHdlJ3JlIGRvaW5nIGEgZmluZGJ5aWRhbmR1cGRhdGVcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGRvbWFpbiArICcvYXBpL3N0ZXAvdXBkJyx1cGRhdGVkU3RlcCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGVwQnlJZDogZnVuY3Rpb24oc3RlcElkKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvc3RlcC8nK3N0ZXBJZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm57XG5cdFx0Z2V0VXNlckluZm86IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvbicpLnRoZW4oIGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRyZXR1cm4gcmVzLmRhdGE7XG4gICBcdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldFVzZXJGcm9tRGI6IGZ1bmN0aW9uICh1c2VySWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwidXNlcklkXCIsIHVzZXJJZCk7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzLycgKyB1c2VySWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImRiVXNlclwiLCBkYlVzZXIpO1xuXHRcdFx0XHRyZXR1cm4gZGJVc2VyLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNoYW5nZUN1cnJlbnRTdGVwOiBmdW5jdGlvbihzdGVwSWQpe1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwiY2hhbmdlQ3VycmVudFN0ZXAgbGF1bmNoZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzL3BhcnRpY2lwYXRpbmcvY3VycmVudFN0ZXAvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXHR9XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBhIFF1ZXN0Jywgc3RhdGU6ICdjcmVhdGUucXVlc3QnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnSm9pbiBhIFF1ZXN0Jywgc3RhdGU6ICdob21lJyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFF1ZXN0cycsIHN0YXRlOiAnTXlRdWVzdHMnIFxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IGRhdGEudXNlcjtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0TmFtZSgpO1xuXG4gICAgICAgICAgICAvLyBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGNhbGxlZCcpO1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICRzdGF0ZS5nbygnc3RhcnQnKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdteVF1ZXN0cycsIHtcbiAgICBcbiAgICB1cmw6ICcvbXlRdWVzdHMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL215UXVlc3RzL215UXVlc3RzLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnTXlRdWVzdHNDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ015UXVlc3RzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5KSB7XG4gIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbiAodXNlckluZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcInVzZXJJbmZvXCIsIHVzZXJJbmZvKTtcbiAgICB2YXIgaWQgPSB1c2VySW5mby51c2VyLl9pZDtcbiAgICBVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKGlkKS50aGVuKGZ1bmN0aW9uIChkYlVzZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlciBmcm9tIERCXCIsIGRiVXNlcik7XG4gICAgICAkc2NvcGUudXNlciA9IGRiVXNlcjtcbiAgICAgIGlmIChkYlVzZXIucGFydGljaXBhdGluZy5sZW5ndGgpICRzY29wZS5xdWVzdHNKb2luZWQgPSBkYlVzZXIucGFydGljaXBhdGluZztcbiAgICAgIGVsc2UgJHNjb3BlLm5vUGFydGljaXBhdGluZ1F1ZXN0cyA9IFwiWW91IGhhdmVuJ3Qgam9pbmVkIGFueSBxdWVzdHMgeWV0LlwiXG4gICAgICBjb25zb2xlLmxvZyhcInF1ZXN0IGpvaW5lZFwiLCAkc2NvcGUucXVlc3RzSm9pbmVkWzBdLnF1ZXN0SWQpO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuaGVsbG8gPSBcImhlbGxvIVwiO1xuXG4gIC8vICRzY29wZS5sZWF2ZVF1ZXN0ID0gZnVuY3Rpb24gKHF1ZXN0SWQsIHVzZXJJZCkge1xuICAvLyAgIC8vIHJlbW92ZXMgdXNlciBmcm9tIHF1ZXN0IGFuZCBxdWVzdCBmcm9tIHVzZXIgaW4gZGJcbiAgLy8gICAvLyBRdWVzdEZhY3RvcnkubGVhdmVRdWVzdChxdWVzdElkLCB1c2VySWQpOyBcbiAgLy8gICBVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAvLyAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IHVzZXIucGFydGljaXBhdGluZztcbiAgLy8gICB9KTtcbiAgLy8gfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHVybDogJy8nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAkc2NvcGUuc3RhdGVzID0gW3tcbiAgICBzdGF0ZTogXCJsZWFkZXJCb2FyZFwiLCB0aXRsZTogXCJMZWFkZXIgQm9hcmRcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwicHJvZmlsZVwiLCB0aXRsZTogXCJQcm9maWxlXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcImpvaW5cIiwgdGl0bGU6IFwiSm9pbiBBIFF1ZXN0XCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcIm15UXVlc3RzXCIsIHRpdGxlOiBcIk15IFF1ZXN0c1wiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJzdGVwXCIsIHRpdGxlOiBcIlRlbXBvcmFyeSBTdGVwIEJ1dHRvblwiXG4gIH1dO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2pvaW4nLCB7XG4gICAgICAgIHVybDogJy9qb2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvam9pbi9qb2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9pbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdKb2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgQXV0aFNlcnZpY2Upe1xuICAgICRzY29wZS5hbGVydHMgPSBbXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LWRhbmdlcicsIG1zZzogJ1lvdSBhcmUgYWxyZWFkeSBwYXJ0aWNpcGF0aW5nIGluIHRoaXMgcXVlc3QuJywgc2hvdzogZmFsc2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtc3VjY2VzcycsIG1zZzogJ1lvdVxcJ3ZlIHN1Y2Nlc3NmdWxseSBqb2luZWQgdGhlIHF1ZXN0LicsIHNob3c6IGZhbHNlIH1cbiAgICBdO1xuXG4gICAgUXVlc3RGYWN0b3J5LmdldEFsbFF1ZXN0cygpLnRoZW4oZnVuY3Rpb24ocXVlc3RzKSB7XG4gICAgICAgICRzY29wZS5xdWVzdHMgPSBxdWVzdHM7IC8vICRzY29wZS51bmpvaW5lZFF1ZXN0cyBcbiAgICB9KTtcbiAgICAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNlYXJjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5zZWFyY2hCb3gpICRzY29wZS5zZWFyY2hCb3ggPSB0cnVlO1xuICAgICAgICBlbHNlICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmpvaW5RdWVzdCA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3RcIiwgcXVlc3QpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VySWQgPSB1c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgam9pbmVkLCBkbyBzb21ldGhpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzXCIsIHF1ZXN0LnBhcnRpY2lwYW50cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuX2lkXCIsIHVzZXIuX2lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG5cbiAgICAgICAgICAgIGlmIChxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkgPiAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgYWxlcnRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVzdC5wYXJ0aWNpcGFudHMucHVzaCgkc2NvcGUudXNlcklkKTtcbiAgICAgICAgICAgICAgICBRdWVzdEZhY3Rvcnkuam9pblF1ZXN0KHF1ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlQWxlcnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUuYWxlcnRzW2luZGV4XS5zaG93ID0gZmFsc2U7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xlYWRlckJvYXJkJywge1xuXHRcdHVybDogJy9sZWFkZXJCb2FyZCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbGVhZGVyQm9hcmQvbGVhZGVyQm9hcmQuaHRtbCcsIFxuXHRcdGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZEN0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcblx0dmFyIG4gPSAyMCAvLyBnZXQgbnVtYmVyIG9mIHVzZXJzIGZyb20gZGI7XG5cdCRzY29wZS5sYiA9IHt9O1xuXHQkc2NvcGUubGIucmFua051bXMgPSBbXTtcblx0Zm9yICh2YXIgaSA9IDE7IGkgPD0gbjsgaSsrKSB7XG5cdFx0JHNjb3BlLnJhbmtOdW1zLnB1c2goaSk7XG5cdH1cblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2ZpbGUnLCB7XG4gICAgXG4gICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnkpIHtcbiAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uICh1c2VySW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwidXNlckluZm9cIiwgdXNlckluZm8pO1xuICAgICRzY29wZS5mdWxsbmFtZSA9IHVzZXJJbmZvLnVzZXIuZ29vZ2xlLm5hbWU7XG4gICAgJHNjb3BlLmVtYWlsID0gdXNlckluZm8udXNlci5nb29nbGUuZW1haWw7XG4gIH0pO1xuXG4gICRzY29wZS5oZWxsbyA9IFwiaGVsbG8hXCI7XG5cblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N0ZXAnLCB7XG5cdFx0dXJsOiAnL3N0ZXAnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3N0ZXAvc3RlcC5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ1N0ZXBDdHJsJ1xuXHR9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTdGVwQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXHQkc2NvcGUuYWxlcnRzaG93ID0gZmFsc2U7XG5cdC8vaG93IGRvIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGNob3NlbiBRdWVzdD8gQ2FuIHdlIGluamVjdCBpdCBzb21laG93P1xuXHQvL2Fzc3VtaW5nIHdlIGtub3cgd2hhdCB0aGUgUXVlc3QgaXMuLi4uXG4vLyBcdGFuZ3VsYXIudmFsdWUgdG8gc3RvcmUgaW5kZXhcbi8vIG9yIGxvY2FsU3RvcmFnZT9cblxuLy8gc2F5IHlvdSBnZXQgcGFydGljaXBhdGluZyAnaW5kZXgnLCBhbmQgc3RlcCBpZDpcbi8vIHZhciBwbGFjZSA9IHtcbi8vIFx0aW5kZXg6aW5kZXgsXG4vLyBcdHN0ZXBJZDogc3RlcElkXG4vLyB9XG4vLyBsb2NhbFN0b3JhZ2UubXlQbGFjZSA9IGFuZ3VsYXIudG9Kc29uKHBsYWNlKVxuXG5cdFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1blBvcFVzZXIpe1xuXHRcdFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIodW5Qb3BVc2VyLnVzZXIuX2lkKS50aGVuKGZ1bmN0aW9uKHBvcFVzZXIpe1xuXHRcdFx0JHNjb3BlLmNob3NlblF1ZXN0ID0gcG9wVXNlci5wYXJ0aWNpcGF0aW5nWzBdO1xuXHRcdFx0JHNjb3BlLnN0ZXBJZCA9IHBvcFVzZXIucGFydGljaXBhdGluZ1swXS5jdXJyZW50U3RlcDtcblx0XHQvLyBcdGNvbnNvbGUubG9nKFwic3RlcCB3ZSBzZW5kXCIsICRzY29wZS5zdGVwSWQpXG5cdFx0XHRRdWVzdEZhY3RvcnkuZ2V0U3RlcEJ5SWQoJHNjb3BlLnN0ZXBJZCkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0JHNjb3BlLnN0ZXAgPSBkYXRhXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0pO1xuXHQkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKXtcblx0XHQvL3dpbGwgdmVyaWZ5IHRoYXQgdGhlIGFuc3dlciBpcyBjb3JyZWN0XG5cdFx0Ly9pZiBzbyB3aWxsIHVwZGF0ZSBjdXJyZW50IHN0ZXAgdG8gYmUgdGhlIG5leHQgc3RlcFxuXHRcdC8vYW5kIHNlbmQgdXNlciB0byBzdWNjZXNzIHBhZ2Vcblx0XHRpZigkc2NvcGUuc3RlcC5xVHlwZSA9PSBcIkZpbGwtaW5cIil7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNvcnJlY3QgcXVlc3Rpb24gdHlwZVwiKVxuXHRcdFx0aWYoJHNjb3BlLnVzZXJBbnN3ZXIgPT0gJHNjb3BlLnN0ZXAuZmlsbEluKXtcblx0XHRcdFx0VXNlckZhY3RvcnkuY2hhbmdlQ3VycmVudFN0ZXAoJHNjb3BlLnN0ZXBJZCk7XG5cdFx0XHRcdCRzdGF0ZS5nbygnc3VjY2VzcycpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdC8vZWxzZSBpdCB3aWxsIGFsZXJ0IHVzZXIgdG8gdHJ5IGFnYWluXG5cdFx0XHRcdCRzY29wZS5hbGVydHNob3cgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fTtcblx0XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VjY2VzcycsIHtcblx0XHR1cmw6ICcvc3VjY2VzcycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmh0bWwnLCBcblx0XHRjb250cm9sbGVyOiAnU3VjY2Vzc0N0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N1Y2Nlc3NDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cdCRzY29wZS5jb250aW51ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0JHN0YXRlLmdvKCdzdGVwJyk7XG5cdH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=