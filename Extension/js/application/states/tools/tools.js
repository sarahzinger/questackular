app.config(function ($stateProvider) {
  $stateProvider.state('tools', {
    
    url: '/tools',
    templateUrl: 'js/application/states/tools/tools.html', 
    controller: 'ToolsCtrl'
    });
});


app.controller('ToolsCtrl', function ($scope) {
    if (typeof localStorage.highlighting === 'undefined') {
        localStorage.highlighting = false;
    }
    $scope.selMode = localStorage.highlighting;
    $scope.saveContent = function() {
        chrome.runtime.sendMessage({command: 'save-content'});
    }

    $scope.highlight= function(bool) {
        var select;
        $scope.selMode = bool.toString();
        localStorage.highlighting = bool;
        if (bool) select = 'select-on';
        else select = 'select-off';
        chrome.runtime.sendMessage({command: select});
    }

});