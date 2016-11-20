'use strict';

/**
 * @ngdoc stations service
 * @name stations
 * @description
 * # restaurantApp
 *
 * Service to get police stations
 */
angular.module('restaurantApp')
  .factory('stations', function($http, $q) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var service = {};

    /**
     * Retrieves a list of police stations
     */
    service.all = function() {
      var deferred = $q.defer();
      $http.get('http://localhost:3000/api/police-stations')
        .then(function (results) {
          deferred.resolve(results.data.results);
        })
        .catch(function (data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    return service;
  });

