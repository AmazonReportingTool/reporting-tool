'use strict';

/**
 * Module dependencies.
 */
 var path = require('path'),
 mongoose = require('mongoose'),
 inventory = require('../models/inventory-report.server.model.js'),
 db = require('../../../../config/env/development'),
 errorHandler = require(path.resolve('../../../../modules/core/server/controllers/errors.server.controller'));

/*
 * Configuration for MWS connection
 */
 var config = require('../../../../config/env/local'),
 MWS = require('mws-sdk'),
 client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
 marketPlaceId = 'ATVPDKIKX0DER';

var monthcount = exports.monthcount = function () {
  console.log("Hello World");
};

