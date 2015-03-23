app.config(function ($stateProvider) {

    $stateProvider.state('embark', {
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
        url: '/embark',
        templateUrl: 'js/embark/embark.html',
        controller: 'EmbarkCtrl'
    });

});


app.controller('EmbarkCtrl', function ($scope, QuestFactory, AuthService){
    // $scope.allQuests;
    // $scope.unjoinedQuests;
    QuestFactory.getAllQuests().then(function(quests) {
        $scope.quests = quests; // $scope.unjoinedQuests 
    });
    $scope.searchBox = false;
    $scope.search = function() {
        if (!$scope.searchBox) $scope.searchBox = true;
        else $scope.searchBox = false;
    };

    $scope.joinQuest = function(quest) {
        AuthService.getLoggedInUser().then(function (user) {
            $scope.userId = user._id;
            quest.participants.push($scope.userId);
            QuestFactory.joinQuest(quest);
        });

        // participating [ questId, current]
    }
});
