'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('step', {
    url: '/step',
    templateUrl: 'js/application/states/step/step.html', 
    controller: 'StepCtrl'
    });
});


app.controller('StepCtrl', function ($scope) {
  

});