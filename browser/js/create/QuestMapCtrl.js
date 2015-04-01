'use strict';
app.controller('QuestMap', function($scope, MapFactory) {
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);

    //begin mapDraw code
    MapFactory.drawMap($scope, $scope.$parent.stepList);
    $scope.$parent.currState = 'Map';
});