'use strict';
/*
 * This file will contain functions to get different types of reports by callbacks and also insert the data into the mongoose database
 * NOTE: The json report object will contain ReportId and ReportRows where ReportRows is an array of row objects with 
 * 	the report column headers as keys and corresponding data as value
 * NOTE: If an error occures the callback will be sent a json object with a single key value pair as Error:ERROR_MESSAGE
 *
 * ReportObject contains
 * {
 * 	ReportId : String
 * 	ReportRows : [ {} ]
 * 	ReportType : String
 * }
*/

// variables for configuration
var config = require('../../../../config/env/local');

// variables to set up mws client
var MWS = require('mws-sdk'),
    client = new MWS.Client(config.accessKeyId, config.secretAccessKey, config.merchantId, {}),
    marketPlaceId = 'ATVPDKIKX0DER';

// Constant variables
const REQUEST_WAIT_TIME = 60 * 1000,
			MAX_REQUEST_CHECKS = 5;

//Get Report function to be used externally
//NOTE: Date range can be anything
var GetCustomerReturnsReport = exports.GetCustomerReturnsReport = function(startDate, endDate, callback) {
	const REPORT_TYPE = '_GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_';
	RequestReport(function(result) {
		//Backup plan for if report gets cancelled
		if (result.Error !== undefined && result.Error.indexOf('CANCELLED') > -1) {
			//Attempt one final time with getting the last report created
			GetLatestReportByType(REPORT_TYPE, callback);
		} else {
			callback(result);
		}
	}, REPORT_TYPE, startDate, endDate);
}

//Get Report function to be used externally
//NOTE: Report will get cancelled if attempted consecutively within 24 hours
//Hence the backup plane (GetLatestReportByType)
var GetWarehouseInventoryReport = exports.GetWarehouseInventoryReport = function (callback) {
	//Get the report will all the items in the warehouse, contains skus, asins, quantity, ect
	const REPORT_TYPE = '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_';
	RequestReport(function(result) {
		//Backup plan for if report gets cancelled
		if (result.Error !== undefined && result.Error.indexOf('CANCELLED') > -1) {
			//Attempt one final time with getting the last report created
			GetLatestReportByType(REPORT_TYPE, callback);
		} else {
			callback(result);
		}
	}, REPORT_TYPE);
}

//Get Report function to be used externally
var GetFulfilledOrdersReport = exports.GetFulfilledOrdersReport = function (startDate, endDate, callback) {
	//Get the report for fulfilled orders with startdate and enddate and they must be LESS THEN 1 month different!
	const REPORT_TYPE = '_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_';
	//NOTE: Report will get cancelled if the dates are more than a month apart (Or as i found even if
	//they are exactly ONE month apart...
	RequestReport(function(result) {
		//Backup plan for if report gets cancelled
		if (result.Error !== undefined && result.Error.indexOf('CANCELLED') > -1) {
			//Attempt one final time with getting the last report created
			GetLatestReportByType(REPORT_TYPE, callback);
		} else {
			callback(result);
		}
	}, REPORT_TYPE, startDate, endDate);
}

//The following function will place a request for a report and continue down the chain
//of funtions to aquire and send the report back into the callback
//startDate and endDate may be omitted
var RequestReport = function(callback, reportType, startDate, endDate) {
	var rr = new MWS.Reports.requests.RequestReport();
	rr.params.ReportType.value = reportType;
	//Convert start/end date to appropriate formats
	if (startDate !== undefined) {
		rr.params.StartDate.value = startDate.toISOString();
	}
	if (endDate !== undefined) {
		rr.params.EndDate.value = endDate.toISOString();
	}
	
	client.invoke(rr, function(result) {
		//Handle the error if the requestid was not found
		if (result.ErrorResponse !== undefined) {
			callback({ 'Error': result.ErrorResponse.Error[0]});
			return;
		}
		
		var response = result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0];
		var reportStatus = response.ReportProcessingStatus[0];
		var reportRequestId = response.ReportRequestId;
		if (reportRequestId !== undefined) {
			reportRequestId = reportRequestId[0];
		}

		if (reportStatus.indexOf('SUBMITTED') > -1) {
			//Request succeeded
			//Now get the report using the aquired request id
			//NOTE: Will wait for a bit so that amazon has some time to finish the report
			console.log('Report requested, waiting before first check. RID:' + reportRequestId);

			setTimeout(function() {
				GetReportByRequestId(reportRequestId, callback);
			}, REQUEST_WAIT_TIME/2);
		} else {
			//Request failed
			callback({ 'Error' : 'ReportRequest failed for ' + reportType + '\n' +
				'Report status: ' + reportStatus });
		}
	});
}

//Following function will return a jReport object to the callback given provided the RequestId in reqId
//NOTE: extra may be omitted its is just there for extra
var GetReportByRequestId = function(reqId, callback, extra) {
	var grl = new MWS.Reports.requests.GetReportRequestList();
	grl.params.ReportRequestIds.value = reqId;

	client.invoke(grl, function(result) {
		//Handle the error if the requestid was not found
		if (result.ErrorResponse !== undefined) {
			callback({ 'Error': result.ErrorResponse.Error[0]});
			return;
		}

		//Result contains json with request info
		//Following piece of code is techinically obsolete since the only RequestInfo
		//returned should be the one we asked for initially but w/e
		var response = result.GetReportRequestListResponse.GetReportRequestListResult[0].ReportRequestInfo[0]; //Only one response
		
		//Grab some info from the response and make sure they are even there!
		var reportType = response.ReportType[0];
		var reportProcStatus = response.ReportProcessingStatus[0];
		var startProcDate;
		if (startProcDate !== undefined) {
			startProcDate = response.StartedProcessingDate[0];
		}
		var endProcDate = response.CompletedDate;
		if (endProcDate !== undefined) {
			endProcDate = endProcDate[0];
		}
		var reportId = response.GeneratedReportId;
		if (reportId !== undefined) {
			reportId = reportId[0]; //NOTE: May be undefined if NO_DATA in status
		}
		
		//Lets see if the report was cancelled or had no data
		if (reportProcStatus.indexOf('NO_DATA') > -1 || 
				reportProcStatus.indexOf('CANCELLED') > -1) {
			//Report is empty...
			var report = {
				'ReportType' : reportType,
				'ReportEndProcessingDate' : endProcDate,
				'Error' : reportProcStatus 
			};
			callback(report);
		} else if (reportProcStatus.indexOf('DONE') > -1 &&
				reportId !== undefined) {
			//The report is hot n ready!!!
			GetReportById(reportId, function(jReport) {
				//Add some stuff into the jReport?
				jReport.ReportType = reportType;
				//jReport.ReportProcessingStatus = reportProcStatus;
				//jReport.ReportStartProcessingDate = startProcDate;
				jReport.ReportEndProcessingDate = endProcDate;
				//Maybe not
				callback(jReport);
			});
		} else {
			//Report is not complete yet lets give it X amount of time to complete
			//afterwich this function will be run again. Funception!
			//Check the counter in extra to make sure this doesnt get out of hand
			if (extra === undefined || extra.Count === undefined) {
				//Lets keep a counter in extra so we can keep track of how many times
				//this runs
				extra = { 'Count': 1 };
			} else if (extra.Count >= MAX_REQUEST_CHECKS) {
				//End this nonsense!
				callback({ 'Error' : 'Gave up on waiting for report with RequestId:' + reqId });
				return;
			}
			
			//Increment the counter
			extra.Count++;
			//If all is guchii then run this function again later
			console.log('Waiting for report to process. RID:' + reqId);
			setTimeout(function() {
				GetReportByRequestId(reqId, callback, extra);
			}, REQUEST_WAIT_TIME);
		}
	});
}

//This funtion is run async and therefore returns nothing, an id and callback must be handed to it
//and the json report will be returned into the callback
var GetReportById = function(id, callback) {
	var gr = new MWS.Reports.requests.GetReport();
	gr.params.ReportId.value = id;
	client.invoke(gr, function(result) {
		//Handle the error if the requestid was not found
		if (result.ErrorResponse !== undefined) {
			callback({ 'Error': result.ErrorReponse.Error[0]});
			return;
		}

		//Result contains a string with the report data
		//It must be parsed
		var reportRows = MWS.ReportParser(result);
		//reportRows is now just an array of row objects we must package that into an appropriate package
		var jReport = { 'ReportId': id,
										'ReportRows':reportRows	};
		//Pass jReport into the callback that was given
		callback(jReport);
	});
}

//This function is quite scetchy and should be avoided. Purpose is for testing.
//This function will get the latest report of type reportType from the reportlist
//In other words the very first one it finds will be returned
var GetLatestReportByType = exports.GetLatestReportByType = function(reportType, callback) {
	var grl = new MWS.Reports.requests.GetReportList();
	grl.params.ReportTypes.value = reportType;

	client.invoke(grl, function(result) {
		//Handle the error if the requestid was not found
		if (result.ErrorResponse !== undefined) {
			callback({ 'Error': result.ErrorResponse.Error[0]});
			return;
		}

		var res = result.GetReportListResponse.GetReportListResult[0].ReportInfo;
		for (var i=0; i<res.length; i++) {
			if (res[i].ReportType[0] === reportType) {
				//Match
				GetReportById(res[i].ReportId[0], function(result) {
					result.ReportType = reportType; //Add the ReportType key
					callback(result);
				});
				return;
			}
		}

		//Didn't find on first page? Check next pages in a continuous fashion
		//
		//pffft naaa fk it
	});
}
/*
var eDate = new Date();
eDate.setHours(0,0,0,0);
var sDate = new Date(eDate.getFullYear(), eDate.getMonth() - 1, eDate.getDate() + 15);
GetFulfilledOrdersReport(sDate, eDate, function(result) {
	console.log(JSON.stringify(result, null, 2));
});
*/
/*
GetWarehouseInventoryReport(function(result) {
	console.log(JSON.stringify(result, null, 2));
});
*/
/*
GetLatestReportByType('_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_', function(result) {
	console.log(JSON.stringify(result, null, 2));
});
*/
/*
var eDate = new Date();
eDate.setHours(0,0,0,0);
var sDate = new Date(eDate.getFullYear(), eDate.getMonth() - 2, eDate.getDate());
GetCustomerReturns(sDate, eDate, function(result) {
	console.log(JSON.stringify(result, null, 2));
});
*/
