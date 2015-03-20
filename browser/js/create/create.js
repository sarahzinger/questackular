'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('create', {
            url: '/create',
            templateUrl: 'js/create/create.html',
            controller: 'CreateCtrl'
        })
        .state('create.quest', {
            url: '/quest',
            templateUrl: 'js/create/quest.html',
            controller: 'CreateQuest'
        })
        .state('create.step', {
            url: '/step',
            templateUrl: 'js/create/step.html',
            controller: 'CreateStep'
        })
        .state('create.map', {
            url: '/map',
            templateUrl: 'js/create/map.html',
            controller: 'QuestMap'
        });
});

app.controller('CreateCtrl', function($scope) {
	$scope.currState='quest';
	$scope.quest={};
    $scope.questExists = false;
    $scope.tabs = [{
        label: "New Quest",
        state: "create.quest"
    }, {
        label: "New Step",
        state: "create.step",
        disabled: $scope.noQuest
    }, {
        label: "Quest Map",
        state: "create.map",
        disabled: $scope.noQuest
    }];
    $scope.saveFullQuest = function(){
    	//this will save the full quest.
    	//whoopie.
    }
});

app.controller('CreateQuest', function($scope) {
	$scope.$parent.currState='Quest';
	if (sessionStorage.newQuest=='undefined'){
		sessionStorage.removeItem('newQuest');
	}else if (sessionStorage.newQuest){
		//sesh storage obj is defined,
		console.log("STUFF HERE");
		$scope.$parent.quest = angular.fromJson(sessionStorage.newQuest);
		$scope.$parent.questExists = true;
		//also disable
	}
    $scope.saveQuest = function() {
        $scope.$parent.questExists = true;
        console.log('createQuest', $scope.$parent.questExists);
        console.log('HI',$scope.$parent.quest);
        sessionStorage.newQuest = angular.toJson($scope.$parent.quest);
    };
    $scope.clearData = function(){
    	var clearConf = confirm('Are you sure you want to clear this quest? It hasn\'t yet been saved!');
    	if (clearConf){
    		sessionStorage.removeItem('newQuest');
    		$scope.$parent.quest = {};
    	}
    }
});

app.controller('CreateStep', function($scope) {
	$scope.$parent.currState='Step';
    $scope.testTypes = [{
        type: 'Multiple Choice'
    }, {
        type: 'Fill-in'
    }, {
        type: 'Short Answer'
    }, {
        type: 'Find Me'
    }, {
        type: 'Puzzle?'
    }];
    $scope.steps=[];
    //empty arr holding current list-o-steps.
    //we'll eventually need to $http.get this 

});

app.controller('QuestMap', function($scope) {
    $scope.$parent.currState='Map';
});