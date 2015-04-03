'use strict';
app.controller('editInvite', function($scope, UserFactory, QuestFactory, $state) {

    $scope.setNumOfForms = function() {
        $scope.numOfForms = Number($scope.numInvites);
        $scope.invitees = new Array();
        for (var i = 0; i < $scope.numOfForms; i++) {
            $scope.invitees.push({});
        }
    };

    $scope.invite = function() {
        // post to own server, server then post to mandrill
        QuestFactory.sendInvite($scope.invitees, $scope.selectedQuest).then(function (response) {
            console.log("response after QuestFactory.sendInvite(invitees)", response);
            bootbox.alert('Your invite(s) have been sent!', function(res) {
                console.log("bootbox alert res", res);
                $state.go('myQuests');
            });
        });
    };

});