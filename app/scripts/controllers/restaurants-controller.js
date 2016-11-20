'use strict';
/*jshint camelcase: false */

/**
 * @ngdoc function
 * @name restaurantApp.controller:RestaurantsCtrl
 * @description
 * # RestaurantsCtrl
 * Controller of the restaurantApp
 */
angular.module('restaurantApp')
  .controller('RestaurantsCtrl', function ($scope, restaurants, stations, NgMap, $location, $anchorScroll) {

    /**
     * Initializes page by fetching restaurants, police stations, map instance
     */
    function init() {
      $scope.perPage = 100;
      $scope.showForm = false;
      $scope.edit = {};
      $scope.getRestaurants();
      $scope.getStations();
      $scope.getMap();

    }

    /**
     * Convenience method to scroll to top of page and show error
     *
     * @param {String} msg error message to display
     */
    function handleError(msg) {
      $scope.scrollTo();
      $scope.loading = false;
      $scope.error = msg;
    }

    /**
     * Convenience method to scroll to top and show success notificaiton
     * @param {String} msg notification to display
     */
    function handleSuccess(msg) {
      $scope.scrollTo();
      $scope.loading = false;
      $scope.showForm = false;
      $scope.notification = msg;
    }

    /**
     * Clones restaurant and looks up police station
     * @param {Object} restaurant restaurant to clone
     * @return {Object} cloned restaurant
     */
    function cloneRestaurant(restaurant) {
      var newRestaurant = _.cloneDeep(restaurant);
      newRestaurant.station_id = _.filter($scope.stations, { name: newRestaurant.station })[0].id;
      delete newRestaurant.station;
      return newRestaurant;
    }

    /**
     * Returns a sorting function on the given key for sorting results in a desc order
     *
     * @param key The sort key
     *
     * @returns {Function} A sort function to sort by the key
     */
    function compareByDescending(key) {
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
    }

    /**
     * Returns a sorting function on the given key for sorting results in an asc order
     *
     * @param key The sort key
     *
     * @returns {Function} A sort function to sort by the key
     */
    function compareByAscending(key) {
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
    }

    /**
     * Gets a google map instance, sets on scope
     *
     */
    $scope.getMap = function() {
      $scope.loading = true;
      NgMap.getMap().then(function(map) {
        $scope.map = map;
      })
      .catch(function() {
        handleError('Unable to load map');
      });
    };

    /**
     * Retrieves police stations and sets the center of map
     */
    $scope.getStations = function() {
      stations.all().then(function(data) {
        $scope.center = { lat: data[0].lat, long: data[0].long };
        $scope.stations = data;
        $scope.loading = false;
      })
      .catch(function() {
        handleError('Unable to retrieve police stations');
      });
    };

    /**
     * Scrolls to a location on page, defaults to top
     *
     * @param {String} anchor name of anchor to scroll to
     */
    $scope.scrollTo = function(anchor) {
      var id = $location.hash();
      $location.hash(anchor || 'top-of-page');
      $anchorScroll();
      $location.hash(id);
    };

    /**
     * Retrieves restaurants, sets the table data
     *
     * @param {Int} page # of page to retrieve from API
     * @param {Int} station id of police station to filter collection
     */
    $scope.getRestaurants = function(page, station) {
      var id = station ? station.id : undefined;
      $scope.loading = true;
      restaurants.all(page, id).then(function(data) {
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
        handleError('Unable to retrieve restaurants');
      });

    };

    /**
     * Sets the appropriate sort key based on what was clicked
     * @param {String} key value of the column name that was clicked
     */
    $scope.setSort = function(key) {
      var active = key === $scope.sortKey;
      return 'fa-sort-amount-' + (active && !$scope.isDescending ? 'asc' : 'desc') + ( active ? ' active' : '');
    };

    /**
     * Toggles the sorting between asc/desc
     * @param {String} key value of column that is being sorted
     */
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
     * Pops the info window on the map to display restaurant details
     * @param {Function} e event that occurred
     * @param {Object} restaurant object that was clicked on map
     */
    $scope.showDetails = function(e, restaurant) {
        $scope.deets = restaurant;
        $scope.map.showInfoWindow('rest-details', restaurant.id.toString());
    };

    /**
     * Retrieves a list of restaurants filtered by police station
     * @param {Object} station police station object
     */
    $scope.filterRestaurants = function(station) {
      $scope.selectedStation = station;
      $scope.getRestaurants($scope.currentPage, station);
    };

    /**
     * Server side paging that calls the getRestaurants
     */
    $scope.pageChanged = function() {
      $scope.getRestaurants($scope.currentPage, $scope.selectedStation);
    };

    /**
     * Hides the restaurant form
     */
    $scope.hideForm = function() {
      $scope.showForm = false;
    };

    /**
     * Saves the restaurant, it will create/edit depending on which mode
     */
    $scope.save = function() {
      $scope.loading = true;
      var newRestaurant = cloneRestaurant($scope.edit);
      if ($scope.editing) {
        restaurants.edit(newRestaurant.id, newRestaurant).then(function() {
          handleSuccess('Restaurant updated successfully');
        })
        .catch(function() {
          handleError('Unable to update restaurant');
        });

      } else {
        restaurants.create(newRestaurant).then(function() {
          handleSuccess('Restaurant created successfully');
        })
        .catch(function() {
          handleError('Unable to create restaurant');
        });
      }
    };

    /**
     * Opens form with pre-filled data to edit restaurant
     * @param {Object} restaurant restaurant object to edit
     */
    $scope.openEditForm = function(restaurant) {
      $scope.scrollTo('crud-form');
      $scope.showForm = true;
      $scope.editing = true;
      $scope.edit = _.cloneDeep(restaurant);
      $scope.edit.station = $scope.edit.police_station.name;
    };

    /**
     * Opens form to create a restaurant
     */
    $scope.openNewForm = function() {
      $scope.edit = {};
      $scope.showForm = true;
    };

    /**
     * Deletes a restaurant
     * @param {Object} restaurant restaurant object
     */
    $scope.deleteRestaurant = function(restaurant) {
      $scope.loading = true;
      restaurants.delete(restaurant.id).then(function() {
        handleSuccess('Restaurant deleted successfully');
      })
      .catch(function() {
        handleError('Unable to delete restaurant');
      });
    };

    // load initial page
    init();

  });
