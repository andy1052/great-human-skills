/*
*
*
*
*	Helper functions/middleware for encryption
*
*/

//	Dependencies:
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _logging = require('./logging');


//	Container:
helpers = {};


//	Function to Salt the user's password:
helpers.salt = async function(password) {
	try{
		let b = await bcrypt.hash(password, 10).then((result) => {
			return result;
		});
		return b;
	} catch(e) {
		console.log(e.stack);
		return e;
	};
};


//	Function to Compare password to the hashedPassword:
helpers.compare = async function(password, hashedP) {
	try {
		let c = await bcrypt.compare(password, hashedP).then((result) => {
			return result;
		});
		return c;
	} catch(e) {
		console.log(e.stack);
		return e;
	};
};



//	Function to Check authorization of cookies:
helpers.checkAuth = async function(req, res, next) {

	try{

		if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
			req.user = null;
		} else {
			let token = req.cookies.nToken;
			let decoded = jwt.verify(token, process.env.SECRET);
			req.user = decoded;
		}
		next();

	} catch(e) {
		console.error(e);
		return e;
	};
};



//	Function to Check the file type of uploaded images:
helpers.checkFiletype = function(file) {

	return new Promise((resolve, reject) => {

	const types = {
		"jpg": "ffd8ffe0",
		"jpeg": "ffd8ffe1",
		"gif": "47494638",
		"png": "89504e47",
	};

	//	Using ES6, convert the object to an array (your choices are Object.key, Object.value, Object.entries):
	const fileTypes = Object.values(types);

	//	Coutner variable to keep track of how many elements do not match the file argument:
	let counter = 0;
	
	//	Now loop through array using for...of loop:
	for (let type of fileTypes) {

		//	If the file passed as argument matches a number from the array, return the result:
		if (file === type) {
			resolve(type);
		};
		//	Otherwise, update the counter variable:
			counter += 1;
	};

	//	If the counter matches the length of the fileTypes array, then no matches were found and you 
	//	should redirect the user to try again:
	if (counter === fileTypes.length) {

		reject(null);
	};
	});
};







//	Function to rotate log files:
helpers.rotateLogs = function() {

	try {

		//	First list the files:
		 _logging.list(false, (err, logs) => {

		//	If err, throw err:
		if (err) throw new Error("There was an error listing log files!");

		//	Otherwise, loop through returned logs:
		logs.forEach((logName) => {

			// Compress data to a different file:
			let logId = logName.replace('.log', '');
			let newFileId = logId + '--' + new Date().toString();

			_logging.compress(logId, newFileId, (err) => {

			if (err) throw new Error("There was an error compressing files!");

			//	Otherwise, truncate the log:
			_logging.truncate(logId, (err) => {
			
			//	If no trunc, throw err:
			if (err) throw new Error("There was an error truncating files!");

			//	Otherwise, confirm:
			console.log("Log files have been compressed and truncated!");

					});
				});			
			});
		});
	} catch(e) {
		console.error(e.message);
		return e;
	};
};




//	Function to rotate logs (in production mode) once a day:
helpers.logRotationLoop = function() {

	try {
	setTimeout(() => {
		helpers.rotateLogs();
	}, 1000 * 60 * 60 * 24);

	} catch(e) {
		console.error(e);
		return e;
	};
};



//	Export Module:
module.exports = helpers;