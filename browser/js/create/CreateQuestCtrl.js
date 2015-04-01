app.controller('CreateQuest', function($scope) {
    $scope.$parent.currState = 'Quest';
    if (sessionStorage.newQuest == 'undefined') {
        sessionStorage.removeItem('newQuest');
    } else if (sessionStorage.newQuest) {
        //sesh storage obj is defined,
        $scope.$parent.quest = angular.fromJson(sessionStorage.newQuest);
        $scope.$parent.questExists = true;
        //also disable
    }
    $scope.saveQuest = function() {
        $scope.$parent.questExists = true;
        //now assign correct url to cats.url prop
        for (var n = 0; n < $scope.$parent.cats.length; n++) {
            if ($scope.$parent.cats[n].cat == $scope.$parent.quest.cat.cat) {
                $scope.$parent.quest.cat.url = $scope.$parent.cats[n].url;
            }
        }
        sessionStorage.newQuest = angular.toJson($scope.$parent.quest);
    };

});