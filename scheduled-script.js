'use strict';
var mongoose = require('mongoose')
var config = require('./config/env/development.js');
//Comment out line below when run with server
mongoose.connect(config.db.uri);

var schedule = require('node-schedule');
var invRe = require('./modules/reports/server/controllers/inventory-report.server.controller.js');
var retRe = require('./modules/reports/server/controllers/returns-report.server.controller.js');
var ordRe = require('./modules/reports/server/controllers/orders-report.server.controller.js');
var reports = require('./modules/reports/server/controllers/mws-reports.server.controller.js');
var startDate, endDate;

//Schedule a function to run everyday at midnight. The function will process all 3 report controllers
var job = schedule.scheduleJob('10 0 0 * * *', RunReports);
Log('Started Scheduled Script...');
//RunReports();

//Callback for the scheduled job
function RunReports() {
  endDate = new Date(); //Today midnight
  endDate.setHours(0,0,0,0);
  startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1); //1 day ago midnight
  //Log(startDate + ' - ' + endDate);

  try {
		Log('Requesting inventory report...');
		reports.GetWarehouseInventoryReport(ProcInvReport);
	} catch(err) {
		Log('Exception caught in inventory report: ' + err);
	}
  try {
		Log('Requesting returns report...');
		reports.GetCustomerReturnsReport(startDate, endDate, ProcRetReport);
	} catch(err) {
		Log('Exception caught in returns report: ' + err);
	}
  try {
		Log('Requesting orders report...');
		reports.GetFulfilledOrdersReport(startDate, endDate, ProcOrdReport);
	} catch(err) {
		Log('Exception caught in orders report: ' + err);
	}
}

//Callback for the inventory report function. Arg is the inventory report in json
function ProcInvReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  Log('Inventory Report recieved: ' + jReport.ReportId);
  invRe.ProcessInventoryReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    Log('Inventory Report Complete');
  });
}

//Callback for the returns report function. Arg is the returns report in json
function ProcRetReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  Log('Returns Report recieved: ' + jReport.ReportId);
  retRe.ProcessReturnsReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    Log('Returns Report Complete');
  });
}

//Callback for the orders report function. Arg is the orders report in json
function ProcOrdReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  Log('Orders Report recieved: ' + jReport.ReportId);
  ordRe.ProcessOrdersReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    Log('Orders Report Complete');
  });
}

//Handle errors
function HandleError(jReport) {
  var error = jReport.Error;
  Log('Error in scheduled script: ' + error);
}

function Log(msg) {
	var now = new Date();
	var timeStamp = '' + (now.getMonth() + 1) + '/' + now.getDate() + '/' 
		+ now.getFullYear() + ' ' 
		+ ("0"+now.getHours()).slice(-2) + ':' 
		+ ("0"+now.getMinutes()).slice(-2)
		+ '> ';
	//Clever solution thanks to 
	//https://stackoverflow.com/questions/18889548/javascript-change-gethours-to-2-digit
	console.log(timeStamp + msg);
}

