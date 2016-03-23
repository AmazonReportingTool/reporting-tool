'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Returns Report Schema
 */
var ReturnsReportSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    default: ''
  },
  orderId: {
    type: String,
    default: '',
    trim: true
  },
  sku: {
    type: String,
    default: '',
    trim: true
  },
  asin: {
    type: String,
    default: '',
    trim: true
  },
  fnsku: {
    type: String,
    default: '',
    trim: true
  },
  productName: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  fulfillmentCenterId: {
    type: String,
    default: '',
    trim: true
  },
  detailedDisposition: {
    type: String,
    default: '',
    trim: true
  },
  reason: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('ReturnsReport', ReturnsReportSchema);
