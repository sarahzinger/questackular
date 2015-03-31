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
            $scope.quests = quests;

            $scope.unjoinedQuests = _.reject(quests, function (item) {
                return _.includes(item.participants, user._id) && _.includes(item.winners, user._id);
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
            console.log("quest.participants", quest.participants);
            console.log("quest.participants.indexOf(user._id)", quest.participants.indexOf(userInfo.user._id));

            if (quest.participants.indexOf(userInfo.user._id) > -1) {
                // show alert
                console.log("quest.participants.indexOf(user._id)", quest.participants.indexOf(userInfo.user._id));
                if ($scope.alerts[1].show) $scope.alerts[1].show = false;
                if (!$scope.alerts[0].show) $scope.alerts[0].show = true;
            } else {
                console.log("quest.participants.indexOf(user._id)", quest.participants.indexOf(userInfo.user._id));
                quest.participants.push($scope.userId);
                QuestFactory.joinQuest(quest).then(function () {
                    QuestFactory.getAllQuests().then(function (quests) {
                        $scope.quests = quests;
                        $scope.unjoinedQuests = _.reject(quests, function (item) {
                            return _.includes(item.participants, userInfo.user._id) && _.includes(item.winners, userInfo.user._id);
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
