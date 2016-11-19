'use strict';

/**
 * @ngdoc overview
 * @name restaurantApp
 * @description
 * # restaurantApp
 *
 *bbb Main module of the application.
 */
angular.module('restaurantApp')
  .factory('stations', function($http, $q) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var service = {};

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

