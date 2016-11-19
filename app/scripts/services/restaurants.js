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
  .factory('restaurants', function($http, $q) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var service = {};

    service.all = function(pg, stationId) {
      var deferred = $q.defer()
        , page = pg || 1
        , url = 'http://localhost:3000/api/restaurants?page=' + page;

      if(stationId) {
        url += '&station_id=' + stationId;
      }

      $http.get(url)
        .then(function (results) {
          deferred.resolve(results.data);
        })
        .catch(function (data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    service.create = function(data) {
      var deferred = $q.defer();
      $http.post('http://localhost:3000/api/restaurants', data)
        .then(function (results) {
          deferred.resolve(results.data.results);
        })
        .catch(function (data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    service.edit = function(id, data) {
      var deferred = $q.defer();
      $http.put('http://localhost:3000/api/restaurants/' + id, data)
        .then(function (results) {
          deferred.resolve(results.data.results);
        })
        .catch(function (data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    service.delete = function(id) {
      var deferred = $q.defer();
      $http.delete('http://localhost:3000/api/restaurants/' + id)
        .then(function (results) {
          console.log(results);
          deferred.resolve(results);
        })
        .catch(function (data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

      return service;
  });

