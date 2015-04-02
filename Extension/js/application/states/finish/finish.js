'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('finish', {
		url: '/finish',
		templateUrl: 'js/application/states/finish/finish.html', 
		controller: 'FinishCtrl'
	});
});

app.controller('FinishCtrl', function ($scope) {
	
})
