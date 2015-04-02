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
        });

        // for (var i = 0; i < $scope.array.length; i++) {
        //     $.ajax({
        //         type: 'POST',
        //         url: 'https://mandrillapp.com/api/1.0/messages/send.json',
        //         data: {
        //             key: 'hM6OlbcTpHE7fYJp-GQNsw',
        //             message: {
        //                 from_email: 'questackular@notarealemail.com',
        //                 to: [{
        //                     email: $scope.invitee.email[i],
        //                     name: $scope.invitee.name[i],
        //                 }],
        //                 autotext: true,
        //                 subject: $scope.user.google.name + ' has invited you to join a quest!',
        //                 html: $scope.user.google.name + ' has invited you to join ' + $scope.selectedQuest.title + ', a quest on <a href="questacular.com">Questacular.com</a>. Log in at <a href="questacular.com">Questacular.com</a> to find out more!'
        //             }
        //         }
        //     }).done(function (response) {
        //         console.log(response, "this worked"); // if you're into that sorta thing
        //     });
        // }

    };

});