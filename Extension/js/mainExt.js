// function func(){
// 	alert('hi')
// }

// //for any inline event, we have to declare it in the JS file and THEN attach it
// document.getElementById('butt').addEventListener('click',func);

var app = angular.module('scavenge', []);

app.controller('extCont', function($scope) {

    $scope.test = 'HELLO THERE 1234';
    $scope.funky = function() {
        // alert('Getting tab!')
     
    }
});