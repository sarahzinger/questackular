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
app.factory('QuestFactory', function($http) {
    return {
        sendStep: function(step) {
            //saves the quest
            return $http.post('http://localhost:1337/api/step', step).then(function(response) {
                return response.data;
            });
        },
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('http://localhost:1337/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get('http://localhost:1337/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get('http://localhost:1337/api/quests/' + questId).then(function(res) {
                console.log("what we get back from getQuestById", res.data)
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post('http://localhost:1337/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete('http://localhost:1337/api/quests/participants/'+questId).then(function(response) {
                console.log(response);
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get('http://localhost:1337/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get('http://localhost:1337/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(id){
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.get('http://localhost:1337/api/step/rem/'+id).then(function(res){
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post('http://localhost:1337/api/step/upd',updatedStep).then(function(res){
                return res.data;
            });
        },
        changeCurrentStep: function(stepId){
            return $http.put('http://localhost:1337/api/users/participating/currentStep/'+stepId).then(function(res){
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
    
    url: '/MyQuests',
    templateUrl: 'js/application/states/MyQuests/MyQuests.html', 
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
  

});

'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('step', {
    url: '/step',
    templateUrl: 'js/application/states/step/step.html', 
    controller: 'StepCtrl'
    });
});


app.controller('StepCtrl', function ($scope, QuestFactory, UserFactory) {
	UserFactory.getUserInfo().then(function(user){
		$scope.user = user.user;
		QuestFactory.getStepListById("551482a559c52ae8cd292232").then(function(steps){
			steps.forEach(function(step){
				if($scope.user.participating[1].currentStep == step._id){
					$scope.step = step
				}
			})
		});
	})
	QuestFactory.getQuestById("551482a559c52ae8cd292232").then(function(data){
		$scope.quest = data;
	});
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		//else it will alert user to try again
		console.log("step Id we are sending", $scope.step._id)
		QuestFactory.changeCurrentStep($scope.step._id);
	}
	
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9RdWVzdEZhY3RvcnkuanMiLCJmYWN0b3JpZXMvVXNlckZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJzdGF0ZXMvTXlRdWVzdHMvTXlRdWVzdHMuanMiLCJzdGF0ZXMvaG9tZS9ob21lLmpzIiwic3RhdGVzL2pvaW4vam9pbi5qcyIsInN0YXRlcy9sZWFkZXJCb2FyZC9sZWFkZXJCb2FyZC5qcyIsInN0YXRlcy9wcm9maWxlL3Byb2ZpbGUuanMiLCJzdGF0ZXMvc3RlcC9zdGVwLmpzIiwic3RhdGVzL3N1Y2Nlc3Mvc3VjY2Vzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdRdWVzdGFja3VsYXJFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnXSk7XG5cbmFwcC5jb250cm9sbGVyKCdleHRDb250JywgZnVuY3Rpb24oJHNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG4gICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgJHNjb3BlLm5hbWUgPSBkYXRhLnVzZXIuZ29vZ2xlLm5hbWU7XG4gICAgICAgICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICBcbiAgICB9O1xuICAgIGdldE5hbWUoKTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuXG4gICAgLy8gd2hpdGVsaXN0IHRoZSBjaHJvbWUtZXh0ZW5zaW9uOiBwcm90b2NvbCBcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIiAgIFxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgIC8vIEFuZ3VsYXIgYmVmb3JlIHYxLjIgdXNlcyAkY29tcGlsZVByb3ZpZGVyLnVybFNhbml0aXphdGlvbldoaXRlbGlzdCguLi4pXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZmFjdG9yeSgnUXVlc3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzZW5kU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgLy9zYXZlcyB0aGUgcXVlc3RcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3N0ZXAnLCBzdGVwKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VuZFF1ZXN0OiBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICAgICAgLy9zYXZlcyB0aGUgcXVlc3QsIHJldHVybnMgaXRzIElEXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9xdWVzdHMnLCBxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEFsbFF1ZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3F1ZXN0cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0QnlJZDogZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9xdWVzdHMvJyArIHF1ZXN0SWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3aGF0IHdlIGdldCBiYWNrIGZyb20gZ2V0UXVlc3RCeUlkXCIsIHJlcy5kYXRhKVxuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBqb2luUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0SW5mbykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvcXVlc3RzL3BhcnRpY2lwYW50cycsIHF1ZXN0SW5mbykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBsZWF2ZVF1ZXN0OiBmdW5jdGlvbihxdWVzdElkKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3F1ZXN0cy9wYXJ0aWNpcGFudHMvJytxdWVzdElkKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0c0J5VXNlcjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIC8vZ2V0IGFsbCBxdWVzdHMgJ293bmVkJyBieSB1c2VyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3F1ZXN0cy91c2VyLycgKyBpZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U3RlcExpc3RCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgLy9nZXRzIGEgYnVuY2ggb2Ygc3RlcHMgYnkgdGhlaXIgUXVlc3QgSURcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvc3RlcC9saXN0LycgKyBpZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtU3RlcDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgLy9kZWxldGUgYSBzdGVwLiBvbmx5IG5lY2Vzc2FyeSBpZiBzdGVwIGhhcyBhbiBJRCBcbiAgICAgICAgICAgIC8vKGkuZS4sIHN0ZXAgYWxyZWFkeSBpcyBvbiBEQilcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvc3RlcC9yZW0vJytpZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVTdGVwOiBmdW5jdGlvbih1cGRhdGVkU3RlcCkge1xuICAgICAgICAgICAgLy9tb25nb29zZSBzZWVtcyB0byDgsqVf4LKlIHdoZW4gd2UgdHJ5IHRvIHJlLXNhdmUgYW4gb2JqZWN0IGlkLlxuICAgICAgICAgICAgLy9TTyB3ZSdyZSBkb2luZyBhIGZpbmRieWlkYW5kdXBkYXRlXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9zdGVwL3VwZCcsdXBkYXRlZFN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgY2hhbmdlQ3VycmVudFN0ZXA6IGZ1bmN0aW9uKHN0ZXBJZCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3VzZXJzL3BhcnRpY2lwYXRpbmcvY3VycmVudFN0ZXAvJytzdGVwSWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG5cbiAgICB9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnVXNlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdHJldHVybntcblx0XHRnZXRVc2VySW5mbzogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uJykudGhlbiggZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdHJldHVybiByZXMuZGF0YTtcbiAgIFx0XHRcdH0pO1xuXHRcdH1cblx0fVxufSkiLCIndXNlIHN0cmljdCc7XG5cblxuYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDcmVhdGUgYSBRdWVzdCcsIHN0YXRlOiAnY3JlYXRlLnF1ZXN0JyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0pvaW4gYSBRdWVzdCcsIHN0YXRlOiAnaG9tZScgXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBRdWVzdHMnLCBzdGF0ZTogJ015UXVlc3RzJyBcbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBnZXROYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5hbWUoKTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ2xvZ291dCBjYWxsZWQnKTtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAkc3RhdGUuZ28oJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbXlRdWVzdHMnLCB7XG4gICAgXG4gICAgdXJsOiAnL015UXVlc3RzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ015UXVlc3RzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdNeVF1ZXN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSwgUXVlc3RGYWN0b3J5KXtcbiAgLy8gY29uc29sZS5sb2coXCJVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpXCIsIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkpO1xuICBVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAkc2NvcGUudXNlciA9IHVzZXI7XG4gICAgJHNjb3BlLnVzZXJJZCA9IHVzZXIuX2lkO1xuICAgICRzY29wZS5xdWVzdHNDcmVhdGVkID0gdXNlci5jcmVhdGVkO1xuICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gICAgJHNjb3BlLnF1ZXN0c0NvbXBsZXRlZCA9IHVzZXIucGFzdFF1ZXN0cztcbiAgfSk7XG5cbiAgJHNjb3BlLmxlYXZlUXVlc3QgPSBmdW5jdGlvbiAocXVlc3RJZCwgdXNlcklkKSB7XG4gICAgLy8gcmVtb3ZlcyB1c2VyIGZyb20gcXVlc3QgYW5kIHF1ZXN0IGZyb20gdXNlciBpbiBkYlxuICAgIFF1ZXN0RmFjdG9yeS5sZWF2ZVF1ZXN0KHF1ZXN0SWQsIHVzZXJJZCk7IFxuICAgIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IHVzZXIucGFydGljaXBhdGluZztcbiAgICB9KTtcbiAgICBcbiAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHVybDogJy8nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAkc2NvcGUuc3RhdGVzID0gW3tcbiAgICBzdGF0ZTogXCJsZWFkZXJCb2FyZFwiLCB0aXRsZTogXCJMZWFkZXIgQm9hcmRcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwicHJvZmlsZVwiLCB0aXRsZTogXCJQcm9maWxlXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcImpvaW5cIiwgdGl0bGU6IFwiSm9pbiBBIFF1ZXN0XCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcIm15UXVlc3RzXCIsIHRpdGxlOiBcIk15IFF1ZXN0c1wiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJzdGVwXCIsIHRpdGxlOiBcIlRlbXBvcmFyeSBTdGVwIEJ1dHRvblwiXG4gIH1dO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2pvaW4nLCB7XG4gICAgICAgIHVybDogJy9qb2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvam9pbi9qb2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9pbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdKb2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgQXV0aFNlcnZpY2Upe1xuICAgICRzY29wZS5hbGVydHMgPSBbXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LWRhbmdlcicsIG1zZzogJ1lvdSBhcmUgYWxyZWFkeSBwYXJ0aWNpcGF0aW5nIGluIHRoaXMgcXVlc3QuJywgc2hvdzogZmFsc2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtc3VjY2VzcycsIG1zZzogJ1lvdVxcJ3ZlIHN1Y2Nlc3NmdWxseSBqb2luZWQgdGhlIHF1ZXN0LicsIHNob3c6IGZhbHNlIH1cbiAgICBdO1xuXG4gICAgUXVlc3RGYWN0b3J5LmdldEFsbFF1ZXN0cygpLnRoZW4oZnVuY3Rpb24ocXVlc3RzKSB7XG4gICAgICAgICRzY29wZS5xdWVzdHMgPSBxdWVzdHM7IC8vICRzY29wZS51bmpvaW5lZFF1ZXN0cyBcbiAgICB9KTtcbiAgICAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNlYXJjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5zZWFyY2hCb3gpICRzY29wZS5zZWFyY2hCb3ggPSB0cnVlO1xuICAgICAgICBlbHNlICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmpvaW5RdWVzdCA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3RcIiwgcXVlc3QpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VySWQgPSB1c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgam9pbmVkLCBkbyBzb21ldGhpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzXCIsIHF1ZXN0LnBhcnRpY2lwYW50cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuX2lkXCIsIHVzZXIuX2lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG5cbiAgICAgICAgICAgIGlmIChxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkgPiAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgYWxlcnRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVzdC5wYXJ0aWNpcGFudHMucHVzaCgkc2NvcGUudXNlcklkKTtcbiAgICAgICAgICAgICAgICBRdWVzdEZhY3Rvcnkuam9pblF1ZXN0KHF1ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlQWxlcnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUuYWxlcnRzW2luZGV4XS5zaG93ID0gZmFsc2U7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xlYWRlckJvYXJkJywge1xuICAgIHVybDogJy9sZWFkZXJCb2FyZCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbGVhZGVyQm9hcmQvbGVhZGVyQm9hcmQuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZEN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTGVhZGVyQm9hcmRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICBcblxufSk7IiwiIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N0ZXAnLCB7XG4gICAgdXJsOiAnL3N0ZXAnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL3N0ZXAvc3RlcC5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ1N0ZXBDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N0ZXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgUXVlc3RGYWN0b3J5LCBVc2VyRmFjdG9yeSkge1xuXHRVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcil7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG5cdFx0UXVlc3RGYWN0b3J5LmdldFN0ZXBMaXN0QnlJZChcIjU1MTQ4MmE1NTljNTJhZThjZDI5MjIzMlwiKS50aGVuKGZ1bmN0aW9uKHN0ZXBzKXtcblx0XHRcdHN0ZXBzLmZvckVhY2goZnVuY3Rpb24oc3RlcCl7XG5cdFx0XHRcdGlmKCRzY29wZS51c2VyLnBhcnRpY2lwYXRpbmdbMV0uY3VycmVudFN0ZXAgPT0gc3RlcC5faWQpe1xuXHRcdFx0XHRcdCRzY29wZS5zdGVwID0gc3RlcFxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pO1xuXHR9KVxuXHRRdWVzdEZhY3RvcnkuZ2V0UXVlc3RCeUlkKFwiNTUxNDgyYTU1OWM1MmFlOGNkMjkyMjMyXCIpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0JHNjb3BlLnF1ZXN0ID0gZGF0YTtcblx0fSk7XG5cdCRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpe1xuXHRcdC8vd2lsbCB2ZXJpZnkgdGhhdCB0aGUgYW5zd2VyIGlzIGNvcnJlY3Rcblx0XHQvL2lmIHNvIHdpbGwgdXBkYXRlIGN1cnJlbnQgc3RlcCB0byBiZSB0aGUgbmV4dCBzdGVwXG5cdFx0Ly9hbmQgc2VuZCB1c2VyIHRvIHN1Y2Nlc3MgcGFnZVxuXHRcdC8vZWxzZSBpdCB3aWxsIGFsZXJ0IHVzZXIgdG8gdHJ5IGFnYWluXG5cdFx0Y29uc29sZS5sb2coXCJzdGVwIElkIHdlIGFyZSBzZW5kaW5nXCIsICRzY29wZS5zdGVwLl9pZClcblx0XHRRdWVzdEZhY3RvcnkuY2hhbmdlQ3VycmVudFN0ZXAoJHNjb3BlLnN0ZXAuX2lkKTtcblx0fVxuXHRcbn0pOyIsIiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==