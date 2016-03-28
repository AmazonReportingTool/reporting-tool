'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
	fs = require('fs'),
	config = require('../../../../config/env/development'),
	reports = require('../../server/controllers/mws-reports.server.controller.js'),
	r = require('../../server/controllers/reports.server.controller.js'),
	inventorys = require('../../server/controllers/inventory-report.server.controller.js');


/**
 * Globals
 */
var jReport,
		insertedIds = [],
		reportType = '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_';

/**
 * Unit tests
 * NOTE: Must be run with mocha --timeout 30000 because the collection is too big and it will take a while
 * for list to work
 */
describe('Inventory Report Controller Unit Tests:', function () {
  before(function () {
		/*
		//Download and save the report locally
		this.timeout(60000 * 3);
		reports.GetWarehouseInventoryReport(function(result) {
			console.log(JSON.stringify(result, null, 2));
			//console.log('Report id: ' + result.ReportId);
			should.exist(result);
			result.should.not.be.type('undefined');
			if (result.Error !== undefined && result.Error.indexOf('CANCELLED') > -1) {
				reports.GetLatestReportByType(reportType, function(result) {
					jReport = result;
					fs.writeFileSync('inventory-report.json', JSON.stringify(result, null, 2));
					done();
				});
			} else {
				fs.writeFileSync('inventory-report.json', JSON.stringify(result, null, 2));
				jReport = result;
				done();
			}
		});
		*/
		//The way it was meant to be done
		//Read the .json file
		jReport = JSON.parse(fs.readFileSync('./inventory-report.json'));
		jReport.should.have.property('ReportId');
		console.log('Report Id: ' + jReport.ReportId);

		//Connect to the mongoose db
		mongoose.connect(config.db.uri);
  });

  describe('Inventory Report', function () {
		it('should add to database', function(done) {
			inventorys.ProcessInventoryReport(jReport, function(result) {
				console.log(JSON.stringify(result, null, 2));
				result.should.not.have.property('Error');
				//Docs.insertedCount is the number of seccessful inserts
				insertedIds.push.apply(insertedIds,result.Docs.insertedIds);
				//console.log(JSON.stringify(insertedIds, null, 2));
				console.log('Uploaded ' + result.Docs.insertedCount + ' docs.');
				done();
			});
		});

		it('should list documents in database', function(done) {
			//Use functions directly from reports server for testing
			r.list(reportType, 
				function(result) {
					//console.log(JSON.stringify(result, null, 2));
					should.not.exist(result.Error);
					console.log('Documents in returnsreports collection: ' + result.Docs.length);
					should.exist(result.Docs[0].created);
					result.Docs[0].created.should.not.be.type('undefined');
					done();
				});
		});

		it('should remove from database', function(done) {
			r.delete(reportType, 
				{ _id: { '$in': insertedIds } }, 
				function(result) {
					//console.log(JSON.stringify(result, null, 2));
					done();
				});
		});

		it('should list documents in database', function(done) {
			//Use functions directly from reports server for testing
			r.list(reportType, 
				function(result) {
					//console.log(JSON.stringify(result, null, 2));
					should.not.exist(result.Error);
					console.log('Documents in returnsreports collection: ' + result.Docs.length);
					done();
				});
		});

  });
	/*
  after(function (done) {
		//Remove all the inserted ids
		mongoose.model('ReturnsReport').remove({
			'_id': {
				'$in': insertedIds //Nifty
			}
		}, function (err) {
			if (err) console.log(JSON.stringify(err, null, 2));
			should.not.exist(err);
			done();
		});
  });

	*/
});

