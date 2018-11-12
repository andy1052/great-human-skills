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
			console.log("result: ", result);
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
			console.log(result);
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
		console.log("Req.user from helpers: ", req.user);
	}
	next();
};





//	Export Module:
module.exports = helpers;