'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Inventory Report Schema
 */
var InventoryReportSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
  sku: {
    type: String,
    default: '',
    trim: true
  },
  fnsku: {
    type: String,
    default: '',
    trim: true
  },
  asin: {
    type: String,
    default: '',
    trim: true
  },
  productName: {
    type: String,
    default: '',
    trim: true
  },
  condition: {
    type: String,
    default: '',
    trim: true
  },
  yourPrice: {
    type: Number,
    default: 0
  },
  mfnListingExists: {
    type: String,
    default: '',
    trim: true
  },
  mfnFulfillableQuantity: {
    type: Number,
    default: ''
  },
  afnListingExists: {
    type: String,
    default: '',
    trim: true
  },
  afnWarehouseQuantity: {
    type: Number,
    default: ''
  },
  afnFulfillableQuantity: {
    type: Number,
    default: ''
  },
  afnUnsellableQuantity: {
    type: Number,
    default: ''
  }, 
  afnReservedQuantity: {
    type: Number,
    default: ''
  },
  afnTotalQuantity: {
    type: Number,
    default: ''
  },
  perUnitVolume: {
    type: Number,
    default: ''
  },
  afnInboundWorkingQuantity: {
    type: Number,
    default: ''
  },
  afnInboundShippedQuantity: {
    type: Number,
    default: ''
  },
  afnInboundReceivingQuantity: {
    type: Number,
    default: ''
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('InventoryReport', InventoryReportSchema);
