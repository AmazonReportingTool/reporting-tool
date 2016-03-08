'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
	reports = require('../../server/controllers/mws-reports.server.controller.js'),
	orders = require('../../server/controllers/orders-report.server.controller.js');

/**
 * Globals
 */
var jReport;

/**
 * Unit tests
 */
describe('Report Controller Unit Tests:', function () {
  before(function (done) {
		var eDate = new Date();
		var sDate = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate() - 1);
		reports.GetFulfilledOrdersReport(sDate, eDate, function(result) {
			console.log('Report id: ' + result.ReportId);
			jReport = result;
			done();
		});
  });

  describe('Orders Report', function () {
    it('should add financial events to the orders report', function (done) {
			orders.addFinancialEvents(jReport);
			console.log(JSON.stringify(null, 2, jReport.ReportRows[0]);
			console.log(JSON.stringify(null, 2, jReport.ReportRows[1]);
			console.log(JSON.stringify(null, 2, jReport.ReportRows[2]);
			done();
    });
		/*
    it('should be able to show an error when try to save without title', function (done) {
      report.title = '';

      return report.save(function (err) {
        should.exist(err);
        done();
      });
    });
		*/
  });

	/*
  afterEach(function (done) {
    Report.remove().exec(function () {
      User.remove().exec(done);
    });
  });
	*/
});
