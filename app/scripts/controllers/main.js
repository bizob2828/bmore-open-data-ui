'use strict';

/**
 * @ngdoc function
 * @name restaurantApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the restaurantApp
 */
angular.module('restaurantApp')
  .controller('MainCtrl', function ($scope, $http, restaurantsService, NgMap, $filter) {
    var compareByAscending
      , compareByDescending;


    restaurantsService.getStations().then(function(data) {
      $scope.center = { lat: data[0].lat, long: data[0].long };
      $scope.stations = data;

    });

    $scope.getRestaurants = function(page, station) {
      var id = station ? station.id : undefined;
      $scope.loading = true;
      restaurantsService.getRestaurants(page, id).then(function(data) {
        if (station) {
          $scope.center = { lat: station.lat, long: station.long };
        }

        $scope.loading = false;
        $scope.restaurants = data;
        $scope.columns = Object.keys(data[0]);
        $scope.sortKey = 'name';
        $scope.isDescending = false;
      })
      .catch(function(err) {
        console.log(err);
      })

    }

    NgMap.getMap().then(function(map) {
      $scope.map = map;
    });

    $scope.setSort = function(key) {
      var active = key === $scope.sortKey;
      return 'fa-sort-amount-' + (active && !$scope.isDescending ? 'asc' : 'desc') + ( active ? ' active' : '');
    };

    $scope.toggleSort = function(key) {
      if (key === $scope.sortKey) {
        $scope.isDescending = !$scope.isDescending;
        $scope.isDescending ? $scope.restaurants.sort(compareByDescending(key)) : $scope.restaurants.sort(compareByAscending(key));
      } else {
        $scope.restaurants.sort(compareByDescending(key));
        $scope.isDescending = true;
      }

      $scope.sortKey = key;

    };

    /**
     * Returns a sorting function on the given key for sorting results in a desc order
     *
     * @param key The sort key
     *
     * @returns {Function} A sort function to sort by the key
     */
    compareByDescending = function(key) {
      return function(a, b) {
        if(angular.isObject(a[key])) {
          return b[key].name.localeCompare(a[key].name);
        }
        //If a string use language collation
        else if (angular.isString(a[key])) {
          return b[key].localeCompare(a[key]);
        } else {
          return b[key] - a[key];
        }
      };
    };

    /**
     * Returns a sorting function on the given key for sorting results in an asc order
     *
     * @param key The sort key
     *
     * @returns {Function} A sort function to sort by the key
     */
    compareByAscending = function(key) {
      return function(a, b) {
        if(angular.isObject(a[key])) {
          return a[key].name.localeCompare(b[key].name);
        }
        //If a string use language collation
        else if (angular.isString(b[key])) {
          return a[key].localeCompare(b[key]);
        } else {
          return a[key] - b[key];
        }
      };
    };

    $scope.showDetails = function(e, restaurant) {
        $scope.deets = restaurant;
        $scope.map.showInfoWindow('rest-details', restaurant.id.toString());
    };

    $scope.filterRestaurants = function(station) {
      $scope.getRestaurants($scope.currentPage, station);
    };

    $scope.pageChanged = function() {
      restaurantsService.getRestaurants($scope.currentPage);
    };

    $scope.loading = true;
    $scope.getRestaurants();


  });
