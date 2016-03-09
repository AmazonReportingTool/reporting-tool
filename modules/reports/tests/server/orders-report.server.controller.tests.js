'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
	fs = require('fs'),
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
		this.timeout(60000 * 3);
		var eDate = new Date();
		var sDate = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate() - 10);
		reports.GetFulfilledOrdersReport(sDate, eDate, function(result) {
			console.log(JSON.stringify(result, null, 2));
			//console.log('Report id: ' + result.ReportId);
			result.should.not.be.type('undefined');
			if (result.Error !== undefined && result.Error.indexOf('CANCELLED') > -1) {
				reports.GetLatestReportByType('_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_', function(result) {
					jReport = result;
					fs.writeFile('orders-report.json', JSON.stringify(result, null, 2));
					done();
				});
			}
			fs.writeFile('orders-report.json', JSON.stringify(result, null, 2));
			jReport = result;
			done();
		});
  });

  describe('Orders Report', function () {
    it('should add financial events to the orders report', function (done) {
			orders.addFinancialEvents(jReport);
			console.log(JSON.stringify(jReport.ReportRows[0], null, 2));
			jReport.ReportRows[0].should.have.property('FBAWeightBasedFee');
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
