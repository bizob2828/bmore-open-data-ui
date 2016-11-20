'use strict';

/**
 * @ngdoc restaurants service
 * @name restaurants
 * @description
 * # restaurants service
 *
 * Interface between API and controller
 */
angular.module('restaurantApp')
  .factory('restaurants', function($http, $q) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var service = {}
      , baseUrl = 'http://localhost:3000/api/restaurants';

    /**
     * Convenience method to make http request and return appropriate data
     * @param {String} method http method to make(get, post, put, etc)
     * @param {String} url url of http request
     * @param {String} returnKey key of object to return
     * @param {Object} data payload of http request
     */
    function makeRequest(method, url, returnKey, data) {
      var deferred = $q.defer()
        , config = {
          url: url,
          method: method
        };

      if (data) {
        config.data = data;
      }

      $http(config)
        .then(function(results) {
          deferred.resolve(_.get(results, returnKey));
        })
        .catch(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
     * Retrieves list of restaurants by page, and optionally by police station
     * @param {Int} pg page number, defaults to 1
     * @param {Int} stationId id of police station
     */
    service.all = function(pg, stationId) {
      var page = pg || 1
        , url = baseUrl + '?page=' + page;

      if(stationId) {
        url += '&station_id=' + stationId;
      }

      return makeRequest('get', url, 'data');

    };

    /**
     * Creates a restaurant
     * @param {Object} data payload to create restaurant
     */
    service.create = function(data) {
      return makeRequest('post', baseUrl, 'data.results', data);
    };

    /**
     * Edits a restaurant
     * @param {Int} id id of restaurant to edit
     * @param {Object} data payload to change about restaurant
     */
    service.edit = function(id, data) {
      return makeRequest('put', baseUrl + '/' + id, 'data.results', data);
    };

    /**
     * Deletes a restaurant
     * @param {Int} id id of restaurant
     */
    service.delete = function(id) {
      return makeRequest('delete', baseUrl + '/' + id, 'data');
    };

    return service;
  });

