app.factory('storeFactory', function($http) {
    return {
        getAllProds: function() {
            //gets list of all available products from store
            return $http.get('http://localhost:1337/api/store/').then(function(res) {
                return res.data;
            });
        },
        getUserData: function() {
            //gets user's array of owned products and their current total points and their points spent
            return $http.get('http://localhost:1337/api/store/userData').then(function(res) {
                return res.data;
            });
        },
        userBuy: function(boughtObj) {
            //boughtObj contains ID of object bought, num for pointsSpent, and user id
            //returns updated version of getUser Data
            return $http.post('http://localhost:1337/api/store/buy', boughtObj).then(function(res) {
                return res.data;
            });
        }
    }
})