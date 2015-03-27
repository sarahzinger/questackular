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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlF1ZXN0RmFjdG9yeS5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIiwic3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmpzIiwic3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5qcyIsInN0YXRlcy9zdGVwL3N0ZXAuanMiLCJzdGF0ZXMvc3VjY2Vzcy9zdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnUXVlc3RhY2t1bGFyRXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJ10pO1xuXG5hcHAuY29udHJvbGxlcignZXh0Q29udCcsIGZ1bmN0aW9uKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gZGF0YS51c2VyLmdvb2dsZS5uYW1lO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfTtcbiAgICBnZXROYW1lKCk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2wgXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCIgICBcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBBbmd1bGFyIGJlZm9yZSB2MS4yIHVzZXMgJGNvbXBpbGVQcm92aWRlci51cmxTYW5pdGl6YXRpb25XaGl0ZWxpc3QoLi4uKVxufSk7IiwiIiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm57XG5cdFx0Z2V0VXNlckluZm86IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvbicpLnRoZW4oIGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRyZXR1cm4gcmVzLmRhdGE7XG4gICBcdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldFVzZXJGcm9tRGI6IGZ1bmN0aW9uICh1c2VySWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwidXNlcklkXCIsIHVzZXJJZCk7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzLycgKyB1c2VySWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImRiVXNlclwiLCBkYlVzZXIpO1xuXHRcdFx0XHRyZXR1cm4gZGJVc2VyLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNoYW5nZUN1cnJlbnRTdGVwOiBmdW5jdGlvbihzdGVwSWQpe1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwiY2hhbmdlQ3VycmVudFN0ZXAgbGF1bmNoZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzL3BhcnRpY2lwYXRpbmcvY3VycmVudFN0ZXAvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYWRkUG9pbnRzOiBmdW5jdGlvbihzdGVwSWQpe1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS91c2Vycy9wb2ludHMvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIFx0Y29uc29sZS5sb2coXCJwb2ludHNcIiwgcmVzLmRhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblx0fVxufSkiLCIndXNlIHN0cmljdCc7XG5cblxuYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDcmVhdGUgYSBRdWVzdCcsIHN0YXRlOiAnY3JlYXRlLnF1ZXN0JyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0pvaW4gYSBRdWVzdCcsIHN0YXRlOiAnaG9tZScgXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBRdWVzdHMnLCBzdGF0ZTogJ015UXVlc3RzJyBcbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5hbWUoKTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ2xvZ291dCBjYWxsZWQnKTtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAkc3RhdGUuZ28oJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbXlRdWVzdHMnLCB7XG4gICAgXG4gICAgdXJsOiAnL215UXVlc3RzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9teVF1ZXN0cy9teVF1ZXN0cy5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ015UXVlc3RzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdNeVF1ZXN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG4gIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbiAodXNlckluZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcInVzZXJJbmZvXCIsIHVzZXJJbmZvKTtcbiAgICB2YXIgaWQgPSB1c2VySW5mby51c2VyLl9pZDtcbiAgICBVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKGlkKS50aGVuKGZ1bmN0aW9uIChkYlVzZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlciBmcm9tIERCXCIsIGRiVXNlcik7XG4gICAgICAkc2NvcGUudXNlciA9IGRiVXNlcjtcbiAgICAgIGlmIChkYlVzZXIucGFydGljaXBhdGluZy5sZW5ndGgpICRzY29wZS5xdWVzdHNKb2luZWQgPSBkYlVzZXIucGFydGljaXBhdGluZztcbiAgICAgIGVsc2UgJHNjb3BlLm5vUGFydGljaXBhdGluZ1F1ZXN0cyA9IFwiWW91IGhhdmVuJ3Qgam9pbmVkIGFueSBxdWVzdHMgeWV0LlwiXG4gICAgICBjb25zb2xlLmxvZyhcInF1ZXN0IGpvaW5lZFwiLCAkc2NvcGUucXVlc3RzSm9pbmVkWzBdLnF1ZXN0SWQpO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuaGVsbG8gPSBcImhlbGxvIVwiO1xuXG4gIC8vICRzY29wZS5sZWF2ZVF1ZXN0ID0gZnVuY3Rpb24gKHF1ZXN0SWQsIHVzZXJJZCkge1xuICAvLyAgIC8vIHJlbW92ZXMgdXNlciBmcm9tIHF1ZXN0IGFuZCBxdWVzdCBmcm9tIHVzZXIgaW4gZGJcbiAgLy8gICAvLyBRdWVzdEZhY3RvcnkubGVhdmVRdWVzdChxdWVzdElkLCB1c2VySWQpOyBcbiAgLy8gICBVc2VyRmFjdG9yeS5nZXRVc2VyRnJvbURiKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAvLyAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IHVzZXIucGFydGljaXBhdGluZztcbiAgLy8gICB9KTtcbiAgLy8gfTtcbiAgJHNjb3BlLmNvbnRpbnVlUXVlc3QgPSBmdW5jdGlvbihwYXJ0aWNpcGF0aW5nSW5kZXgpe1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicGFydGljaXBhdGluZ0luZGV4XCIsIHBhcnRpY2lwYXRpbmdJbmRleCk7XG4gICAgJHN0YXRlLmdvKFwic3RlcFwiKTtcbiAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHVybDogJy8nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAkc2NvcGUuc3RhdGVzID0gW3tcbiAgICBzdGF0ZTogXCJsZWFkZXJCb2FyZFwiLCB0aXRsZTogXCJMZWFkZXIgQm9hcmRcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwicHJvZmlsZVwiLCB0aXRsZTogXCJQcm9maWxlXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcImpvaW5cIiwgdGl0bGU6IFwiSm9pbiBBIFF1ZXN0XCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcIm15UXVlc3RzXCIsIHRpdGxlOiBcIk15IFF1ZXN0c1wiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJzdGVwXCIsIHRpdGxlOiBcIlRlbXBvcmFyeSBTdGVwIEJ1dHRvblwiXG4gIH1dO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2pvaW4nLCB7XG4gICAgICAgIHVybDogJy9qb2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvam9pbi9qb2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9pbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdKb2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgQXV0aFNlcnZpY2Upe1xuICAgICRzY29wZS5hbGVydHMgPSBbXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LWRhbmdlcicsIG1zZzogJ1lvdSBhcmUgYWxyZWFkeSBwYXJ0aWNpcGF0aW5nIGluIHRoaXMgcXVlc3QuJywgc2hvdzogZmFsc2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtc3VjY2VzcycsIG1zZzogJ1lvdVxcJ3ZlIHN1Y2Nlc3NmdWxseSBqb2luZWQgdGhlIHF1ZXN0LicsIHNob3c6IGZhbHNlIH1cbiAgICBdO1xuXG4gICAgUXVlc3RGYWN0b3J5LmdldEFsbFF1ZXN0cygpLnRoZW4oZnVuY3Rpb24ocXVlc3RzKSB7XG4gICAgICAgICRzY29wZS5xdWVzdHMgPSBxdWVzdHM7IC8vICRzY29wZS51bmpvaW5lZFF1ZXN0cyBcbiAgICB9KTtcbiAgICAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNlYXJjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5zZWFyY2hCb3gpICRzY29wZS5zZWFyY2hCb3ggPSB0cnVlO1xuICAgICAgICBlbHNlICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmpvaW5RdWVzdCA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3RcIiwgcXVlc3QpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VySWQgPSB1c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgam9pbmVkLCBkbyBzb21ldGhpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzXCIsIHF1ZXN0LnBhcnRpY2lwYW50cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuX2lkXCIsIHVzZXIuX2lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG5cbiAgICAgICAgICAgIGlmIChxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkgPiAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgYWxlcnRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVzdC5wYXJ0aWNpcGFudHMucHVzaCgkc2NvcGUudXNlcklkKTtcbiAgICAgICAgICAgICAgICBRdWVzdEZhY3Rvcnkuam9pblF1ZXN0KHF1ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlQWxlcnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUuYWxlcnRzW2luZGV4XS5zaG93ID0gZmFsc2U7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xlYWRlckJvYXJkJywge1xuXHRcdHVybDogJy9sZWFkZXJCb2FyZCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbGVhZGVyQm9hcmQvbGVhZGVyQm9hcmQuaHRtbCcsIFxuXHRcdGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZEN0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcblx0dmFyIG4gPSAyMCAvLyBnZXQgbnVtYmVyIG9mIHVzZXJzIGZyb20gZGI7XG5cdCRzY29wZS5sYiA9IHt9O1xuXHQkc2NvcGUubGIucmFua051bXMgPSBbXTtcblx0Zm9yICh2YXIgaSA9IDE7IGkgPD0gbjsgaSsrKSB7XG5cdFx0JHNjb3BlLnJhbmtOdW1zLnB1c2goaSk7XG5cdH1cblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2ZpbGUnLCB7XG4gICAgXG4gICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3Byb2ZpbGUvcHJvZmlsZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnkpIHtcbiAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uICh1c2VySW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwidXNlckluZm9cIiwgdXNlckluZm8pO1xuICAgICRzY29wZS5mdWxsbmFtZSA9IHVzZXJJbmZvLnVzZXIuZ29vZ2xlLm5hbWU7XG4gICAgJHNjb3BlLmVtYWlsID0gdXNlckluZm8udXNlci5nb29nbGUuZW1haWw7XG4gIH0pO1xuXG4gICRzY29wZS5oZWxsbyA9IFwiaGVsbG8hXCI7XG5cblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N0ZXAnLCB7XG5cdFx0dXJsOiAnL3N0ZXAnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3N0ZXAvc3RlcC5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ1N0ZXBDdHJsJ1xuXHR9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTdGVwQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXHQkc2NvcGUuYWxlcnRzaG93ID0gZmFsc2U7XG5cblx0JHNjb3BlLnBhcnRpY2lwYXRpbmdJbmRleD0gTnVtYmVyKGxvY2FsU3RvcmFnZVtcInBhcnRpY2lwYXRpbmdJbmRleFwiXSk7XG5cblx0VXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVuUG9wVXNlcil7XG5cdFx0VXNlckZhY3RvcnkuZ2V0VXNlckZyb21EYih1blBvcFVzZXIudXNlci5faWQpLnRoZW4oZnVuY3Rpb24ocG9wVXNlcil7XG5cdFx0XHQkc2NvcGUuY2hvc2VuUXVlc3QgPSBwb3BVc2VyLnBhcnRpY2lwYXRpbmdbJHNjb3BlLnBhcnRpY2lwYXRpbmdJbmRleF07XG5cdFx0XHQkc2NvcGUuc3RlcElkID0gcG9wVXNlci5wYXJ0aWNpcGF0aW5nWyRzY29wZS5wYXJ0aWNpcGF0aW5nSW5kZXhdLmN1cnJlbnRTdGVwO1xuXHRcdC8vIFx0Y29uc29sZS5sb2coXCJzdGVwIHdlIHNlbmRcIiwgJHNjb3BlLnN0ZXBJZClcblx0XHRcdFF1ZXN0RmFjdG9yeS5nZXRTdGVwQnlJZCgkc2NvcGUuc3RlcElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHQkc2NvcGUuc3RlcCA9IGRhdGE7XG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0pO1xuXHQkc2NvcGUubGF1bmNoUmVhZGluZyA9IGZ1bmN0aW9uKCl7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHt1cmw6IFwiaHR0cDovL1wiKyRzY29wZS5zdGVwLnVybH0pO1xuXHR9XG5cdCRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpe1xuXHRcdC8vd2lsbCB2ZXJpZnkgdGhhdCB0aGUgYW5zd2VyIGlzIGNvcnJlY3Rcblx0XHQvL2lmIHNvIHdpbGwgdXBkYXRlIGN1cnJlbnQgc3RlcCB0byBiZSB0aGUgbmV4dCBzdGVwXG5cdFx0Ly9hbmQgc2VuZCB1c2VyIHRvIHN1Y2Nlc3MgcGFnZVxuXHRcdGlmKCRzY29wZS5zdGVwLnFUeXBlID09IFwiRmlsbC1pblwiKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiY29ycmVjdCBxdWVzdGlvbiB0eXBlXCIpXG5cdFx0XHRpZigkc2NvcGUudXNlckFuc3dlciA9PSAkc2NvcGUuc3RlcC5maWxsSW4pe1xuXHRcdFx0XHRVc2VyRmFjdG9yeS5hZGRQb2ludHMoJHNjb3BlLnN0ZXBJZCkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRVc2VyRmFjdG9yeS5jaGFuZ2VDdXJyZW50U3RlcCgkc2NvcGUuc3RlcElkKTtcblx0XHRcdFx0XHQkc3RhdGUuZ28oJ3N1Y2Nlc3MnKTtcblx0XHRcdFx0fSlcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQvL2Vsc2UgaXQgd2lsbCBhbGVydCB1c2VyIHRvIHRyeSBhZ2FpblxuXHRcdFx0XHQkc2NvcGUuYWxlcnRzaG93ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdH07XG5cdFxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Y2Nlc3MnLCB7XG5cdFx0dXJsOiAnL3N1Y2Nlc3MnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3N1Y2Nlc3Mvc3VjY2Vzcy5odG1sJywgXG5cdFx0Y29udHJvbGxlcjogJ1N1Y2Nlc3NDdHJsJ1xuXHR9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTdWNjZXNzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXHQkc2NvcGUuY29udGludWUgPSBmdW5jdGlvbigpe1xuXHRcdCRzdGF0ZS5nbygnc3RlcCcpO1xuXHR9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9