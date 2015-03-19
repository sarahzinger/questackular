'use strict';
app.config(function ($stateProvider) {
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
	$scope.noQuest = true;
	$scope.tabs = [{
	    label: "New Quest",
	    state: "create.quest"
	  }, {
	    label: "New Step",
	    state: "create.step",
	    disabled: $scope.noQuest
	  }, {
	    label: "View Quest Map",
	    state: "create.map"
	  }];
});

app.controller('CreateQuest', function($scope) {
	$scope.saveQuest = function() {
		$scope.noQuest = false;
	};
});

app.controller('CreateStep', function($scope) {
	$scope.testTypes = [{
       type:'Multiple Choice'
	}, {
	   type:'Fill-in'
	}, {
	   type:'Short Answer'
	}, {
	   type:'Find Me'
	}, {
	   type:'Puzzle?'
	}];
});

app.controller('QuestMap', function($scope) {
	$scope.map;
});