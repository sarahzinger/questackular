'use strict';
app.factory('createStep', function () {

    return {
        sendStep: function (step,$http) {
            return $http.post('/api/step/save', step)
                .then(function (data, status) {
                    console.log("successful", data, status);
                })
                .error(function (data, status) {
                    console.log("error + status", data, status);
                })
        }
    };

});