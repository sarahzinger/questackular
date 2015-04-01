'use strict';
app.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
app.config(function($stateProvider) {
    $stateProvider.state('edit', {
            resolve: {
                getLoggedInUser: function(AuthService, $state, $http) {
                    return AuthService.getLoggedInUser(true).then(function(user) {
                        if (user) {
                            return user;
                        } else {
                            $state.go("start");
                        }
                    });
                }
            },
            abstract: true,
            url: '/edit',
            templateUrl: 'js/edit/edit.html',
            controller: 'editCtrl'
        })
        .state('edit.quest', {
            url: '/quest',
            templateUrl: 'js/edit/editQuest.html',
            controller: 'editQuest'
        })
        .state('edit.step', {
            url: '/step',
            templateUrl: 'js/edit/editStep.html',
            controller: 'editStep'
        })
        .state('edit.map', {
            url: '/map',
            templateUrl: 'js/edit/editMap.html',
            controller: 'editQuestMap'
        })
        .state('edit.invite', {
            url: '/invite',
            templateUrl: 'js/edit/invite.html',
            controller: 'editInvite'
        });
});