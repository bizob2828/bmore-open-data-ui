describe('stations service', function() {
  var $http
    , stations
    , baseUrl = 'http://localhost:3000/api/police-stations';

  beforeEach(module('restaurantApp'));

  beforeEach(inject(function(_$httpBackend_, _stations_) {
    $http = _$httpBackend_;
    stations = _stations_;
  }));

  describe('all', function() {
    it('should return first page of stations', function(done) {
      $http.expect('GET', baseUrl).respond({ results: 'stations'});
      stations.all().then(function(data) {
        expect(data).to.equal('stations');
        done();
      });

      $http.flush();

    });

    it('should return errors when getting stations', function(done) {
      $http.expect('GET', baseUrl).respond(500, 'error');
      stations.all().catch(function(data) {
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
});
