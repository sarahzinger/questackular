'use strict';
app.factory('LibraryFactory', function($http, domain) {
	return {
        getLinks: function() {
            return $http.get(domain.path + '/api/link').then(function (res) {
                return res.data;
            });
        }
	};
});