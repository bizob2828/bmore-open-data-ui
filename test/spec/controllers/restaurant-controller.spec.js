'use strict';
describe('RestaurantsController', function() {
  var $scope
    , $q
    , $controller
    , restaurantMock
    , stationMock
    , mapMock
    , locationMock
    , map = { showInfoWindow: sinon.stub() }
    , restaurants = {
      results: [{ name: 'Foo' }],
      total_count: 1
    }
    , stations = [
      { lat: 10, long: 10, name: 'Bar' }
    ]
    , anchorMock;

  function createController(noDigest) {
    $controller('RestaurantsCtrl', {
      $scope: $scope,
      restaurants: restaurantMock,
      stations: stationMock,
      NgMap: mapMock,
      $location: locationMock,
      $anchorScroll: anchorMock
    });

    if(!noDigest) {
      console.log('here');
      $scope.$digest();
    }

  }

  beforeEach(module('restaurantApp'));

  beforeEach(inject(function(_$controller_, _$rootScope_, _$q_) {
    $scope = _$rootScope_;
    $q = _$q_;
    $controller = _$controller_;

    restaurantMock = {
      all: sinon.stub().returns($q.when(restaurants)),
      edit: sinon.stub(),
      create: sinon.stub(),
      delete: sinon.stub()
    };

    stationMock = {
      all: sinon.stub().returns($q.when(stations))
    };

    mapMock = {
      getMap: sinon.stub().returns($q.when(map))
    };

    locationMock = {
      hash: sinon.stub().returns('id')
    };

    anchorMock = sinon.stub();

  }));

  describe('init tests', function() {
    it('should init successfully', function() {
      createController();

      expect(mapMock.getMap.callCount, 'getMap failed').to.equal(1);
      expect(restaurantMock.all.callCount, 'restaurant all failed').to.equal(1);
      expect(stationMock.all.callCount, 'station spy failed').to.equal(1);
      expect($scope.showForm).to.equal(false);
      expect($scope.edit).to.deep.equal({});
      expect($scope.perPage).to.equal(100);
      expect($scope.loading).to.equal(false);
    });
  });

  describe('getMap tests', function() {
    it('should set map on scope when it succeeds', function() {
      createController();
      $scope.getMap();
      expect($scope.map).to.equal(map);
    });

    it('should display error when it fails', function() {
      mapMock.getMap.returns($q.reject());
      createController();
      expect($scope.map).to.equal(undefined);
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.error).to.equal('Unable to load map');
      expect($scope.loading).to.equal(false);
    });
  });

  describe('getStation tests', function() {
    it('should set stations when it succeeds', function() {
      createController();
      $scope.getStations();
      $scope.$digest();
      expect($scope.center).to.deep.equal({ lat: 10, long: 10});
      expect($scope.stations).to.deep.equal([{ lat: 10, long: 10, name: 'Bar' }]);
      expect($scope.loading).to.equal(false);

    });

    it('should display error when it fails', function() {
      stationMock.all.returns($q.reject());
      createController();
      expect($scope.stations).to.equal(undefined);
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.error).to.equal('Unable to retrieve police stations');
      expect($scope.loading).to.equal(false);
    });

  });

  describe('scrollTo tests', function() {
    beforeEach(function() {
      createController();
    });

    it('should scroll to top when no anchor is passed', function() {
      $scope.scrollTo();
      expect(locationMock.hash.args).to.deep.equal([[], ['top-of-page'], ['id']]);
    });

    it('should scroll to appropriate anchor', function() {
      $scope.scrollTo('foo');
      expect(locationMock.hash.args).to.deep.equal([[], ['foo'], ['id']]);

    });
  });

  describe('getRestaurant tests', function() {
    it('should set center if station is passed in', function() {
      createController();
      $scope.getRestaurants(1, { id: 1, lat: 20, long: 20});
      $scope.$digest();
      expect($scope.center).to.deep.equal({ lat: 20, long: 20});
    });

    it('should set restaurants and table data on success', function() {
      createController();
      $scope.getRestaurants();
      $scope.$digest();
      expect($scope.loading).to.equal(false);
      expect($scope.restaurants).to.deep.equal(restaurants.results);
      expect($scope.totalCount).to.equal(restaurants.total_count);
      expect($scope.columns).to.deep.equal(['name']);
      expect($scope.sortKey).to.equal('name');
      expect($scope.isDescending).to.equal(false);

    });

    it('should display error when it fails', function() {
      restaurantMock.all.returns($q.reject());
      createController();
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.restaurants).to.equal(undefined);
      expect($scope.error).to.equal('Unable to retrieve restaurants');
    });
  });

  describe('setSort', function() {
    beforeEach(function() {
      createController();
    });

    it('should set key to asc and active', function() {
      $scope.isDescending = false;
      $scope.sortKey = 'foo'
      expect($scope.setSort('foo')).to.equal('fa-sort-amount-asc active');
    });

    it('should set key to desc', function() {
      $scope.isDescending = true;
      expect($scope.setSort('foo')).to.equal('fa-sort-amount-desc');
    });
  });

  describe('toggleSort', function() {
    beforeEach(function() {
      createController();
    });

    it('should sort descending when string', function() {
      $scope.isDescending = false;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: 'a' }, {bar: 'b'}, { bar: '1a' }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: 'b' }, { bar: 'a'}, {bar: '1a'}]);

    });

    it('should sort descending when object', function() {
      $scope.isDescending = false;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: { name: 'a' } }, {bar: { name: 'b'} }, { bar: { name: '1a'} }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: {name: 'b'} }, { bar: { name: 'a'}}, {bar: { name: '1a'}}]);

    });

    it('should sort descending when number', function() {
      $scope.isDescending = false;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: 34 }, {bar: 1}, { bar: 99 }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: 99 }, { bar: 34}, {bar: 1}]);

    });

    it('should sort ascending when string', function() {
      $scope.isDescending = true;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: 'a' }, {bar: 'b'}, { bar: '1a' }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: '1a' }, { bar: 'a'}, {bar: 'b'}]);

    });

    it('should sort ascending when object', function() {
      $scope.isDescending = true;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: { name: 'a' } }, {bar: { name: 'b'} }, { bar: { name: '1a'} }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: {name: '1a'} }, { bar: { name: 'a'}}, {bar: { name: 'b'}}]);

    });

    it('should sort ascending when number', function() {
      $scope.isDescending = true;
      $scope.sortKey = 'bar';
      $scope.restaurants = [{ bar: 34 }, {bar: 1}, { bar: 99 }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: 1 }, { bar: 34}, {bar: 99}]);

    });

    it('should sort descending not the sort key', function() {
      $scope.sortKey = 'baz';
      $scope.restaurants = [{ bar: 'a' }, {bar: 'b'}, { bar: '1a' }];
      $scope.toggleSort('bar');
      expect($scope.restaurants).to.deep.equal([{ bar: 'b' }, { bar: 'a'}, {bar: '1a'}]);
      $scope.isDescending = true;
      expect($scope.sortKey).to.equal('bar');

    });
  });

  describe('showDetails tests', function() {
    it('should set deets and call showInfoWindow', function() {
      var restaurant = { id: 1, name: 'Bar'};
      createController();
      $scope.showDetails('foo', restaurant);
      expect($scope.deets).to.deep.equal(restaurant);
      expect(map.showInfoWindow.args).to.deep.equal([['rest-details', '1']]);
    });
  });

  describe('filterRestaurants tests', function() {
    it('should filter restaurantsi by stations', function() {
      createController();
      $scope.currentPage = 2;
      $scope.getRestaurants = sinon.stub();
      $scope.filterRestaurants(1);
      expect($scope.selectedStation).to.equal(1);
      expect($scope.getRestaurants.args).to.deep.equal([[2, 1]]);
    });
  });

  describe('pageChanged tests', function() {
    it('should call getRestaurants', function() {
      createController();
      $scope.currentPage = 2;
      $scope.selectedStation = 1;
      $scope.getRestaurants = sinon.stub();
      $scope.pageChanged();
      expect($scope.getRestaurants.args).to.deep.equal([[2, 1]]);
    });
  });

  describe('hideForm tests', function() {
    it('should set showForm to false', function() {
      createController();
      $scope.hideForm();
      expect($scope.showForm).to.equal(false);
    });
  });

  describe('save tests', function() {
    beforeEach(function() {
      createController();
    });

    it('should call create and display notification', function() {
      restaurantMock.create.returns($q.when());
      $scope.stations = [{ id: 10, name: 'Northern'}];
      $scope.editing = false;
      $scope.edit = { name: 'Bob\'s Burgers', station: 'Northern' };
      $scope.save();
      $scope.$digest();
      expect(restaurantMock.create.args[0]).to.deep.equal([{ name: 'Bob\'s Burgers', station_id: 10}]);
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.notification).to.equal('Restaurant created successfully');
      expect($scope.loading).to.equal(false);
      expect($scope.showForm).to.equal(false);
    });

    it('should call create and display error', function() {
      restaurantMock.create.returns($q.reject());
      $scope.stations = [{ id: 10, name: 'Northern'}];
      $scope.editing = false;
      $scope.edit = { name: 'Bob\'s Burgers', station: 'Northern' };
      $scope.save();
      $scope.$digest();
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.error).to.equal('Unable to create restaurant');
      expect($scope.loading).to.equal(false);

    });

    it('should call edit and display notification', function() {
      restaurantMock.edit.returns($q.when());
      $scope.stations = [{ id: 11, name: 's'}];
      $scope.editing = true;
      $scope.edit = { id: 1, name: 'Burgers', station: 's' };
      $scope.save();
      $scope.$digest();
      expect(restaurantMock.edit.args[0]).to.deep.equal([1, { id: 1, name: 'Burgers', station_id: 11}]);
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.notification).to.equal('Restaurant updated successfully');
      expect($scope.loading).to.equal(false);
      expect($scope.showForm).to.equal(false);

    });

    it('should call edit and display error', function() {
      restaurantMock.edit.returns($q.reject());
      $scope.stations = [{ id: 11, name: 's'}];
      $scope.editing = true;
      $scope.edit = { id: 1, name: 'Burgers', station: 's' };
      $scope.save();
      $scope.$digest();
      expect(anchorMock.callCount).to.equal(1);
      expect($scope.error).to.equal('Unable to update restaurant');
      expect($scope.loading).to.equal(false);
    });
  });

  describe('openEditForm tests', function() {
    it('should showForm with restaurant details', function() {
      var restaurant = { name: 'Bar', police_station: { name: 'South' }};
      createController();
      $scope.scrollTo = sinon.stub();
      $scope.openEditForm(restaurant);
      restaurant.station = 'South';
      expect($scope.edit).to.deep.equal(restaurant);
      expect($scope.editing).to.equal(true);
      expect($scope.showForm).to.equal(true);
      expect($scope.scrollTo.args[0]).to.deep.equal(['crud-form']);
    });
  });

  describe('openNewForm tests', function() {
    it('should set showForm to true', function() {
      createController();
      $scope.openNewForm();
      expect($scope.edit).to.deep.equal({});
      expect($scope.showForm).to.equal(true);
    });
  });

  describe('deleteRestaurant tests', function() {
    it('should delete restaurant successfully', function() {
      restaurantMock.delete.returns($q.when());
      createController();
      $scope.deleteRestaurant({ id: 1 });
      $scope.$digest();
      expect(restaurantMock.delete.args[0]).to.deep.equal([1]);
      expect($scope.notification).to.equal('Restaurant deleted successfully');
      expect($scope.loading).to.equal(false);
      expect($scope.showForm).to.equal(false);

    });

    it('should display error on unsuccessful delete', function() {
      restaurantMock.delete.returns($q.reject());
      createController();
      $scope.deleteRestaurant({ id: 1 });
      $scope.$digest();
      expect($scope.error).to.equal('Unable to delete restaurant');
      expect($scope.loading).to.equal(false);
    });

  });


});
