app.config(function ($stateProvider) {

    $stateProvider.state('join', {
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
        url: '/join',
        templateUrl: 'js/join/join.html',
        controller: 'JoinCtrl'
    });

});


app.controller('JoinCtrl', function ($scope, QuestFactory, AuthService) {
    $scope.alerts = [
        { type: 'danger', msg: 'You are already participating in this quest.', show: false },
        { type: 'success', msg: 'You\'ve successfully joined the quest.', show: false }
    ];

    QuestFactory.getAllQuests().then(function(quests) {
        $scope.quests = quests; // $scope.unjoinedQuests 
    });
    $scope.searchBox = false;
    $scope.search = function() {
        (!$scope.searchBox) ? $scope.searchBox = true : $scope.searchBox = false;
    };

    AuthService.getLoggedInUser().then(function (user) {
        console.log("AuthService user", user);
        QuestFactory.getAllQuests().then(function (quests) {
            var notParticipatedQuests = _.reject(quests, function (item) {
                            return _.includes(item.participants, user._id);
                        });
                        var notWonOrParticipatedInQuests =  _.reject(notParticipatedQuests, function (item) {
                            return _.includes(item.winners, user._id);
                        });
                        console.log("notWonOrParticipatedInQuests", notWonOrParticipatedInQuests)
                        $scope.unjoinedQuests = _.reject(notWonOrParticipatedInQuests, function (item) {
                            console.log("is this happening?")
                            console.log("item.active", item.active)
                            return item.active === false;
                        }); 
                        console.log("$scope.unjoinedQuests", $scope.unjoinedQuests) 
        });
    });

    $scope.joinQuest = function(quest) {
        console.log("quest", quest);

        AuthService.getLoggedInUser().then(function (user) {
            $scope.userId = user._id;
            // if already joined, do something
            console.log("quest.participants", quest.participants);
            console.log("user", user);
            console.log("user._id", user._id);

            if (quest.participants.indexOf(user._id) > -1) {
                // show alert
                if ($scope.alerts[1].show) $scope.alerts[1].show = false;
                if (!$scope.alerts[0].show) $scope.alerts[0].show = true;
            } else {
                quest.participants.push($scope.userId);
                QuestFactory.joinQuest(quest).then(function (hello) {
                    QuestFactory.getAllQuests().then(function (quests) {
                        var notParticipatedQuests = _.reject(quests, function (item) {
                            return _.includes(item.participants, user._id);
                        });
                        var notWonOrParticipatedInQuests =  _.reject(notParticipatedQuests, function (item) {
                            return _.includes(item.winners, user._id);
                        });
                        console.log("notWonOrParticipatedInQuests", notWonOrParticipatedInQuests)
                        $scope.unjoinedQuests = _.reject(notWonOrParticipatedInQuests, function (item) {
                            console.log("is this happening?")
                            console.log("item.active", item.active)
                            return item.active === false;
                        }); 
                        console.log("$scope.unjoinedQuests", $scope.unjoinedQuests) 
                    });
                });
                if ($scope.alerts[0].show) $scope.alerts[0].show = false;
                if (!$scope.alerts[1].show) $scope.alerts[1].show = true;
            }

        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
});
