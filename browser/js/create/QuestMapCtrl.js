'use strict';
app.controller('QuestMap', function($scope,$window) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
    $('body').scrollTop(0);//scroll back to top. 
    //begin mapDraw code
    $scope.$parent.currState = 'Map';
});