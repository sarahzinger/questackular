'use strict';
app.controller('editQuestMap', function($scope, MapFactory) {
    //lists quest on a nice, pretty map.
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
 	$('body').scrollTop(0);//scroll back to top. 
    //begin mapDraw code
    MapFactory.drawMap($scope, $scope.$parent.stepList);
    $scope.$parent.currState = 'Map';
});