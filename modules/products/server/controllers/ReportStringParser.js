'use strict';

//Parse report string using \t as delimiter and \r\n as new line
//NOTE any (-) will be replaced by camelcase so
// purchase-date -> purchaseDate
// return-date -> returnDate
//parseReport function takes the raw report string and will return an array
//of objects that contain the column names as keys and row data as values.
//NOTE: Object can be better described as just rows
var pr = exports.parseReport = function(sReport) {
	var jReport = [ /*row:{ column1: 'value', column2:'value', etc }, row:{ etc } */ ];
	
	//First line will have the column headers which will be our json object keys
	//jReport will contain an array of row objects where each row object will contain
	//the column labels as the key and the corresponding row data under said column as the value

	var rows = sReport.split('\r\n'); //Split at the newlines
	//Now we shall create a two dimensional array!
	for (var i = 0; i < rows.length; i++) {
		rows[i] = rows[i].split('\t'); //Split at tab so now we have the data of the row
	}
	//Rows is not an array of arrays
	
	//Now we parse into objects skipping the first row (Just column labels)
	for (var i = 1; i < rows.length; i++) {
		var row = {}; //Create the object
		for (var j = 0; j < rows[i].length; j++) {
			if (i === 1) {
				//Check key for hyphen/space and replace with camelcase
				rows[0][j] = rows[0][j].replace(/(-|\s)([a-z])/g, function(c) {
					return c[1].toUpperCase();
				});
			}
			//Create the row using the first row as the key
			//and the current i row as the data
			row[rows[0][j]] = rows[i][j];
		}
		jReport.push(row);
	}

	return jReport;
}

