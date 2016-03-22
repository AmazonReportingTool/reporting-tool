'use strict';
/**
 *	This controller will be accessed by other server-side controllers
 */

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  InventoryReport = mongoose.model('InventoryReport'),
  ReturnsReport = mongoose.model('ReturnsReport'),
  OrdersReport = mongoose.model('OrdersReport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a report
 * Will take a jReport object from the mws-reports controller
 * The rows object will will be saved into the corresponding collection
 * according to the ReportType
 * _GET_AMAZON_FULFILLED_SHIPMENTS_DATA_
 * _GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_
 * _GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_
 * Function will return an object with an Error key and a message value
 * or on success the function will return an object with a Report key and
 * Report object as the value.
 */
exports.create = function (jReport, callback) {
	var report;
	if (jReport.ReportType === '_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_') {
		//Handle saving the inventory report
		
	} else if (jReport.ReportType === '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_') {

	} else if (jReport.ReportType === '_GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_') {

	} else {
		//Unknown ReportType
		callback({
			Error: 'Invalid ReportType';
		});
	}
  //var report = new Report(jReport.Rows);
  //report.user = req.user;

	//Save the report
  report.save(function (err) {
    if (err) {
      callback({
        Error: errorHandler.getErrorMessage(err)
      });
    } else {
			callback({
				Report: report
			});
    }
  });
};

//Insert callback
function InsertCallback(err, docs) {

}

/**
 * Show the current report
 */
exports.read = function (req, res) {
  res.json(req.report);
};

/**
 * Update a report
 */
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

/**
 * Delete an report
 */
exports.delete = function (req, res) {
  var report = req.report;

  report.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(report);
    }
  });
};

/**
 * List of Reports
 */
exports.list = function (req, res) {
  Report.find().sort('-created').populate('user', 'displayName').exec(function (err, reports) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reports);
    }
  });
};

/**
 * Report middleware
 */
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
