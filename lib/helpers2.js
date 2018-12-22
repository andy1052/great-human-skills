/*
*
*
*
*	This is for createRandomString function which was causing a circular dependency with logging.js when 
	it resided in the original helper.js file. Putting here will avoid collusions. This works perfectly
	well now.
*
*/


//	Container:
const helpers2 = {};


//	RandomStringFunction:
//	Create a string of random alpha numeric characters of a given length:
helpers2.createRandomString = function(strLength) {

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


//	Export module:
module.exports = helpers2;