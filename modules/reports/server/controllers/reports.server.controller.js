'use strict';
/**
 *	This controller will be accessed by other server-side controllers
 */

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  //InventoryReport = mongoose.model('InventoryReport'),
  //ReturnsReport = mongoose.model('ReturnsReport'),
  //OrdersReport = mongoose.model('OrdersReport');
  InventoryReport = require('../models/inventory-report.server.model.js'),
  ReturnsReport = require('../models/returns-report.server.model.js'),
  OrdersReport = require('../models/orders-report.server.model.js');

/**
 * Create a report
 * Will take a jReport object from the mws-reports controller
 * The rows object will be saved into the corresponding collection
 * according to the ReportType
 * _GET_AMAZON_FULFILLED_SHIPMENTS_DATA_
 * _GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_
 * _GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_
 * Function will return, on error, an object with an "Error" key and a message value
 * or, on success, the function will return an object with a "Report" key and MongooseReport object
 * and a "Docs" key and an array of documents as the value. NOTE: Docs are the docs that
 * mongoose succesfully inserted, therefore can be used for verfication
 */
exports.create = function (jReport, callback) {
	var report = getModel(jReport.ReportType);
	if (report.Error !== undefined) {
		callback(report);
		return;
	}

	//console.log('Inserting report of type: ' + report.modelName);
	//console.log(jReport);
	//console.log(report);

	report.collection.insert(jReport.ReportRows, function(err, docs) {
		//console.log(docs);
		//Simply call the insertcallback function and pass the parent callback
		InsertCallback(err, docs, jReport, callback);
	});
};

//Insert callback
function InsertCallback(err, docs, report, callback) {
	if (err) {
		callback({
			Error: errorHandler.getErrorMessage(err)
		});
	} else {
		callback({
			Report: report, //For the sake of meanjs...
			Docs: docs
		});
	}
}

/**
 * Show the current report NO USELESS
exports.read = function (req, res) {
  res.json(req.report);
};
*/

/**
 * Update a report NO
exports.update = function (req, res) {
  var report = req.report;

  report.title = req.body.title;
  report.content = req.body.content;

  report.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(report);
    }
  });
};
 */

/**
 * Delete a report will delete a report based on query (Very unmean :() UNDECIDED
 * Removing stale inventory docs should be done in the inventory controller and it should
 * call this function to remove from the database
 * query: can be a json object with field:value style query or a mongoose
 * query returned from 
 */
exports.delete = function (reportType, query, callback) {
	var report = getModel(reportType);
	if (report.Error !== undefined) {
		callback(report);
		return;
	}

	//console.log('Inserting report of type: ' + report.modelName);
	//console.log(jReport.ReportRows);

	report.remove(query, function(err) {
		if (err) {
			callback({ Error: err, ReportType: reportType });
			return;
		}
		callback({ Query: query, ReportType: reportType });
	});
};

/**
 * List of Reports takes a mongoose Report and lists
 */
exports.list = function (reportType, callback) {
	var Report = getModel(reportType);
	//WARNING: Without limit the query will take A LONG time most likely
	//Therefore will only return the first 100
  Report.find().sort('_id').limit(100).exec(function(err, docs) {
		//docs is an array of Documents
    if (err) {
			callback({
        Error: errorHandler.getErrorMessage(err)
      });
    } else {
			callback({
				Docs: docs
			});
		}
  });
};

/**
 * Function that returns the appropriate report model
 */
function getModel(reportStr) {
	if (reportStr === '_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_') {
		//Handle saving orders report
		//Just set the report to the correct model
		return OrdersReport;
	} else if (reportStr === '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_') {
		//Handle saving the inventory report
		//NOTE: Auto deletion of stale (30 day old) data must be done within the inventory
		//report controller
		return InventoryReport;
	} else if (reportStr === '_GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_') {
		//Handle saving the returns report
		return ReturnsReport;
	} else {
		//Unknown ReportType
		return {Error: 'Invalid ReportType'};
	}
}

/**
 * Report middleware NO
exports.reportByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Report is invalid'
    });
  }

  Report.findById(id).populate('user', 'displayName').exec(function (err, report) {
    if (err) {
      return next(err);
    } else if (!report) {
      return res.status(404).send({
        message: 'No report with that identifier has been found'
      });
    }
    req.report = report;
    next();
  });
};
 */
