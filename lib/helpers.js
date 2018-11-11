/*
*
*
*
*	Helper functions/middleware for encryption
*
*/

//	Dependencies:
const bcrypt = require('bcrypt');



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
}





//	Export Module:
module.exports = helpers;