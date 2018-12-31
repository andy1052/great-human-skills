/*
*
*
*
*	This is for createRandomString function which was causing a circular dependency with logging.js when 
	it resided in the original helper.js file. Putting here will avoid collusions. This works perfectly
	well now.
*
*/

//	Dependencies:
const http = require('http');
const dbFuncs = require('../database/dbFuncs');
const querystring = require('querystring');


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



//	This function takes data from /blogSave endpoint and makes a post request to /sendEmail endpoint:
helpers2.autoEmail = async function(data) {

	try {

 	//	Sanitize Data:
 	let title = typeof(data.title) === 'string' && data.title.trim().length > 0 && data.title.trim().length < 200 ? data.title : false;
 	let author = typeof(data.author) === 'string' && data.author.trim().length > 0 && data.author.trim().length < 80 ? data.author : false;
 	let description = typeof(data.description) === 'string' && data.description.length > 0 && data.description.length < 400 ? data.description : false;
 	let category = typeof(data.category) === 'string' && data.category.trim().length > 0 && data.category.trim().length < 30 ? data.category : false;
 	let createdOn = typeof(data.createdOn) === 'string' && data.createdOn.trim().length > 0 && data.createdOn.trim().length > 40 ? data.createdOn : false;

/*
Process:
	1: You need to fetch all the users that have signed up for notifications
	2: You need to build the object you'll be sending to /sendEmail. This object requires:
		- to: email address
		- subject: email subject
		- body: email body sent in html, therefore, populated by the incoming "data" variable.
	3: You need to send a POST request to /sendEmail using the http/https module.
*/

	//	Once data is sanitized, find all users who want to receive notifications:
	let notifications = await dbFuncs.findAll({"notification": "yes"}, 'client');

	//	If there is no data, throw error:
	if (!notifications) throw new Error({"Error": "There was no data returned for notifications!"});


	//	Now, loop through the notifications data and collect the email addresses into an array:
	let noteEmails = [];

	const findEmail = notifications.forEach((e) => {
			noteEmails.push(e.email);
	});

	//	Now create html body to send as email body:
	let body = (`<h1 style="text-align:center; color: #0275d8;">${title}</h1>
		<br>
		<p style="text-align:center; font-family:times;">${description}</p>
		<br>
		<p style="text-align:center;">You can find this and many other great articles in the category: ${category}</p>
		<p>Only at <a href="#">Great Human Skills</a></p>
		`);



	//	Now build object to send to /sendEmail:
	let note = {
		to: noteEmails,
		subject: `A new article you might like was published on Great Human Skills`,
		body: body,
		articleId
	};

	//	Send object as stringified form data, i.e. application/x-www-form-urlencoded:
	const data2 = querystring.stringify(note);


	//	You should probably sanitize the data here!

	const options = {
		hostname: 'localhost',
		port: 3000,
		path: '/sendEmail',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data2.length
		}
	};


// form['Login post should return ok'] = (done) => {
	let req = http.request(options, (res) => {

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

req.on('error', (err) => {
	console.error(err);
});

req.end(data2);


 } catch(e) {
 	console.error(e);
 	return e;
 };

};




//	Export module:
module.exports = helpers2;