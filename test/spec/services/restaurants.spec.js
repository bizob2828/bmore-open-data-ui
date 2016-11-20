'use strict';
describe('restaurants service', function() {
  var $http
    , restaurants
    , baseUrl = 'http://localhost:3000/api/restaurants';

  beforeEach(module('restaurantApp'));

  beforeEach(inject(function(_$httpBackend_, _restaurants_) {
    $http = _$httpBackend_;
    restaurants = _restaurants_;
  }));

  describe('all', function() {
    it('should return first page of restaurants', function(done) {
      $http.expect('GET', baseUrl + '?page=1').respond('restaurants');
      restaurants.all().then(function(data) {
        expect(data).to.equal('restaurants');
        done();
      });

      $http.flush();

    });

    it('should return all restaurants by station', function(done) {
      $http.expect('GET', baseUrl + '?page=2&station_id=10').respond('restaurants by station');
      restaurants.all(2, 10).then(function(data) {
        expect(data).to.equal('restaurants by station');
        done();
      });

      $http.flush();

    });

    it('should return errors when getting restaurants', function(done) {
      $http.expect('GET', baseUrl + '?page=1').respond(500, 'error');
      restaurants.all().catch(function(data) {
        expect(data.status).to.equal(500);
        expect(data.data).to.equal('error');
        done();
      })
      .then(function() {
        var err = new Error('test was supposed to catch');
        done(err);
      });

      $http.flush();

    });

  });

  describe('create', function() {
    it('should create restaurant', function(done) {
      $http.expect('POST', baseUrl).respond({ results: 'new restaurant' });
      restaurants.create({ name: 'foo' }).then(function(data) {
        expect(data).to.equal('new restaurant');
        done();
      });

      $http.flush();

    });

    it('should throw error during create', function(done) {
      $http.expect('POST', baseUrl).respond(500, 'my error');
      restaurants.create('foo').catch(function(data) {
        expect(data.status).to.equal(500);
        expect(data.data).to.equal('my error');
        done();
      })
      .then(function() {
        var err = new Error('test was supposed to catch');
        done(err);
      });

      $http.flush();
    });
  });

  describe('edit', function() {
    it('should edit restaurant', function(done) {
      $http.expect('PUT', baseUrl + '/10').respond({ results: 'updated restaurant' });
      restaurants.edit(10, { name: 'foo update' }).then(function(data) {
        expect(data).to.equal('updated restaurant');
        done();
      });

      $http.flush();

    });

    it('should throw error during edit', function(done) {
      $http.expect('PUT', baseUrl + '/10').respond(500, 'my error');
      restaurants.edit(10, 'foo').catch(function(data) {
        expect(data.status).to.equal(500);
        expect(data.data).to.equal('my error');
        done();
      })
      .then(function() {
        var err = new Error('test was supposed to catch');
        done(err);
      });

      $http.flush();
    });
  });

  describe('delete', function() {
    it('should delete restaurant', function(done) {
      $http.expect('DELETE', baseUrl + '/11').respond('delete restaurant');
      restaurants.delete(11, { name: 'foo update' }).then(function(data) {
        expect(data).to.equal('delete restaurant');
        done();
      });

      $http.flush();

    });

    it('should throw error during delete', function(done) {
      $http.expect('DELETE', baseUrl + '/20').respond(500, 'my error');
      restaurants.delete(20).catch(function(data) {
        expect(data.status).to.equal(500);
        expect(data.data).to.equal('my error');
        done();
      })
      .then(function() {
        var err = new Error('test was supposed to catch');
        done(err);
      });

      $http.flush();
    });
  });
});

