// function func(){
// 	alert('hi')
// }

// //for any inline event, we have to declare it in the JS file and THEN attach it
// document.getElementById('butt').addEventListener('click',func);

var app = angular.module('scavenge', []);

app.controller('extCont', function($scope, userFactory) {
    $scope.login = function() {
        window.open('localhost:1337/auth/google', '_blank');
    };
    
    
    var getName = function(){
        userFactory.getUserInfo().then(function(data){
            $scope.name = data.user.google.name;
            $scope.loggedIn = true;
        });
       
    };
    getName();


});

