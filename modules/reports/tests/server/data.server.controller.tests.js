'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
	fs = require('fs'),
	config = require('../../../../config/env/development'),
	data = require('../../server/controllers/data.server.controller.js');

/**
 * Globals
 */

/**
 * Unit tests
 * Should test the data.server.controller.js
 * Commented code is used as reference
 */
describe('Data Server Controller Tests:', function () {
  before(function () {
		//Connect to the mongoose db
		mongoose.connect(config.db.uri);
  });

  describe('Data Controller', function () {
		it('should run test1', function(done) {
      var count = data.monthcount();
      console.log(count);
		});
  });
/*
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
  */
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

