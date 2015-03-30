'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('success', {
        url: '/success',
        templateUrl: 'js/application/states/success/success.html',
        controller: 'SuccessCtrl'
    });
});


app.controller('SuccessCtrl', function($scope, QuestFactory, UserFactory, $state, storeFactory) {
    
    $scope.allItems = [];
    $scope.userData = {};
    $scope.goodResps = ['Good Job!', 'Nice job!', 'Well done!', 'You got it!', 'That\'s it!'];
    $scope.yayMessage = 'Congrats. You broke our app.';
    $scope.pickSuccess = function() {
        var which = Math.floor(Math.random() * $scope.goodResps.length);
        $scope.yayMessage = $scope.goodResps[which];
    };
    $scope.pickSuccess();
    //initial setup: get products and current yoozr data
    storeFactory.getAllProds().then(function(data) {
        $scope.allItems = data;
        storeFactory.getUserData().then(function(uData) {
            console.log(uData);
            angular.copy(uData, $scope.userData)
        });
    });
    $scope.buy = function(id, price) {
        //got a target item and a target price, so check if we can buy
        var tempPoints = $scope.userData.spent + price;
        if (($scope.userData.total - tempPoints) >= 0) {
            //can afford;
            console.log('Can afford!');
        } else if (($scope.userData.total - tempPoints) < 0) {
            console.log('Cannot afford!');
        }
    };
    $scope.continue = function() {
        $state.go('step');
    };
});