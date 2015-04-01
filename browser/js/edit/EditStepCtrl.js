'use strict';
app.controller('editStep', function($scope, QuestFactory) {
    $scope.newStep = {};
    $scope.step = {};
    //filter stuff
    $scope.searchBox = false;
    $scope.search = function() {
        if (!$scope.searchBox) $scope.searchBox = true;
        else $scope.searchBox = false;
    };

    console.log($scope.$parent.stepList);
    $scope.testTypes = ['Multiple Choice', 'Fill-in'];
    $scope.addStep = function() {
        $scope.$parent.addForm = true;
        console.log($scope.$parent.quest._id);
    };
    $scope.removeForm = function() {
        $scope.$parent.addForm = false;
    };
    $scope.saveStep = function(newStep) {
        $scope.$parent.stepList = QuestFactory.saveStepIter(newStep, $scope.$parent.stepList) || $scope.$parent.stepList;
        console.log('save step stuff successfully switched to smaller sequences', $scope.$parent.stepList)
        $scope.newStep = {}; //clear step
        $scope.$parent.addForm = false; //hide form.
    };
});