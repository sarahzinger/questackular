app.config(function($stateProvider) {
    $stateProvider.state('myQuests', {

        url: '/myQuests',
        templateUrl: 'js/application/states/myQuests/myQuests.html',
        controller: 'MyQuestsCtrl'
    });
});


app.controller('MyQuestsCtrl', function($scope, UserFactory, $state, QuestFactory) {
    $scope.questsJoined={};
    UserFactory.getUserInfo().then(function(userInfo) {
        console.log("userInfo", userInfo);
        $scope.userId = userInfo.user._id;
        UserFactory.getUserFromDb($scope.userId).then(function(dbUser) {
            console.log("user from DB", dbUser);
            $scope.user = dbUser;
            if (dbUser.participating.length) $scope.questsJoined = dbUser.participating;
            console.log("quest joined", $scope.questsJoined[0].questId);
            $scope.questsJoined.forEach(function(el) {
                el.cat = el.cat || {
                    cat: 'Miscellaneous',
                    url: 'http://i.imgur.com/jFkV2.jpg'
                };
            });
        });
    });

    $scope.leaveQuest = function(questId, userId) {
        // removes user from quest and quest from user in db
        QuestFactory.leaveQuest(questId, userId);
        UserFactory.getUserFromDb(userId).then(function(user) {
            $scope.questsJoined = user.participating;
        });
    };

    $scope.continueQuest = function(participatingIndex) {
        localStorage.setItem("participatingIndex", participatingIndex);
        $state.go("step");
    };
});