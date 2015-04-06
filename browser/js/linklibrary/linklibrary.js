'use strict';

app.controller('LinkLibraryCtrl', function($scope, $modal, $log, $rootScope) {

    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl: '/js/linklibrary/linklibrary.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                what: function() {
                    return what;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function() {
            $log.info('Link Library modal dismissed at: ' + new Date());
        });
    };
});

// $modalInstance represents a modal window (instance) dependency.
// it is not the same as the $modal service used above.

app.controller('ModalInstanceCtrl', function($scope, $modalInstance, LibraryFactory) {
    LibraryFactory.getLinks().then(function (links) {
        console.log(links);
        $scope.links = links;
        $scope.links.forEach(function (i) {
            console.log("i", i);
            i.date = i.saved.slice(0, i.saved.indexOf('T'));
            console.log("i.date", i.date);
            i.time = i.saved.slice(i.saved.indexOf('T') + 1, i.saved.indexOf('.'));
            console.log("i.time", i.time);
        });
    });

    $scope.showAll = false;
    $scope.showFilter = false;

    $scope.allSnippets = function() {
        console.log("allSnippets!", $scope.showAll);
        if ($scope.showAll === false) $scope.showAll = true;
        else if ($scope.showAll === true) $scope.showAll = false;
    };
    $scope.filter = function() {
        if ($scope.showFilter === false) $scope.showFilter = true;
        else if ($scope.showFilter === true) $scope.showFilter = false;
    }
    $scope.promptCopy = function(copy) {
        bootbox.prompt({
            title: "Press 'ctrl + a' to select and 'ctrl + c' to copy this link!",
            value: copy,
            callback: function(result) {
                console.log("result", result);
                if (result === null) bootbox.alert("Canceled!");
                else $scope.alertCopied(result);
            }
        });
        
    };

    $scope.alertCopied = function(link) {
        bootbox.alert("You've just copied the link: " + link + "!");
    }

});