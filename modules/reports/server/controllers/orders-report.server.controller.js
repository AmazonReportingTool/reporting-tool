'use strict';
// variables for configuration
var config = require('../../../../config/env/local');

// variables to set up mws client
var MWS = require('mws-sdk'),
    client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
    marketPlaceId = 'ATVPDKIKX0DER';

var addFinancialEvents = exports.addFinancialEvents = function(reportObj) {
  for (var i = 0; i < reportObj.ReportRows.length; i++) {
    var newOrder = reportObj.ReportRows[i];

    GetFinancialEvents(newOrder.amazonOrderId, function(result) {
      
      if (result.ErrorCode !== undefined) {
        console.log(result);
        return;
      }

      if (result.length === 1) {
        result.delete(skuValue);
        newOrder.fees = result;
      }
      else {
        for (var j = 0; j < result.length; j++) {
          if (result.skuValue === newOrder.sku) {
            result.delete(skuValue);
            newOrder.fees = result;
            i++;
          }
          else {
            return {Error: 'SKU does not match within order'};
          }
        }
      }
    });    
  }
  
  return reportObj;
};

// Will request the Financial Events for a particular order ID and return an array of 
// skus with their associated fees
var GetFinancialEvents = function(orderID, callback){
  var gfe = new MWS.Finances.requests.ListFinancialEvents();
  gfe.set('AmazonOrderId', orderID);

  client.invoke(gfe, function(result) {
    //Handle the error if the requestid was not found
    if (result.ErrorResponse !== undefined) {
      callback({ErrorCode: result.ErrorResponse.Error[0].Code[0], ErrorMessage: result.ErrorResponse.Error[0].Message[0]});
      return;
    }

    var skus = []; //Array of SKUs for order
    var FBAPerOrderFulfillmentFee;

    var ShipmentItem = result.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent[0].ShipmentItemList[0].ShipmentItem;

   //Make array of skus and associated fees for order
    for (var i = 0; i < ShipmentItem.length; i++) {
      var sku = {},
          FBAPerOrderFulfillmentFee,
          FBAPerUnitFulfillmentFee,
          FBAWeightBasedFee,
          Commission,
          skuValue;

      sku.skuValue = ShipmentItem[i].SellerSKU[0];

      if (i == 0) {
        FBAPerOrderFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[0].FeeAmount[0].CurrencyAmount[0] / ShipmentItem.length;
        sku.FBAPerOrderFulfillmentFee = FBAPerOrderFulfillmentFee;
        sku.FBAPerUnitFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[1].FeeAmount[0].CurrencyAmount[0];
        sku.FBAWeightBasedFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[2].FeeAmount[0].CurrencyAmount[0];
        sku.Commission = ShipmentItem[i].ItemFeeList[0].FeeComponent[3].FeeAmount[0].CurrencyAmount[0];  
      }
      else {
        sku.FBAPerOrderFulfillmentFee = FBAPerOrderFulfillmentFee;
        sku.FBAPerUnitFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[0].FeeAmount[0].CurrencyAmount[0];
        sku.FBAWeightBasedFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[1].FeeAmount[0].CurrencyAmount[0];
        sku.Commission = ShipmentItem[i].ItemFeeList[0].FeeComponent[2].FeeAmount[0].CurrencyAmount[0];
      }

      skus.push(sku);
    }

    console.dir(skus);

    if (result.ListOrdersResponse.ListOrdersResult[0].NextToken !== undefined) {
      // Call Financial Events using next token
    }

    callback(skus);
  })
};

GetFinancialEvents('002-1022863-7338627');