'use strict';


app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [{
                label: 'Create a Quest', state: 'create.quest', glyphicon: 'fa fa-plus-circle'
            }, {
                label: 'Edit Quests', state: 'edit.quest', glyphicon: 'fa fa-edit'
            }, {
                label: 'Join a Quest', state: 'join', glyphicon: 'fa fa-bicycle'
            }, {
                label: 'My Quests', state: 'myQuests', glyphicon: 'fa fa-location-arrow'
            }, {
                label: 'Library', state: 'library', glyphicon: 'fa fa-university'
            }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                console.log('logout called');
                AuthService.logout().then(function(){
                    console.log('logged out')
                });
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});