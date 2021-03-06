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
        console.log("newstep", newStep)
        console.log("newStep.url", newStep.url);
        if (!newStep.url) {
            console.log('no url');
            $scope.alerts[0].show = true;
        } else if (!newStep.question) {
            $scope.alerts[1].show = true;
        } else if (!newStep.pointValue) {
            $scope.alerts[2].show = true;
        } else if (!newStep.qType) {
            $scope.alerts[3].show = true;
        } else {
            if(newStep.url.indexOf("http://") == -1 && newStep.url.indexOf("https://") == -1 ){
                var oldurl = newStep.url;
                console.log("oldurl", oldurl);
                newStep.url = "http://" + oldurl;
                console.log("newstep.url", newStep.url)
            } 
            $scope.$parent.stepList = QuestFactory.saveStepIter(newStep, $scope.$parent.stepList) || $scope.$parent.stepList;
            $scope.step = {}; //clear step
        }
    };
    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
});