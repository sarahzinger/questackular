// window.onload = function () {
//     console.log("window.onload!");
//     document.getElementById("save-content").onclick = function () {
//         console.log("clicked 'save content!'");
//         chrome.runtime.sendMessage({command: 'save-content'});
//     };
// };

var app = angular.module('QuestackularExt', ['ui.router', 'ui.bootstrap']);

app.controller('extCont', function($scope, UserFactory, $state, domain) {
    $scope.selMode = localStorage.highlighting;
    console.log("domain.path", domain.path);
    $scope.login = function() {
        chrome.tabs.create({
            url: domain.path + '/auth/google'
        });
    };
    $scope.questackular = function() {
        chrome.tabs.create({
            url: domain.path
        });
    }

    $scope.saveContent = function() {
        console.log("clicked 'save content!'");
        chrome.runtime.sendMessage({command: 'save-content'});
    }

    
    $scope.highlightOn = function() {
        console.log("turn on highlight");
        $scope.selMode = true;
        localStorage.highlighting = true;
        chrome.runtime.sendMessage({command: 'select-on'});
    }

    $scope.highlightOff = function() {
        console.log("turn off highlight");
        $scope.selMode = false;
        localStorage.highlighting = false;
        chrome.runtime.sendMessage({command: 'select-off'});
    }

    
    var getName = function(){
        UserFactory.getUserInfo().then(function (data) {
            $scope.name = data.user.google.name;
            $scope.loggedIn = true;  
        });
       
    };
    getName();
    console.log("selmode on?", $scope.selMode);
});



app.config(function ($urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');


    // whitelist the chrome-extension: protocol 
    // so that it does not add "unsafe:"   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|local|chrome-extension):|data:image\//);

});