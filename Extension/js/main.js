

//console.log
console.log('is this file getting run?')
// //for any inline event, we have to declare it in the JS file and THEN attach it
// document.getElementById('butt').addEventListener('click',func);

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
    console.log('we are running the extcont')
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
            return $http.post('/api/step', step).then(function(response) {
                return response.data;
            });
        },
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('/api/quests', quest).then(function(response) {
                return response.data;
            });
        },
        getAllQuests: function() {
            return $http.get('/api/quests').then(function(res) {
                return res.data;
            });
        },
        getQuestById: function(questId) {
            return $http.get('/api/quests/' + questId).then(function(res) {
                return res.data;
            });
        },
        joinQuest: function(questInfo) {
            return $http.post('/api/quests/participants', questInfo).then(function(response) {
                console.log(response);
            });
        },
        leaveQuest: function(questId) {
            return $http.delete('/api/quests/participants/'+questId).then(function(response) {
                console.log(response);
            });
        },
        getQuestsByUser: function(id) {
            //get all quests 'owned' by user
            return $http.get('/api/quests/user/' + id).then(function(res) {
                return res.data;
            });
        },
        getStepListById: function(id) {
            //gets a bunch of steps by their Quest ID
            return $http.get('/api/step/list/' + id).then(function(res) {
                return res.data;
            });
        },
        remStep: function(id){
            //delete a step. only necessary if step has an ID 
            //(i.e., step already is on DB)
            return $http.get('/api/step/rem/'+id).then(function(res){
                return res.data;
            });
        },
        updateStep: function(updatedStep) {
            //mongoose seems to ಥ_ಥ when we try to re-save an object id.
            //SO we're doing a findbyidandupdate
            return $http.post('/api/step/upd',updatedStep).then(function(res){
                return res.data;
            });
        }
    };

});
app.factory('UserFactory', function($http){
	return{
		getUserInfo: function(){
			return $http.get('http://localhost:1337/session').then( function(res) {
				console.log("name from factory",res.data.user.google.name);
				return res.data;
   			});
		}, 
		getUserFromDb: function (userId) {
			console.log("userId", userId);
			return $http.get('http://localhost:1337/api/users/' + userId).then(function (dbUser) {
				console.log("dbUser", dbUser);
				return dbUser.data;
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
      $scope.questsJoined = dbUser.participating;
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
  $stateProvider.state('step', {
    url: '/step',
    templateUrl: 'js/application/states/step/step.html', 
    controller: 'StepCtrl'
    });
});


app.controller('StepCtrl', function ($scope) {
  

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9RdWVzdEZhY3RvcnkuanMiLCJmYWN0b3JpZXMvVXNlckZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJzdGF0ZXMvaG9tZS9ob21lLmpzIiwic3RhdGVzL2pvaW4vam9pbi5qcyIsInN0YXRlcy9sZWFkZXJCb2FyZC9sZWFkZXJCb2FyZC5qcyIsInN0YXRlcy9teVF1ZXN0cy9teVF1ZXN0cy5qcyIsInN0YXRlcy9wcm9maWxlL3Byb2ZpbGUuanMiLCJzdGF0ZXMvc3RlcC9zdGVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbi8vY29uc29sZS5sb2dcbmNvbnNvbGUubG9nKCdpcyB0aGlzIGZpbGUgZ2V0dGluZyBydW4/Jylcbi8vIC8vZm9yIGFueSBpbmxpbmUgZXZlbnQsIHdlIGhhdmUgdG8gZGVjbGFyZSBpdCBpbiB0aGUgSlMgZmlsZSBhbmQgVEhFTiBhdHRhY2ggaXRcbi8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidXR0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmMpO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ1F1ZXN0YWNrdWxhckV4dCcsIFsndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCddKTtcblxuYXBwLmNvbnRyb2xsZXIoJ2V4dENvbnQnLCBmdW5jdGlvbigkc2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcbiAgICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93Lm9wZW4oJ2xvY2FsaG9zdDoxMzM3L2F1dGgvZ29vZ2xlJywgJ19ibGFuaycpO1xuICAgIH07XG4gICAgXG4gICAgXG4gICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICBVc2VyRmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAkc2NvcGUubmFtZSA9IGRhdGEudXNlci5nb29nbGUubmFtZTtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgIFxuICAgIH07XG4gICAgZ2V0TmFtZSgpO1xuICAgIGNvbnNvbGUubG9nKCd3ZSBhcmUgcnVubmluZyB0aGUgZXh0Y29udCcpXG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2wgXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCIgICBcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBBbmd1bGFyIGJlZm9yZSB2MS4yIHVzZXMgJGNvbXBpbGVQcm92aWRlci51cmxTYW5pdGl6YXRpb25XaGl0ZWxpc3QoLi4uKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmZhY3RvcnkoJ1F1ZXN0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VuZFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIC8vc2F2ZXMgdGhlIHF1ZXN0XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zdGVwJywgc3RlcCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRRdWVzdDogZnVuY3Rpb24ocXVlc3QpIHtcbiAgICAgICAgICAgIC8vc2F2ZXMgdGhlIHF1ZXN0LCByZXR1cm5zIGl0cyBJRFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcXVlc3RzJywgcXVlc3QpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRBbGxRdWVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9xdWVzdHMnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdEJ5SWQ6IGZ1bmN0aW9uKHF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcXVlc3RzLycgKyBxdWVzdElkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBqb2luUXVlc3Q6IGZ1bmN0aW9uKHF1ZXN0SW5mbykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcXVlc3RzL3BhcnRpY2lwYW50cycsIHF1ZXN0SW5mbykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBsZWF2ZVF1ZXN0OiBmdW5jdGlvbihxdWVzdElkKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3F1ZXN0cy9wYXJ0aWNpcGFudHMvJytxdWVzdElkKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0c0J5VXNlcjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIC8vZ2V0IGFsbCBxdWVzdHMgJ293bmVkJyBieSB1c2VyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3F1ZXN0cy91c2VyLycgKyBpZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U3RlcExpc3RCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgLy9nZXRzIGEgYnVuY2ggb2Ygc3RlcHMgYnkgdGhlaXIgUXVlc3QgSURcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3RlcC9saXN0LycgKyBpZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtU3RlcDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgLy9kZWxldGUgYSBzdGVwLiBvbmx5IG5lY2Vzc2FyeSBpZiBzdGVwIGhhcyBhbiBJRCBcbiAgICAgICAgICAgIC8vKGkuZS4sIHN0ZXAgYWxyZWFkeSBpcyBvbiBEQilcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3RlcC9yZW0vJytpZCkudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVTdGVwOiBmdW5jdGlvbih1cGRhdGVkU3RlcCkge1xuICAgICAgICAgICAgLy9tb25nb29zZSBzZWVtcyB0byDgsqVf4LKlIHdoZW4gd2UgdHJ5IHRvIHJlLXNhdmUgYW4gb2JqZWN0IGlkLlxuICAgICAgICAgICAgLy9TTyB3ZSdyZSBkb2luZyBhIGZpbmRieWlkYW5kdXBkYXRlXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zdGVwL3VwZCcsdXBkYXRlZFN0ZXApLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJue1xuXHRcdGdldFVzZXJJbmZvOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb24nKS50aGVuKCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJuYW1lIGZyb20gZmFjdG9yeVwiLHJlcy5kYXRhLnVzZXIuZ29vZ2xlLm5hbWUpO1xuXHRcdFx0XHRyZXR1cm4gcmVzLmRhdGE7XG4gICBcdFx0XHR9KTtcblx0XHR9LCBcblx0XHRnZXRVc2VyRnJvbURiOiBmdW5jdGlvbiAodXNlcklkKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInVzZXJJZFwiLCB1c2VySWQpO1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDoxMzM3L2FwaS91c2Vycy8nICsgdXNlcklkKS50aGVuKGZ1bmN0aW9uIChkYlVzZXIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJkYlVzZXJcIiwgZGJVc2VyKTtcblx0XHRcdFx0cmV0dXJuIGRiVXNlci5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBhIFF1ZXN0Jywgc3RhdGU6ICdjcmVhdGUucXVlc3QnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnSm9pbiBhIFF1ZXN0Jywgc3RhdGU6ICdob21lJyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFF1ZXN0cycsIHN0YXRlOiAnTXlRdWVzdHMnIFxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IGRhdGEudXNlcjtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0TmFtZSgpO1xuXG4gICAgICAgICAgICAvLyBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGNhbGxlZCcpO1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICRzdGF0ZS5nbygnc3RhcnQnKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHVybDogJy8nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAkc2NvcGUuc3RhdGVzID0gW3tcbiAgICBzdGF0ZTogXCJsZWFkZXJCb2FyZFwiLCB0aXRsZTogXCJMZWFkZXIgQm9hcmRcIlxuICB9LFxuICB7XG4gICAgc3RhdGU6IFwicHJvZmlsZVwiLCB0aXRsZTogXCJQcm9maWxlXCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcImpvaW5cIiwgdGl0bGU6IFwiSm9pbiBBIFF1ZXN0XCJcbiAgfSxcbiAge1xuICAgIHN0YXRlOiBcIm15UXVlc3RzXCIsIHRpdGxlOiBcIk15IFF1ZXN0c1wiXG4gIH1dO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2pvaW4nLCB7XG4gICAgICAgIHVybDogJy9qb2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvam9pbi9qb2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9pbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdKb2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFF1ZXN0RmFjdG9yeSwgQXV0aFNlcnZpY2Upe1xuICAgICRzY29wZS5hbGVydHMgPSBbXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LWRhbmdlcicsIG1zZzogJ1lvdSBhcmUgYWxyZWFkeSBwYXJ0aWNpcGF0aW5nIGluIHRoaXMgcXVlc3QuJywgc2hvdzogZmFsc2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYWxlcnQtc3VjY2VzcycsIG1zZzogJ1lvdVxcJ3ZlIHN1Y2Nlc3NmdWxseSBqb2luZWQgdGhlIHF1ZXN0LicsIHNob3c6IGZhbHNlIH1cbiAgICBdO1xuXG4gICAgUXVlc3RGYWN0b3J5LmdldEFsbFF1ZXN0cygpLnRoZW4oZnVuY3Rpb24ocXVlc3RzKSB7XG4gICAgICAgICRzY29wZS5xdWVzdHMgPSBxdWVzdHM7IC8vICRzY29wZS51bmpvaW5lZFF1ZXN0cyBcbiAgICB9KTtcbiAgICAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNlYXJjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5zZWFyY2hCb3gpICRzY29wZS5zZWFyY2hCb3ggPSB0cnVlO1xuICAgICAgICBlbHNlICRzY29wZS5zZWFyY2hCb3ggPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmpvaW5RdWVzdCA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3RcIiwgcXVlc3QpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VySWQgPSB1c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgam9pbmVkLCBkbyBzb21ldGhpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzXCIsIHF1ZXN0LnBhcnRpY2lwYW50cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuX2lkXCIsIHVzZXIuX2lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpXCIsIHF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKSk7XG5cbiAgICAgICAgICAgIGlmIChxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkgPiAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgYWxlcnRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVzdC5wYXJ0aWNpcGFudHMucHVzaCgkc2NvcGUudXNlcklkKTtcbiAgICAgICAgICAgICAgICBRdWVzdEZhY3Rvcnkuam9pblF1ZXN0KHF1ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1swXS5zaG93KSAkc2NvcGUuYWxlcnRzWzBdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMV0uc2hvdykgJHNjb3BlLmFsZXJ0c1sxXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlQWxlcnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUuYWxlcnRzW2luZGV4XS5zaG93ID0gZmFsc2U7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xlYWRlckJvYXJkJywge1xuICAgIHVybDogJy9sZWFkZXJCb2FyZCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbGVhZGVyQm9hcmQvbGVhZGVyQm9hcmQuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZEN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTGVhZGVyQm9hcmRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICBcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ215UXVlc3RzJywge1xuICAgIFxuICAgIHVybDogJy9teVF1ZXN0cycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbXlRdWVzdHMvbXlRdWVzdHMuaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdNeVF1ZXN0c0N0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignTXlRdWVzdHNDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnkpIHtcbiAgVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uICh1c2VySW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwidXNlckluZm9cIiwgdXNlckluZm8pO1xuICAgIHZhciBpZCA9IHVzZXJJbmZvLnVzZXIuX2lkO1xuICAgIFVzZXJGYWN0b3J5LmdldFVzZXJGcm9tRGIoaWQpLnRoZW4oZnVuY3Rpb24gKGRiVXNlcikge1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIGZyb20gREJcIiwgZGJVc2VyKTtcbiAgICAgICRzY29wZS51c2VyID0gZGJVc2VyO1xuICAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IGRiVXNlci5wYXJ0aWNpcGF0aW5nO1xuICAgICAgY29uc29sZS5sb2coXCJxdWVzdCBqb2luZWRcIiwgJHNjb3BlLnF1ZXN0c0pvaW5lZFswXS5xdWVzdElkKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmhlbGxvID0gXCJoZWxsbyFcIjtcblxuICAvLyAkc2NvcGUubGVhdmVRdWVzdCA9IGZ1bmN0aW9uIChxdWVzdElkLCB1c2VySWQpIHtcbiAgLy8gICAvLyByZW1vdmVzIHVzZXIgZnJvbSBxdWVzdCBhbmQgcXVlc3QgZnJvbSB1c2VyIGluIGRiXG4gIC8vICAgLy8gUXVlc3RGYWN0b3J5LmxlYXZlUXVlc3QocXVlc3RJZCwgdXNlcklkKTsgXG4gIC8vICAgVXNlckZhY3RvcnkuZ2V0VXNlckZyb21EYigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgLy8gICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gIC8vICAgfSk7XG4gIC8vIH07XG59KTsiLCIiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3RlcCcsIHtcbiAgICB1cmw6ICcvc3RlcCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvc3RlcC9zdGVwLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnU3RlcEN0cmwnXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignU3RlcEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gIFxuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=