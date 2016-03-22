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
  before(function () {
		/*
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
					fs.writeFileSync('orders-report.json', JSON.stringify(result, null, 2));
					done();
				});
			} else {
  			fs.writeFileSync('orders-report.json', JSON.stringify(result, null, 2));
  			jReport = result;
  			done();
      }
		});
		*/
		//The way it was meant to be done
		//Read the .json file
		jReport = JSON.parse(fs.readFileSync('orders-report.json'));
		jReport.should.have.property('ReportId');
		console.log('Report Id: ' + jReport.ReportId);
  });

  describe('Orders Report', function () {
    it('should add financial events to the orders report', function (done) {
			this.timeout(60000);
			orders.ProcessOrdersReport(jReport, function(result) {
				//result....
				console.log(JSON.stringify(result.ReportRows, null, 2));
				for (var i = 0; i < result.ReportRows.length; i++){
					result.ReportRows[i].should.have.property('fees');
					result.ReportRows[i].fees.should.not.be.type('undefined');
				}
				done();
			});
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
