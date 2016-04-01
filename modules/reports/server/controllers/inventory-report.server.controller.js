'use strict';
// variables for configuration
var config = require('../../../../config/env/local'),
		db = require('./reports.server.controller.js');

//Constants
const REPORT_TYPE = '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_';

/*
 *	This function will take an inventory jReport obj and will do the neccessary tasks to insert it into the 
 *	database and will also remove documents that are more than a month old
 *	The return will be the same report object on success. On fail the callback will be given an object with
 *	an 'Error' key and an error message value.
 */
var ProcessInventoryReport = exports.ProcessInventoryReport = function(reportObj, callback) {
	//Add created field
	var rows = reportObj.ReportRows;
	var date = new Date(); //Now
	for (var i=0; i<rows.length; i++) {
		if (rows[i].created === undefined) {
			rows[i].created = date;
		}
	}
	db.create(reportObj, function(result) {
		if (result.Error !== undefined) {
			//End here and return the error
			callback(result);
		} else {
			//Remove stale
			RemoveStaleInventory(function(result2) {
				//Jesus christ
				result2.Docs = result.Docs;
				callback(result2);
			});
		}
	});
	//Now clean up the db
}

var RemoveStaleInventory = exports.RemoveStaleInventory = function(callback) {
	var now = new Date();
	if (now.getMonth() === 0) {
		//January so make sure it goes to December of LAST year
		var monthAgo = new Date(now.getFullYear() - 1, 11, now.getDate() - 1); //Date - 1 is for error comp
	} else {
		var monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - 1);
	}
	//I hate dates
	var query = {
		"created" : {
			$lt: monthAgo
		}
	};

	db.delete(REPORT_TYPE, query, callback);
}

