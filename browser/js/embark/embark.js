app.config(function ($stateProvider) {

    $stateProvider.state('embark', {
        url: '/embark',
        templateUrl: 'js/embark/embark.html',
        controller: 'EmbarkCtrl'
    });

});


app.controller('EmbarkCtrl', function ($scope  ){

});
