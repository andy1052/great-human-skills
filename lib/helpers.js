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
	}
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
helpers.checkAuth = function(req, res, next) {
	console.log("Checking Authentication");
	if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
		req.user = null;
	} else {
		let token = req.cookies.nToken;
		let decodedToken = jwt.decode(token, {complete: true}) || {};
		req.user = decodedToken.payload;
	}
	next();
};



//	Function to Check the file type of uploaded images:
helpers.checkFiletype = function(file, callback) {

	const types = {
		"jpg": "ffd8ffe0",
		"jpeg": "ffd8ffe1",
		"gif": "47494638",
		"png": "89504e47",
	};

	for (type in types) {
		if (file === types[type]) {
			// console.log("Found a match!", type);
			return callback(null, type);
		} else {
			//callback(null);
			console.log("No type found that time!");
		}
	};

};



//	Create a string of random alpha numeric characters of a given length:
helpers.createRandomString = function(strLength) {

	try {

	//	Sanitize data:
	strLength = typeof(strLength) === 'number' && strLength > 0 && strLength <= 20 ? strLength : false;

	//	If no strLength, throw error:
	if (!strLength) throw new Error("strLength isn't valid!");

	//	Otherwise, define all the possible characters that could go into a string:
	const possibleCharacters = 'abcdefghilmnopqrstuvwxyz1234567890';

	//	Initialize the final string:
	let str = '';

	//	For loop using strLength as iterator length:
	for (let i = 0; i < strLength; i++) {
		//	Get a random character from the possibleCharacters string:
		let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
		//	Append this character to the final string:
		str += randomCharacter;
	};

	//	Return the final string:
	return str;

	} catch(e) {
		console.error(e.message);
		return e;
	};
};



//	Function to rotate log files:
helpers.rotateLogs = function() {

	try {

		//	First list the files:
		 _logging.list(false, (err, logs) => {

console.log("list: ", logs);

		//	If err, throw err:
		if (err) throw new Error("There was an error listing log files!");

		//	Otherwise, loop through returned logs:
		logs.forEach((logName) => {

console.log("logName: ", logName);

			// Compress data to a different file:
			let logId = logName.replace('.log', '');
			let newFileId = logId + '--' + new Date().toString();

console.log("logId: ", logId);
console.log("newFileId: ", newFileId);

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
	setTimeout(() => {
		helpers.rotateLogs();
	}, 1000 * 60 * 60 * 24);
};



//	Export Module:
module.exports = helpers;