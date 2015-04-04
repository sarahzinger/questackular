'use strict';
app.controller('editQuestMap', function($scope, $window) {
    //lists quest on a nice, pretty map.
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
    $('body').scrollTop(0); //scroll back to top. 
    $scope.$parent.currState = 'Map';
});