'use strict';
// variables for configuration
var config = require('../../../../config/env/local'),
		db = require('./reports.server.controller.js');

// variables to set up mws client
var MWS = require('mws-sdk'),
    client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
    marketPlaceId = 'ATVPDKIKX0DER';

/*
 *	This function will take an inventory jReport obj and will do the neccessary tasks to insert it into the 
 *	database and will also remove documents that are more than a month old
 *	The return will be the same report object on success. On fail the callback will be given an object with
 *	an 'Error' key and an error message value.
 */
var ProcessInventoryReport = exports.ProcessInventoryReport = function(reportObj, callback) {
	db.create(reportObj, callback);
}

