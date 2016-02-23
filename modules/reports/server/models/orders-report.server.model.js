'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Inventory Report Schema
 */
var OrderReportSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  amazonOrderId: {
    type: String,
    default: '',
    trim: true
  },
  merchantOrderId: {
    type: String,
    default: '',
    trim: true
  },
  shipmentId: {
    type: String,
    default: '',
    trim: true
  },
  shipmentItemId: {
    type: String,
    default: '',
    trim: true
  },
  amazonOrderItemId: {
    type: String,
    default: '',
    trim: true
  },
  merchantOrderItemId: {
    type: String,
    default: '',
    trim: true
  },
  purchaseDate: {
    type: Date,
    default: 'No found date'
  },
  paymentsDate: {
    type: Date,
    default: 'No found date'
  },
  shipmentDate: {
    type: Date,
    default: 'No found date'
  },
  reportingDate: {
    type: Date,
    default: 'No found date'
  },
  buyerEmail: {
    type: String,
    default: '',
    trim: true
  }
  buyerName: {
    type: String,
    default: '',
    trim: true
  },
  buyerPhoneNumber: {
    type: String,
    default: '',
    trim: true
  },
  sku: {
    type: String,
    default: '',
    trim: true
  },
  productName: {
    type: String,
    default: '',
    trim: true
  },
  quantityShipped: {
    type: Number,
    default: ''
  },
  currency: {
    type: String,
    default: '',
    trim: true
  },
  itemPrice: {
    type: Number,
    default: ''
  },
  itemTax: {
    type: Number,
    default: ''
  },
  shippingPrice: {
    type: Number,
    default: ''
  },
  shippingTax: {
    type: Number,
    default: ''
  },
  giftWrapPrice: {
    type: Number,
    default: ''
  },
  giftWrapTax: {
    type: Number,
    default: ''
  },
  shipServiceLevel: {
    type: String,
    default: '',
    trim: true
  },
  recipientName: {
    type: String,
    default: '',
    trim: true
  },
  shipAddress1: {
    type: String,
    default: '',
    trim: true
  },
  shipAddress2: {
    type: String,
    default: '',
    trim: true
  },
  shipAddress3: {
    type: String,
    default: '',
    trim: true
  },
  shipCity: {
    type: String,
    default: '',
    trim: true
  },
  shipState: {
    type: String,
    default: '',
    trim: true
  },
  shipPostalCode: {
    type: String,
    default: '',
    trim: true
  },
  shipCountry: {
    type: String,
    default: '',
    trim: true
  },
  shipPhoneNumber: {
    type: String,
    default: '',
    trim: true
  },
  billAddress1: {
    type: String,
    default: '',
    trim: true
  },
  billAddress2: {
    type: String,
    default: '',
    trim: true
  },
  billAddress3: {
    type: String,
    default: '',
    trim: true
  },
  billCity: {
    type: String,
    default: '',
    trim: true
  },
  billState: {
    type: String,
    default: '',
    trim: true
  },
  billPostalCode: {
    type: String,
    default: '',
    trim: true
  },
  billCountry: {
    type: String,
    default: '',
    trim: true
  },
  itemPromotionDiscount: {
    type: Number,
    default: ''
  },
  shipPromotionDiscount: {
    type: Number,
    default: '' 
  },
  carrier: {
    type: String,
    default: '',
    trim: true
  },
  trackingNumber: {
    type: String,
    default: '',
    trim: true
  },
  estimatedArrivalDate: {
    type: Date,
    default: ''
  },
  fulfillmentCenterId: {
    type: String,
    default: '',
    trim: true
  },
  fulfillmentChannel: {
    type: String,
    default: '',
    trim: true
  },
  salesChannel: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('OrderReport', OrderReportSchema);
