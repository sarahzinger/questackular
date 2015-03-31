app.config(function ($stateProvider) {

    $stateProvider.state('join', {
        url: '/join',
        templateUrl: 'js/application/states/join/join.html',
        controller: 'JoinCtrl'
    });

});


app.controller('JoinCtrl', function ($scope, QuestFactory, UserFactory){
    $scope.alerts = [
        { type: 'danger', msg: 'You are already participating in this quest.', show: false },
        { type: 'success', msg: 'You\'ve successfully joined the quest.', show: false }
    ];

    $scope.imgs = [];
    UserFactory.getUserInfo().then(function (userInfo) {
        console.log("userInfo", userInfo.user._id);
        QuestFactory.getAllQuests().then(function (quests) {
            console.log("quests", quests);

            var notParticipatedQuests = _.reject(quests, function (item) {
                return _.includes(item.participants, userInfo.user._id);
            });
            $scope.unjoinedQuests =  _.reject(notParticipatedQuests, function (item) {
                return _.includes(item.winners, userInfo.user._id);
            });
            console.log("$scope.unjoinedQuests", $scope.unjoinedQuests);
        });
        
    });


    // $scope.searchBox = false;
    // $scope.search = function() {
    //     if (!$scope.searchBox) $scope.searchBox = true;
    //     else $scope.searchBox = false;
    // };

    $scope.joinQuest = function(quest) {
        console.log("quest", quest);

        UserFactory.getUserInfo().then(function (userInfo) {
            console.log("userInfo", userInfo);
            $scope.userId = userInfo.user._id;

            if (quest.participants.indexOf(userInfo.user._id) > -1) {
                // show alert
                if ($scope.alerts[1].show) $scope.alerts[1].show = false;
                if (!$scope.alerts[0].show) $scope.alerts[0].show = true;
            } else {                quest.participants.push($scope.userId);
                QuestFactory.joinQuest(quest).then(function (hello) {
                    QuestFactory.getAllQuests().then(function (quests) {
                        var notParticipatedQuests = _.reject(quests, function (item) {
                            return _.includes(item.participants, userInfo.user._id);
                        });
                        $scope.unjoinedQuests =  _.reject(notParticipatedQuests, function (item) {
                            return _.includes(item.winners, userInfo.user._id);
                        });
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
