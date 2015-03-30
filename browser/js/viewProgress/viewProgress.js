'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('viewProgress', {
        resolve: {
            getLoggedInUser: function(AuthService, $state, $http) {
                return AuthService.getLoggedInUser(true).then(function (user) {
                    if (user) {
                        return user;
                    } else {
                        $state.go("start");
                    }
                });
            }
        },
        url: '/viewProgress',
        templateUrl: 'js/viewProgress/viewProgress.html',
        controller: 'ViewProgressCtrl'
    });
});


app.controller('ViewProgressCtrl', function ($scope, UserFactory) {
    $scope.questsCreated = [];
    UserFactory.getCurrentUser().then(function (data) {
        $scope.questsCreated = data.created
        //for every quest created establish a fullParticipant List
        $scope.questsCreated.forEach(function (quest, questIndex) {
            $scope.questsCreated[questIndex].fullParticipantList = [];
            //for each participant in each quest
            quest.participants.forEach(function (participant, participantIndex, array) {
                //get the full participant
                UserFactory.getUserById(participant).then(function (fullParticipantObj) {
                    //identify the quests that are the same as the quest Created
                    fullParticipantObj.participating.forEach(function (participantsQuest, participantsQuestIndex, array) {
                        if(participantsQuest.questId._id == quest._id){
                            //display current step
                            $scope.questsCreated[questIndex].fullParticipantList.push({
                                name: fullParticipantObj.google.name,
                                currentStep: participantsQuest.currentStep.stepNum
                            });
                            console.log($scope.questsCreated[questIndex].fullParticipantList);
                        }
                    });
                });
            });
        });
    });
});