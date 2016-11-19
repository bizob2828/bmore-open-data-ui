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
      .when('/restaurants', {
        templateUrl: 'views/restaurants.html',
        controller: 'RestaurantsCtrl'
      })
      .otherwise({
        redirectTo: '/restaurants'
      });
  });
