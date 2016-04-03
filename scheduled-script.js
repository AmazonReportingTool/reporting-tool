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
var job = schedule.scheduleJob('0 0 0 * * *', RunReports);
//RunReports();

//Callback for the scheduled job
function RunReports() {
  endDate = new Date(); //Today midnight
  endDate.setHours(0,0,0,0);
  startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1); //1 day ago midnight
  console.log(startDate + ' - ' + endDate);

  reports.GetWarehouseInventoryReport(ProcInvReport);
  reports.GetCustomerReturnsReport(startDate, endDate, ProcRetReport);
  reports.GetFulfilledOrdersReport(startDate, endDate, ProcOrdReport);
}

//Callback for the inventory report function. Arg is the inventory report in json
function ProcInvReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  console.log('Inventory Report recieved: ' + jReport.ReportId);
  invRe.ProcessInventoryReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    console.log('Inventory Report Complete');
  });
}

//Callback for the returns report function. Arg is the returns report in json
function ProcRetReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  console.log('Returns Report recieved: ' + jReport.ReportId);
  retRe.ProcessReturnsReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    console.log('Returns Report Complete');
  });
}

//Callback for the orders report function. Arg is the orders report in json
function ProcOrdReport(jReport) {
  if (jReport.Error !== undefined) {
    //Handle errors
    HandleError(jReport);
    return;
  }
  console.log('Orders Report recieved: ' + JSON.stringify(jReport, null, 2));
  ordRe.ProcessOrdersReport(jReport, function(result) {
    if (result.Error !== undefined) HandleError(reuslt);
    console.log('Orders Report Complete');
  });
}

//Handle errors
function HandleError(jReport) {
  var error = jReport.Error;
  console.log('Error in scheduled script: ' + error);
}

