'use strict';
/*jshint camelcase: false */
/**
 * @ngdoc function
 * @name restaurantApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the restaurantApp
 */
angular.module('restaurantApp')
  .controller('MainCtrl', function ($scope, $http, restaurantsService, NgMap, $filter, $location, $anchorScroll) {
    var compareByAscending
      , compareByDescending;


    restaurantsService.getStations().then(function(data) {
      $scope.center = { lat: data[0].lat, long: data[0].long };
      $scope.stations = data;

    });

    $scope.scrollTo = function(anchor) {
      var id = $location.hash();
      $location.hash(anchor || 'top-of-page');
      $anchorScroll();
      $location.hash(id);
    };

    $scope.getRestaurants = function(page, station) {
      var id = station ? station.id : undefined;
      $scope.loading = true;
      restaurantsService.getRestaurants(page, id).then(function(data) {
        if (station) {
          $scope.center = { lat: station.lat, long: station.long };
        }

        $scope.loading = false;
        $scope.restaurants = data.results;
        $scope.totalCount = data.total_count;
        $scope.columns = Object.keys(data.results[0]);
        $scope.sortKey = 'name';
        $scope.isDescending = false;
      })
      .catch(function() {
        $scope.scrollTo();
        $scope.error = 'Unable to retrieve restaurants';
        $scope.loading = false;
      });

    };

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
        $scope.restaurants.sort($scope.isDescending ? compareByDescending(key) : compareByAscending(key));
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
      $scope.selectedStation = station;
      $scope.getRestaurants($scope.currentPage, station);
    };

    $scope.pageChanged = function() {
      $scope.getRestaurants($scope.currentPage, $scope.selectedStation);
    };

    $scope.perPage = 100;
    $scope.loading = true;
    $scope.getRestaurants();
    $scope.showForm = false;
    $scope.edit = {};

    $scope.hideForm = function() {
      $scope.showForm = false;
    };

    $scope.save = function() {
      $scope.loading = true;
      var newRestaurant = _.cloneDeep($scope.edit);
      newRestaurant.station_id = _.filter($scope.stations, { name: newRestaurant.station })[0].id;
      delete newRestaurant.station;
      if ($scope.editing) {
        restaurantsService.editRestaurant(newRestaurant.id, newRestaurant).then(function() {
          $scope.notification = 'Restaurant updated successfully';
          $scope.loading = false;
          $scope.showForm = false;
          $scope.scrollTo();
        })
        .catch(function() {
          $scope.error = 'Unable to update restaurant';
          $scope.loading = false;
        });

      } else {
        restaurantsService.createRestaurant(newRestaurant).then(function() {
          $scope.notification = 'Restaurant created successfully';
          $scope.loading = false;
          $scope.showForm = false;
          $scope.scrollTo();
        })
        .catch(function() {
          $scope.error = 'Unable to create restaurant';
          $scope.loading = false;
          $scope.scrollTo();
        });
      }
    };

    $scope.editRestaurant = function(restaurant) {
      $scope.scrollTo('crud-form');
      $scope.showForm = true;
      $scope.editing = true;
      $scope.edit = _.cloneDeep(restaurant);
      $scope.edit.station = $scope.edit.police_station.name;
    };

    $scope.createNew = function() {
      $scope.edit = {};
      $scope.showForm = true;
    };

    $scope.deleteRestaurant = function(restaurant) {
      $scope.loading = true;
      restaurantsService.deleteRestaurant(restaurant.id).then(function() {
        $scope.scrollTo();
        $scope.notification = 'Restaurant deleted successfully';
        $scope.loading = false;
      })
      .catch(function() {
        $scope.scrollTo();
        $scope.error = 'Unable to delete restaurant';
        $scope.loading = false;
      });
    };

  });
