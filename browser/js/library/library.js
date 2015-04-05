app.config(function ($stateProvider) {

    $stateProvider.state('library', {
        resolve: {
                getLoggedInUser: function(AuthService, $state, $http){
                    return AuthService.getLoggedInUser(true).then(function(user) {
                        if (user) {
                            return user;
                        }else{
                            $state.go("start");
                        }
                    });
                }
            },
        url: '/library',
        templateUrl: 'js/library/library.html',
        controller: 'LibraryCtrl'
    });

});


app.controller('LibraryCtrl', function ($scope, LibraryFactory) {
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

    $scope.allSnippets = function() {
        if ($scope.showAll === false) $scope.showAll = true;
        if ($scope.showAll === true) $scope.showAll = false;
    };
});
