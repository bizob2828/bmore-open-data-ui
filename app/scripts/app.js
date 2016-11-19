'use strict';

/**
 * @ngdoc overview
 * @name restaurantApp
 * @description
 * # restaurantApp
 *
 *bbb Main module of the application.
 */
angular
  .module('restaurantApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngMap',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $routeProvider
      .when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/main'
      });
  })
  .filter('startFrom', function() {
    return function(input, start) {
      if (input === undefined || input === null) {
        return input;
      }
      start = _.parseInt(start);
      return input.slice(start);
    };
  })
  .factory('restaurantsService', function($http, $q) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var service = {};

    service.getRestaurants = function(pg, stationId) {
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

    service.getStations = function() {
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

    service.createRestaurant = function(data) {
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

    service.editRestaurant = function(id, data) {
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

    service.deleteRestaurant = function(id) {
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

