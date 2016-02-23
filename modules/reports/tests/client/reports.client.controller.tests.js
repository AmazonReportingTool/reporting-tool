'use strict';

(function () {
  // Reports Controller Spec
  describe('Reports Controller Tests', function () {
    // Initialize global variables
    var ReportsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Reports,
      mockReport;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Reports_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Reports = _Reports_;

      // create mock report
      mockReport = new Reports({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Report about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Reports controller.
      ReportsController = $controller('ReportsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one report object fetched from XHR', inject(function (Reports) {
      // Create a sample reports array that includes the new report
      var sampleReports = [mockReport];

      // Set GET response
      $httpBackend.expectGET('api/reports').respond(sampleReports);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.reports).toEqualData(sampleReports);
    }));

    it('$scope.findOne() should create an array with one report object fetched from XHR using a reportId URL parameter', inject(function (Reports) {
      // Set the URL parameter
      $stateParams.reportId = mockReport._id;

      // Set GET response
      $httpBackend.expectGET(/api\/reports\/([0-9a-fA-F]{24})$/).respond(mockReport);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.report).toEqualData(mockReport);
    }));

    describe('$scope.craete()', function () {
      var sampleReportPostData;

      beforeEach(function () {
        // Create a sample report object
        sampleReportPostData = new Reports({
          title: 'An Report about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Report about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Reports) {
        // Set POST response
        $httpBackend.expectPOST('api/reports', sampleReportPostData).respond(mockReport);

        // Run controller functionality
        scope.create();
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the report was created
        expect($location.path.calls.mostRecent().args[0]).toBe('reports/' + mockReport._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/reports', sampleReportPostData).respond(400, {
          message: errorMessage
        });

        scope.create();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock report in scope
        scope.report = mockReport;
      });

      it('should update a valid report', inject(function (Reports) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/reports\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update();
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/reports/' + mockReport._id);
      }));

      it('should set scope.error to error response message', inject(function (Reports) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/reports\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(report)', function () {
      beforeEach(function () {
        // Create new reports array and include the report
        scope.reports = [mockReport, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/reports\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockReport);
      });

      it('should send a DELETE request with a valid reportId and remove the report from the scope', inject(function (Reports) {
        expect(scope.reports.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.report = mockReport;

        $httpBackend.expectDELETE(/api\/reports\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to reports', function () {
        expect($location.path).toHaveBeenCalledWith('reports');
      });
    });
  });
}());
