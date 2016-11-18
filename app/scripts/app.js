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
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
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

    service.getRestaurants = function(page, stationId) {
      var deferred = $q.defer()
        , page = page || 1
        , url = 'http://localhost:3000/api/restaurants?page=' + page;

      if(stationId) {
        url += '&station_id=' + stationId;
      }

      $http.get(url)
        .then(function (results) {
          deferred.resolve(results.data.results);
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

      return service;
  });

