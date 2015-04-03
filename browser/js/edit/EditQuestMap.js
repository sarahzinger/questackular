'use strict';
app.controller('editQuestMap', function($scope, MapFactory, $window) {
    //lists quest on a nice, pretty map.
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList);
    $('body').scrollTop(0); //scroll back to top. 
    //begin mapDraw code
    $scope.window = $window;
    // $window.$onresize = function(e) {
    console.log('w: ', $scope.window.innerWidth, 'h: ', $scope.window.innerHeight);

    //     MapFactory.drawMap($scope, $scope.$parent.stepList, $window);
    // }
    MapFactory.drawMap($scope, $scope.$parent.stepList, $window);
    $scope.$parent.currState = 'Map';
});