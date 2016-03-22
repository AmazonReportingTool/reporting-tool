'use strict';
// variables for configuration
var config = require('../../../../config/env/local');

// variables to set up mws client
var MWS = require('mws-sdk'),
    client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
    marketPlaceId = 'ATVPDKIKX0DER';

var ProcessOrdersReport = exports.ProcessOrdersReport = function(reportObj, callback) {
	ProcessRowsRecursively(reportObj, 0, callback);
}

//Will process all the rows of the reportObj in a recursive async manner use 
//callback relays
function ProcessRowsRecursively(reportObj, counter, callback) {
	var rows = reportObj.ReportRows;
	if (counter < rows.length) {
		//Call AddFinancialEvents to modify the current row denoted by current
		//NOTE: Will also modify any advancing rows that may have the same orderId
		AddFinancialEvents(rows, counter, function(result, c) {
			if (result.Error !== undefined) {
				//uh ohhh what we do
				if (result.Error.indexOf('throttled') > -1) {
					//Oh pumpernickle
					//Guess we will give the requests a break and let the main app know
					setTimeout(function(){
						ProcessRowsRecursively(reportObj, counter, callback);
					}, 10000);
					console.log('Server has been throttled, waiting 10 seconds until next attempt');
				} else {
					//Hmm how important can it be? can we skip it?
					console.log('Orders Report Controller Error: ' + result.Error);
					//ONWARD!!! SHOO SHOO!!
					c = counter + 1;
				}
			} else {
				//c is the new counter that has been advanced by the AFE function, for efficiency
				//result is the MODIFIED rows object which we will not set reportObj.ReporRows to
				//I agree this does seem like domestic abuse of references but w/e
				reportObj.ReportRows = result; //im sorry
			}
				//Run this function again (Recursion)
				setTimeout(function() {
					ProcessRowsRecursively(reportObj, c, callback);
				}, 1000 * 2); //With some discipline, <3 amazon
		});
	} else {
		//Done
		callback(reportObj);
	}
}

//Will add fees key to the corresponding rows[counter] row and call the callback when complete
//callback will have the rows object now modified
function AddFinancialEvents(rows, counter, callback) {
	//Call the Get Financial Events function and handle its callback here
	//which will edit the rows object which we will then pass to OUR callback
	//back to the upper function
	var orderId = rows[counter].amazonOrderId;
	GetFinancialEvents(orderId, function(result) {
		var i = 0;

		//result is an array of skus
		if (result.Error !== undefined) {
			//Just callback without editing
			console.log(result.Error);
			callback(rows, counter);
			return;
		}

		do {
			rows[counter].fees = result[i];
			counter++; //Increment the counter
			i++;
			//If this loops more than once no need to run GFE again on same order id
		} while(counter < rows.length && rows[counter].amazonOrderId === orderId);
		//Send modified rows back
		callback(rows, counter);
	});
}

// Will request the Financial Events for a particular order ID and return an array of 
// skus with their associated fees
function GetFinancialEvents(orderID, callback){
  var gfe = new MWS.Finances.requests.ListFinancialEvents();
  gfe.set('AmazonOrderId', orderID);

  client.invoke(gfe, function(result) {
    //Handle the error if the requestid was not found
    if (result.ErrorResponse !== undefined) {
      callback({Error: result.ErrorResponse.Error[0].Message[0]});
      return;
    }

    var skus = []; //Array of SKUs for order
    var FBAPerOrderFulfillmentFee;

		//Go down the rabbit hole for the shitmentitem
    var ShipmentItem = result.ListFinancialEventsResponse
			.ListFinancialEventsResult[0]
			.FinancialEvents[0]
			.ShipmentEventList[0]
			.ShipmentEvent[0]
			.ShipmentItemList[0]
			.ShipmentItem;

   //Make array of skus and associated fees for order
    for (var i = 0; i < ShipmentItem.length; i++) {
			//Create new sku object for this sku
      var sku = {};
      //sku.skuValue = ShipmentItem[i].SellerSKU[0];
			var feeComponents = ShipmentItem[i].ItemFeeList[0].FeeComponent;
			for (var j = 0; j < feeComponents.length; j++) {
				var feeType = feeComponents[j].FeeType[0];
				var feeAmount = parseFloat(feeComponents[j].FeeAmount[0].CurrencyAmount[0], 10);
				if (feeType === 'FBAPerOrderFulfillmentFee') {
					//This one is per order so we will just average it amonst the skus in the order
					sku[feeType] = feeAmount / ShipmentItem.length;
				} else if (feeType === 'FBAPerUnitFulfillmentFee'
						|| feeType === 'FBAWeightBasedFee'
						|| feeType === 'Commission') {
					//rip if statement
					//Save the fee
					sku[feeType] = feeAmount;
				}

				skus.push(sku);
			}

			//Yane code
			/*
      if (i == 0) {
        sku.FBAPerOrderFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[0].FeeAmount[0].CurrencyAmount[0] / ShipmentItem.length;
        sku.FBAPerUnitFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[1].FeeAmount[0].CurrencyAmount[0];
        sku.FBAWeightBasedFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[2].FeeAmount[0].CurrencyAmount[0];
        sku.Commission = ShipmentItem[i].ItemFeeList[0].FeeComponent[3].FeeAmount[0].CurrencyAmount[0];  
      } else {
        sku.FBAPerOrderFulfillmentFee = FBAPerOrderFulfillmentFee;
        sku.FBAPerUnitFulfillmentFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[0].FeeAmount[0].CurrencyAmount[0];
        sku.FBAWeightBasedFee = ShipmentItem[i].ItemFeeList[0].FeeComponent[1].FeeAmount[0].CurrencyAmount[0];
        sku.Commission = ShipmentItem[i].ItemFeeList[0].FeeComponent[2].FeeAmount[0].CurrencyAmount[0];
      }
			*/

			//Add the current sku to the skus array
    }
		
		//TODO?
    //if (result.listordersresponse.listordersresult[0].nexttoken !== undefined) {
    //  // call financial events using next token
    //}
		
		//Send the array of skus back
    callback(skus);
  });
};

//GetFinancialEvents('002-1022863-7338627');
