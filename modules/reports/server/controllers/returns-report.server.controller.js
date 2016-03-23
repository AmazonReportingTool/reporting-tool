'use strict';
// variables for configuration
var config = require('../../../../config/env/local'),
		db = require('./reports.server.controller.js');

// variables to set up mws client
var MWS = require('mws-sdk'),
    client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
    marketPlaceId = 'ATVPDKIKX0DER';

/*
 *	This function will take a returns jReport obj and will do the neccessary tasks to insert it into the 
 *	database
 *	The return will be the same report object on success. On fail the callback will be given an object with
 *	an 'Error' key and an error message value.
 */
var ProcessReturnsReport = exports.ProcessReturnsReport = function(reportObj, callback) {
	//Just pass it to the database controller (reports.server.controller.js)
	//NOTE: Maybe this can make sure that the type is present and correct?
	db.create(reportObj, callback);
	//gg
}


