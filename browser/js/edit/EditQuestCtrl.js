'use strict';
app.controller('editQuest', function($scope) {
    $scope.searchBox = false;
    $scope.search = function() {
        if (!$scope.searchBox) $scope.searchBox = true;
        else $scope.searchBox = false;
    };

    // window.addEventListener('beforeunload', function(e) {
    //     e.returnValue = "You haven't saved! Click Okay to continue without saving, or Cancel to stay on this page!";
    // })

    //add an event listener to an object ON THIS PAGE
});