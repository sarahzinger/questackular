'use strict';
app.controller('QuestMap', function($scope, MapFactory,$window) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
    $('body').scrollTop(0);//scroll back to top. 
    //begin mapDraw code
    // MapFactory.drawMap($scope, $scope.$parent.stepList,$window);
    $scope.$parent.currState = 'Map';
});