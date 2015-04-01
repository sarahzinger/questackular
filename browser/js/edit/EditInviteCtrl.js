app.controller('editInvite', function($scope, UserFactory, $state) {

    $scope.setNumOfForms = function() {
        $scope.numOfForms = Number($scope.numInvites);
        $scope.array = new Array($scope.numOfForms);
        console.log('scope.array', $scope.array, $scope.array.length);
    };

    $scope.invitee = [{
        name: "",
        email: ""
    }];

    $scope.invite = function() {

        for (var i = 0; i < $scope.array.length; i++) {
            $.ajax({
                type: 'POST',
                url: 'https://mandrillapp.com/api/1.0/messages/send.json',
                data: {
                    key: 'hM6OlbcTpHE7fYJp-GQNsw',
                    message: {
                        from_email: 'questackular@notarealemail.com',
                        to: [{
                            email: $scope.invitee.email[i],
                            name: $scope.invitee.name[i],
                        }],
                        autotext: true,
                        subject: $scope.user.google.name + ' has invited you to join a quest!',
                        html: $scope.user.google.name + ' has invited you to join ' + $scope.selectedQuest.title + ', a quest on <a href="questacular.com">Questacular.com</a>. Log in at <a href="questacular.com">Questacular.com</a> to find out more!'
                    }
                }
            }).done(function(response) {
                console.log(response, "this worked"); // if you're into that sorta thing
            });
        };
    };

});