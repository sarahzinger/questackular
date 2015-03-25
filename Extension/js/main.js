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
    resolve: {
      getLoggedInUser: function(UserFactory, $state, $http){
        return UserFactory.getUserInfo().then(function(user){
          if (user) {
            return user;
          } else {
            $state.go("home");
          }
        });
      }
    },
    url: '/home',
    templateUrl: 'js/application/states/home/home.html', 
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
        templateUrl: 'js/states/join/join.html',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsImRpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsInN0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5qcyIsInN0YXRlcy9ob21lL2hvbWUuanMiLCJzdGF0ZXMvam9pbi9qb2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZnVuY3Rpb24gZnVuYygpe1xuLy8gXHRhbGVydCgnaGknKVxuLy8gfVxuXG4vLyAvL2ZvciBhbnkgaW5saW5lIGV2ZW50LCB3ZSBoYXZlIHRvIGRlY2xhcmUgaXQgaW4gdGhlIEpTIGZpbGUgYW5kIFRIRU4gYXR0YWNoIGl0XG4vLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnV0dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdRdWVzdGFja3VsYXJFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnXSk7XG5cbmFwcC5jb250cm9sbGVyKCdleHRDb250JywgZnVuY3Rpb24oJHNjb3BlLCBVc2VyRmFjdG9yeSkge1xuICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3BlbignbG9jYWxob3N0OjEzMzcvYXV0aC9nb29nbGUnLCAnX2JsYW5rJyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICB2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gZGF0YS51c2VyLmdvb2dsZS5uYW1lO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfTtcbiAgICBnZXROYW1lKCk7XG5cblxufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sIFxuICAgIC8vIHNvIHRoYXQgaXQgZG9lcyBub3QgYWRkIFwidW5zYWZlOlwiICAgXG4gICAgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxtYWlsdG98Y2hyb21lLWV4dGVuc2lvbik6Lyk7XG4gICAgLy8gQW5ndWxhciBiZWZvcmUgdjEuMiB1c2VzICRjb21waWxlUHJvdmlkZXIudXJsU2FuaXRpemF0aW9uV2hpdGVsaXN0KC4uLilcbn0pO1xuXG4vLyBhcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc3RhdGUpIHtcblxuLy8gICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4vLyAgICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbi8vICAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4vLyAgICAgfTtcblxuLy8gICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4vLyAgICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4vLyAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlKSB7XG5cbi8vICAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4vLyAgICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuLy8gICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbi8vICAgICAgICAgICAgIHJldHVybjtcbi8vICAgICAgICAgfVxuXG4vLyAgICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuLy8gICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbi8vICAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4vLyAgICAgICAgICAgICByZXR1cm47XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4vLyAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbi8vICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuLy8gICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuLy8gICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuLy8gICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuLy8gICAgICAgICAgICAgdmFyIGRlc3RpbmF0aW9uID0gdXNlciA/IHRvU3RhdGUubmFtZSA6ICdsb2dpbic7XG4vLyAgICAgICAgICAgICAkc3RhdGUuZ28oZGVzdGluYXRpb24pO1xuLy8gICAgICAgICB9KTtcblxuLy8gICAgIH0pO1xuXG4vLyB9KTtcblxuIiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm57XG5cdFx0Z2V0VXNlckluZm86IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvbicpLnRoZW4oIGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIm5hbWUgZnJvbSBmYWN0b3J5XCIscmVzLmRhdGEudXNlci5nb29nbGUubmFtZSlcblx0XHRcdFx0cmV0dXJuIHJlcy5kYXRhO1xuICAgXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBhIFF1ZXN0Jywgc3RhdGU6ICdjcmVhdGUucXVlc3QnIFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnSm9pbiBhIFF1ZXN0Jywgc3RhdGU6ICdob21lJyBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFF1ZXN0cycsIHN0YXRlOiAnTXlRdWVzdHMnIFxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCdsb2NhbGhvc3Q6MTMzNy9hdXRoL2dvb2dsZScsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdldE5hbWUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IGRhdGEudXNlcjtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0TmFtZSgpO1xuXG4gICAgICAgICAgICAvLyBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGNhbGxlZCcpO1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICRzdGF0ZS5nbygnc3RhcnQnKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdNeVF1ZXN0cycsIHtcbiAgICByZXNvbHZlOiB7XG4gICAgICBnZXRMb2dnZWRJblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUsICRodHRwKXtcbiAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcih0cnVlKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGlmKHVzZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAkc3RhdGUuZ28oXCJzdGFydFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXJsOiAnL015UXVlc3RzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9NeVF1ZXN0cy9NeVF1ZXN0cy5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ015UXVlc3RzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdNeVF1ZXN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSwgUXVlc3RGYWN0b3J5KXtcbiAgLy8gY29uc29sZS5sb2coXCJVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpXCIsIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkpO1xuICBVc2VyRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAkc2NvcGUudXNlciA9IHVzZXI7XG4gICAgJHNjb3BlLnVzZXJJZCA9IHVzZXIuX2lkO1xuICAgICRzY29wZS5xdWVzdHNDcmVhdGVkID0gdXNlci5jcmVhdGVkO1xuICAgICRzY29wZS5xdWVzdHNKb2luZWQgPSB1c2VyLnBhcnRpY2lwYXRpbmc7XG4gICAgJHNjb3BlLnF1ZXN0c0NvbXBsZXRlZCA9IHVzZXIucGFzdFF1ZXN0cztcbiAgfSk7XG5cbiAgJHNjb3BlLmxlYXZlUXVlc3QgPSBmdW5jdGlvbiAocXVlc3RJZCwgdXNlcklkKSB7XG4gICAgLy8gcmVtb3ZlcyB1c2VyIGZyb20gcXVlc3QgYW5kIHF1ZXN0IGZyb20gdXNlciBpbiBkYlxuICAgIFF1ZXN0RmFjdG9yeS5sZWF2ZVF1ZXN0KHF1ZXN0SWQsIHVzZXJJZCk7IFxuICAgIFVzZXJGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgJHNjb3BlLnF1ZXN0c0pvaW5lZCA9IHVzZXIucGFydGljaXBhdGluZztcbiAgICB9KTtcbiAgICBcbiAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGdldExvZ2dlZEluVXNlcjogZnVuY3Rpb24oVXNlckZhY3RvcnksICRzdGF0ZSwgJGh0dHApe1xuICAgICAgICByZXR1cm4gVXNlckZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHN0YXRlLmdvKFwiaG9tZVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXJsOiAnL2hvbWUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSAgKXtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdqb2luJywge1xuICAgIFx0cmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGdldExvZ2dlZEluVXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRzdGF0ZSwgJGh0dHApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKHRydWUpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhcInN0YXJ0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB1cmw6ICcvam9pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc3RhdGVzL2pvaW4vam9pbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0pvaW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuY29udHJvbGxlcignSm9pbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBRdWVzdEZhY3RvcnksIEF1dGhTZXJ2aWNlKXtcbiAgICAkc2NvcGUuYWxlcnRzID0gW1xuICAgICAgICB7IHR5cGU6ICdhbGVydC1kYW5nZXInLCBtc2c6ICdZb3UgYXJlIGFscmVhZHkgcGFydGljaXBhdGluZyBpbiB0aGlzIHF1ZXN0LicsIHNob3c6IGZhbHNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2FsZXJ0LXN1Y2Nlc3MnLCBtc2c6ICdZb3VcXCd2ZSBzdWNjZXNzZnVsbHkgam9pbmVkIHRoZSBxdWVzdC4nLCBzaG93OiBmYWxzZSB9XG4gICAgXTtcblxuICAgIFF1ZXN0RmFjdG9yeS5nZXRBbGxRdWVzdHMoKS50aGVuKGZ1bmN0aW9uKHF1ZXN0cykge1xuICAgICAgICAkc2NvcGUucXVlc3RzID0gcXVlc3RzOyAvLyAkc2NvcGUudW5qb2luZWRRdWVzdHMgXG4gICAgfSk7XG4gICAgJHNjb3BlLnNlYXJjaEJveCA9IGZhbHNlO1xuICAgICRzY29wZS5zZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUuc2VhcmNoQm94KSAkc2NvcGUuc2VhcmNoQm94ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSAkc2NvcGUuc2VhcmNoQm94ID0gZmFsc2U7XG4gICAgfTtcblxuICAgICRzY29wZS5qb2luUXVlc3QgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0XCIsIHF1ZXN0KTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcklkID0gdXNlci5faWQ7XG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IGpvaW5lZCwgZG8gc29tZXRoaW5nXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50c1wiLCBxdWVzdC5wYXJ0aWNpcGFudHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLl9pZFwiLCB1c2VyLl9pZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXN0LnBhcnRpY2lwYW50cy5pbmRleE9mKHVzZXIuX2lkKVwiLCBxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZCkpO1xuXG4gICAgICAgICAgICBpZiAocXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGFsZXJ0XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJxdWVzdC5wYXJ0aWNpcGFudHMuaW5kZXhPZih1c2VyLl9pZClcIiwgcXVlc3QucGFydGljaXBhbnRzLmluZGV4T2YodXNlci5faWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsZXJ0c1sxXS5zaG93KSAkc2NvcGUuYWxlcnRzWzFdLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVlc3QucGFydGljaXBhbnRzLnB1c2goJHNjb3BlLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgUXVlc3RGYWN0b3J5LmpvaW5RdWVzdChxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hbGVydHNbMF0uc2hvdykgJHNjb3BlLmFsZXJ0c1swXS5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuYWxlcnRzWzFdLnNob3cpICRzY29wZS5hbGVydHNbMV0uc2hvdyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLmFsZXJ0c1tpbmRleF0uc2hvdyA9IGZhbHNlO1xuICAgIH07XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==