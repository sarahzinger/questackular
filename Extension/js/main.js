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
        getStepById: function(stepId){
            return $http.get('http://localhost:1337/api/step/'+stepId).then(function(res){
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
		getPopulatedUser: function() {
			return $http.get('http://localhost:1337/session').then(function(response) {
				var currentUserId = response.data.user._id;
				console.log("currentUserId is", currentUserId);
	            return $http.get('http://localhost:1337/api/users/' + currentUserId).then(function(response) {
	            	console.log("fully populated",response.data);
	                return response.data;
	            });
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
	//how do we keep track of the chosen Quest? Can we inject it somehow?
	//assuming we know what the Quest is....

	//Identify the user, and get the current step for that quest
	UserFactory.getPopulatedUser().then(function(data){
		//currently hard coding it to just access the first quest in participating
		//but maybe we can keep track of the current index
		$scope.chosenQuest = data.participating[0];
		$scope.stepId = data.participating[0].currentStep;
		console.log("step we send", $scope.stepId)
		QuestFactory.getStepById($scope.stepId).then(function(data){
			$scope.step = data
		})
		//once we get the stepId we need to get the full step object to display

	});
	$scope.submit = function(){
		//will verify that the answer is correct
		//if so will update current step to be the next step
		//and send user to success page
		//else it will alert user to try again
		console.log("step Id we are sending", $scope.stepId);
		UserFactory.changeCurrentStep($scope.stepId);
	};
	
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9RdWVzdEZhY3RvcnkuanMiLCJmYWN0b3JpZXMvVXNlckZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJzdGF0ZXMvTXlRdWVzdHMvTXlRdWVzdHMuanMiLCJzdGF0ZXMvaG9tZS9ob21lLmpzIiwic3RhdGVzL2pvaW4vam9pbi5qcyIsInN0YXRlcy9wcm9maWxlL3Byb2ZpbGUuanMiLCJzdGF0ZXMvbGVhZGVyQm9hcmQvbGVhZGVyQm9hcmQuanMiLCJzdGF0ZXMvc3RlcC9zdGVwLmpzIiwic3RhdGVzL3N1Y2Nlc3Mvc3VjY2Vzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnUXVlc3RhY2t1bGFyRXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJ10pO1xuXG5hcHAuY29udHJvbGxlcignZXh0Q29udCcsIGZ1bmN0aW9uKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gZGF0YS51c2VyLmdvb2dsZS5uYW1lO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfTtcbiAgICBnZXROYW1lKCk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2wgXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCIgICBcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBBbmd1bGFyIGJlZm9yZSB2MS4yIHVzZXMgJGNvbXBpbGVQcm92aWRlci51cmxTYW5pdGl6YXRpb25XaGl0ZWxpc3QoLi4uKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmZhY3RvcnkoJ1F1ZXN0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VuZFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIC8vc2F2ZXMgdGhlIHF1ZXN0XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9zdGVwJywgc3RlcCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRRdWVzdDogZnVuY3Rpb24ocXVlc3QpIHtcbiAgICAgICAgICAgIC8vc2F2ZXMgdGhlIHF1ZXN0LCByZXR1cm5zIGl0cyBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvcXVlc3RzJywgcXVlc3QpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRBbGxRdWVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9xdWVzdHMnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdEJ5SWQ6IGZ1bmN0aW9uKHF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvcXVlc3RzLycgKyBxdWVzdElkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid2hhdCB3ZSBnZXQgYmFjayBmcm9tIGdldFF1ZXN0QnlJZFwiLCByZXMuZGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgam9pblF1ZXN0OiBmdW5jdGlvbihxdWVzdEluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3F1ZXN0cy9wYXJ0aWNpcGFudHMnLCBxdWVzdEluZm8pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGVhdmVRdWVzdDogZnVuY3Rpb24ocXVlc3RJZCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9xdWVzdHMvcGFydGljaXBhbnRzLycrcXVlc3RJZCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdHNCeVVzZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL2dldCBhbGwgcXVlc3RzICdvd25lZCcgYnkgdXNlclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9xdWVzdHMvdXNlci8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFN0ZXBMaXN0QnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIC8vZ2V0cyBhIGJ1bmNoIG9mIHN0ZXBzIGJ5IHRoZWlyIFF1ZXN0IElEXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3N0ZXAvbGlzdC8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbVN0ZXA6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgIC8vZGVsZXRlIGEgc3RlcC4gb25seSBuZWNlc3NhcnkgaWYgc3RlcCBoYXMgYW4gSUQgXG4gICAgICAgICAgICAvLyhpLmUuLCBzdGVwIGFscmVhZHkgaXMgb24gREIpXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvYXBpL3N0ZXAvcmVtLycraWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlU3RlcDogZnVuY3Rpb24odXBkYXRlZFN0ZXApIHtcbiAgICAgICAgICAgIC8vbW9uZ29vc2Ugc2VlbXMgdG8g4LKlX+CypSB3aGVuIHdlIHRyeSB0byByZS1zYXZlIGFuIG9iamVjdCBpZC5cbiAgICAgICAgICAgIC8vU08gd2UncmUgZG9pbmcgYSBmaW5kYnlpZGFuZHVwZGF0ZVxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvc3RlcC91cGQnLHVwZGF0ZWRTdGVwKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFN0ZXBCeUlkOiBmdW5jdGlvbihzdGVwSWQpe1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS9zdGVwLycrc3RlcElkKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJue1xuXHRcdGdldFVzZXJJbmZvOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb24nKS50aGVuKCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0cmV0dXJuIHJlcy5kYXRhO1xuICAgXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRQb3B1bGF0ZWRVc2VyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHR2YXIgY3VycmVudFVzZXJJZCA9IHJlc3BvbnNlLmRhdGEudXNlci5faWQ7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiY3VycmVudFVzZXJJZCBpc1wiLCBjdXJyZW50VXNlcklkKTtcblx0ICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS91c2Vycy8nICsgY3VycmVudFVzZXJJZCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgICAgICBcdGNvbnNvbGUubG9nKFwiZnVsbHkgcG9wdWxhdGVkXCIscmVzcG9uc2UuZGF0YSk7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0ICAgICAgICAgICAgfSk7XG5cdFx0XHR9KTtcbiAgICAgICAgfSxcbiAgICAgICAgY2hhbmdlQ3VycmVudFN0ZXA6IGZ1bmN0aW9uKHN0ZXBJZCl7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJjaGFuZ2VDdXJyZW50U3RlcCBsYXVuY2hlZFwiKTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hcGkvdXNlcnMvcGFydGljaXBhdGluZy9jdXJyZW50U3RlcC8nK3N0ZXBJZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cdH1cbn0pIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ3JlYXRlIGEgUXVlc3QnLCBzdGF0ZTogJ2NyZWF0ZS5xdWVzdCcgXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdKb2luIGEgUXVlc3QnLCBzdGF0ZTogJ2hvbWUnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgUXVlc3RzJywgc3RhdGU6ICdNeVF1ZXN0cycgXG4gICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oJ2xvY2FsaG9zdDoxMzM3L2F1dGgvZ29vZ2xlJywgJ19ibGFuaycpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gZGF0YS51c2VyO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnZXROYW1lKCk7XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdsb2dvdXQgY2FsbGVkJyk7XG4gICAgICAgICAgICAvLyAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgJHN0YXRlLmdvKCdzdGFydCcpO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgLy8gc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ215UXVlc3RzJywge1xuICAgIFxuICAgIHVybDogJy9NeVF1ZXN0cycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvTXlRdWVzdHMvTXlRdWVzdHMuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdNeVF1ZXN0c0N0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTXlRdWVzdHNDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnksIFF1ZXN0RmFjdG9yeSl7XG4gIC8vIGNvbnNvbGUubG9nKFwiVXNlckZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKVwiLCBVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpKTtcbiAgVXNlckZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgJHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICRzY29wZS51c2VySWQgPSB1c2VyLl9pZDtcbiAgICAkc2NvcGUucXVlc3RzQ3JlYXRlZCA9IHVzZXIuY3JlYXRlZDtcbiAgICAkc2NvcGUucXVlc3RzSm9pbmVkID0gdXNlci5wYXJ0aWNpcGF0aW5nO1xuICAgICRzY29wZS5xdWVzdHNDb21wbGV0ZWQgPSB1c2VyLnBhc3RRdWVzdHM7XG4gIH0pO1xuXG4gICRzY29wZS5sZWF2ZVF1ZXN0ID0gZnVuY3Rpb24gKHF1ZXN0SWQsIHVzZXJJZCkge1xuICAgIC8vIHJlbW92ZXMgdXNlciBmcm9tIHF1ZXN0IGFuZCBxdWVzdCBmcm9tIHVzZXIgaW4gZGJcbiAgICBRdWVzdEZhY3RvcnkubGVhdmVRdWVzdChxdWVzdElkLCB1c2VySWQpOyBcbiAgICBVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gICAgfSk7XG4gICAgXG4gIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICB1cmw6ICcvJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9ob21lL2hvbWUuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgJHNjb3BlLnN0YXRlcyA9IFt7XG4gICAgc3RhdGU6IFwibGVhZGVyQm9hcmRcIiwgdGl0bGU6IFwiTGVhZGVyIEJvYXJkXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcInByb2ZpbGVcIiwgdGl0bGU6IFwiUHJvZmlsZVwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJqb2luXCIsIHRpdGxlOiBcIkpvaW4gQSBRdWVzdFwiXG4gIH0sXG4gIHtcbiAgICBzdGF0ZTogXCJteVF1ZXN0c1wiLCB0aXRsZTogXCJNeSBRdWVzdHNcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwic3RlcFwiLCB0aXRsZTogXCJUZW1wb3JhcnkgU3RlcCBCdXR0b25cIlxuICB9XTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdqb2luJywge1xuICAgICAgICB1cmw6ICcvam9pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2pvaW4vam9pbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0pvaW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSm9pbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIEF1dGhTZXJ2aWNlKXtcbiAgICAkc2NvcGUuYWxlcnRzID0gW1xuICAgICAgICB7IHR5cGU6ICdhbGVydC1kYW5nZXInLCBtc2c6ICdZb3UgYXJlIGFscmVhZHkgcGFydGljaXBhdGluZyBpbiB0aGlzIHF1ZXN0LicsIHNob3c6IGZhbHNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LXN1Y2Nlc3MnLCBtc2c6ICdZb3VcXCd2ZSBzdWNjZXNzZnVsbHkgam9pbmVkIHRoZSBxdWVzdC4nLCBzaG93OiBmYWxzZSB9XG4gICAgXTtcblxuICAgIFF1ZXN0RmFjdG9yeS5nZXRBbGxRdWVzdHMoKS50aGVuKGZ1bmN0aW9uKHF1ZXN0cykge1xuICAgICAgICAkc2NvcGUucXVlc3RzID0gcXVlc3RzOyAvLyAkc2NvcGUudW5qb2luZWRRdWVzdHMgXG4gICAgfSk7XG4gICAgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgICRzY29wZS5zZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUuc2VhcmNoQm94KSAkc2NvcGUuc2VhcmNoQm94ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgfTtcblxuICAgICRzY29wZS5qb2luUXVlc3QgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0XCIsIHF1ZXN0KTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcklkID0gdXNlci5faWQ7XG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IGpvaW5lZCwgZG8gc29tZXRoaW5nXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50c1wiLCBxdWVzdC5wYXJ0aWNpcGFudHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLl9pZFwiLCB1c2VyLl9pZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuXG4gICAgICAgICAgICBpZiAocXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGFsZXJ0XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVlc3QucGFydGljaXBhbnRzLnB1c2goJHNjb3BlLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgUXVlc3RGYWN0b3J5LmpvaW5RdWVzdChxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLmFsZXJ0c1tpbmRleF0uc2hvdyA9IGZhbHNlO1xuICAgIH07XG59KTtcbiIsIiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsZWFkZXJCb2FyZCcsIHtcbiAgICB1cmw6ICcvbGVhZGVyQm9hcmQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgXG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdGVwJywge1xuXHRcdHVybDogJy9zdGVwJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9zdGVwL3N0ZXAuaHRtbCcsIFxuXHRcdGNvbnRyb2xsZXI6ICdTdGVwQ3RybCdcblx0fSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignU3RlcEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIFVzZXJGYWN0b3J5KSB7XG5cdC8vaG93IGRvIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGNob3NlbiBRdWVzdD8gQ2FuIHdlIGluamVjdCBpdCBzb21laG93P1xuXHQvL2Fzc3VtaW5nIHdlIGtub3cgd2hhdCB0aGUgUXVlc3QgaXMuLi4uXG5cblx0Ly9JZGVudGlmeSB0aGUgdXNlciwgYW5kIGdldCB0aGUgY3VycmVudCBzdGVwIGZvciB0aGF0IHF1ZXN0XG5cdFVzZXJGYWN0b3J5LmdldFBvcHVsYXRlZFVzZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdC8vY3VycmVudGx5IGhhcmQgY29kaW5nIGl0IHRvIGp1c3QgYWNjZXNzIHRoZSBmaXJzdCBxdWVzdCBpbiBwYXJ0aWNpcGF0aW5nXG5cdFx0Ly9idXQgbWF5YmUgd2UgY2FuIGtlZXAgdHJhY2sgb2YgdGhlIGN1cnJlbnQgaW5kZXhcblx0XHQkc2NvcGUuY2hvc2VuUXVlc3QgPSBkYXRhLnBhcnRpY2lwYXRpbmdbMF07XG5cdFx0JHNjb3BlLnN0ZXBJZCA9IGRhdGEucGFydGljaXBhdGluZ1swXS5jdXJyZW50U3RlcDtcblx0XHRjb25zb2xlLmxvZyhcInN0ZXAgd2Ugc2VuZFwiLCAkc2NvcGUuc3RlcElkKVxuXHRcdFF1ZXN0RmFjdG9yeS5nZXRTdGVwQnlJZCgkc2NvcGUuc3RlcElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0JHNjb3BlLnN0ZXAgPSBkYXRhXG5cdFx0fSlcblx0XHQvL29uY2Ugd2UgZ2V0IHRoZSBzdGVwSWQgd2UgbmVlZCB0byBnZXQgdGhlIGZ1bGwgc3RlcCBvYmplY3QgdG8gZGlzcGxheVxuXG5cdH0pO1xuXHQkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKXtcblx0XHQvL3dpbGwgdmVyaWZ5IHRoYXQgdGhlIGFuc3dlciBpcyBjb3JyZWN0XG5cdFx0Ly9pZiBzbyB3aWxsIHVwZGF0ZSBjdXJyZW50IHN0ZXAgdG8gYmUgdGhlIG5leHQgc3RlcFxuXHRcdC8vYW5kIHNlbmQgdXNlciB0byBzdWNjZXNzIHBhZ2Vcblx0XHQvL2Vsc2UgaXQgd2lsbCBhbGVydCB1c2VyIHRvIHRyeSBhZ2FpblxuXHRcdGNvbnNvbGUubG9nKFwic3RlcCBJZCB3ZSBhcmUgc2VuZGluZ1wiLCAkc2NvcGUuc3RlcElkKTtcblx0XHRVc2VyRmFjdG9yeS5jaGFuZ2VDdXJyZW50U3RlcCgkc2NvcGUuc3RlcElkKTtcblx0fTtcblx0XG59KTsiLCIiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=