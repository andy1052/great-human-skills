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
helpers.checkFiletype = function(file) {

	console.log("File from checkFiletype: ", file);

	const types = {
		"jpg": "ffd8ffe1",
		"gif": "47494638",
		"png": "89504e47",
	};

	for (type in types) {
		if (types[type] === type) {
			console.log("Found a match!", type);
		}
	};

};




//	Export Module:
module.exports = helpers;