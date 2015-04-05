app.factory('UserFactory', function($http, domain) {
    return {
        getUserInfo: function() {
            return $http.get(domain.path + '/session').then(function(res) {
                return res.data;
            });
        },
        getUserFromDb: function(userId) {
            console.log("userId", userId);
            return $http.get(domain.path + '/api/users/' + userId).then(function(dbUser) {
                console.log("dbUser", dbUser);
                return dbUser.data;
            });
        },
        changeCurrentStep: function(stepId) {
            console.log("changeCurrentStep launched");
            return $http.put(domain.path + '/api/users/participating/currentStep/' + stepId).then(function(res) {
                return res.data;
            });
        },
        addPoints: function(stepId) {
            console.log("stepId on the front end", stepId)
            return $http.put(domain.path + '/api/users/points/' + stepId).then(function(res) { 
                return res.data;
            });
        },
        getTotalPoints: function() {
            return $http.get(domain.path + '/api/users/points').then(function(res) {
                return res.data;
            })
        },
        logout: function() {
            return $http.get(domain.path + '/logout').then(function(res) {
                return res;
            })
        },
        getUserById: function(userId) {
            return $http.get(domain.path + '/api/users/' + userId).then(function(response) {
                return response.data;
            });
        },
        getAllUsers: function() {
            return $http.get(domain.path + '/api/users').then(function(res) {
                console.log("getAllUsers factory $http.get response", res);
                return res.data;
            });
        },
        buyStep: function(stepId) {
            //remove points
            console.log("buying a step with this stepId", stepId)
            return $http.put(domain.path + '/api/users/purchase/' + stepId).then(function(res) {
                return res.data;
            });
        }
    }
})