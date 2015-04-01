app.controller('CreateStep', function($scope, QuestFactory) {
    $scope.$parent.currState = 'Step';
    $scope.testTypes = ['Multiple Choice', 'Fill-in'];
    $scope.alerts = [
        { type: 'warning', msg: 'All steps must have a Url.', show: false },
        { type: 'warning', msg: 'All steps must have a question.', show: false },
        { type: 'warning', msg: 'All steps must have a point value.', show: false },
        { type: 'warning', msg: 'All steps must have a question type.', show: false },
    ];
    angular.copy(angular.fromJson(sessionStorage.stepStr), $scope.$parent.stepList); //get steps on list
    $scope.saveStep = function(newStep) {
        console.log(newStep);
        if (!newStep.url) {
            console.log('yes');
            $scope.alerts[0].show = true;
        } else if (!newStep.question) {
            $scope.alerts[1].show = true;
        } else if (!newStep.pointValue) {
            $scope.alerts[2].show = true;
        } else if (!newStep.qType) {
            $scope.alerts[3].show = true;
        } else {
            $scope.$parent.stepList = QuestFactory.saveStepIter(newStep, $scope.$parent.stepList) || $scope.$parent.stepList;
            $scope.step = {}; //clear step
        }
    };
    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
});