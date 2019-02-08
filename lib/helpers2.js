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
const config = require('../config/config');
const sharp = require('sharp');


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
	};

	//	Send object as stringified form data, i.e. application/x-www-form-urlencoded:
	const data2 = querystring.stringify(note);


	//	You should probably sanitize the data here!

	const options = {
		hostname: 'localhost',
		port: config.port,
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




//	Function to send resetPassword Email:
helpers2.resetPassEmail = async function(data) {

	//	Sanitize data:
	let user = typeof(data) === 'object' ? data : false;
	let username = typeof(user.username) === 'string' && user.username.length > 0 && user.username.length < 60 ? user.username : false;
	let email = typeof(user.email) === 'string' && user.email.trim().length > 0 && user.email.trim().length < 120 && user.email.trim().includes('@') ? user.email.trim() : false;
	let token = typeof(user.token) === 'string' && user.token.trim().length > 0 && user.token.trim().length < 50 ? user.token.trim() : false;

	try {

		//	Make html template to send to user:
		let template = `<!DOCTYPE html>
		<html>
		<head>
			<title>GHS Password Reset</title>
		</head>
		<body>
			<div>
				<h3>Dear ${username},</h3>
				<p>You requested a password reset for your Great Human Skills account. Please use <a href="https://greathumanskills/resetToken/${token}">this link</a> to do so.</p>
				<br>
				<p>If you did not request this password reset, please let us know <a href="mailto:info@greathumanskills.com">here</a></p>
				<p>Thanks for your time and we hope to see you soon at <a href="https://greathumanskills.com">Great Human Skills</a></p>
			</div>

		</body>
		</html>	`;


//	Now build object to send to /sendEmail:
	let note = {
		to: email,
		subject: `Great Human Skills Password Reset`,
		body: template,
	};

	//	Send object as stringified form data, i.e. application/x-www-form-urlencoded:
	const data3 = querystring.stringify(note);


	//	You should probably sanitize the data here!

	const options = {
		hostname: 'localhost',
		port: config.port,
		path: '/sendEmail',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data3.length
		}
	};


// Send http post request:	
	let req = http.request(options, (res) => {

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

req.on('error', (err) => {
	console.error(err);
});

req.end(data3);


	} catch(e) {
		console.error(e);
		return e;
	};
};




//	Route to send confirmation that password has been changed:
helpers2.confirmResetPassEmail = function(data) {

	//	Sanitize data:
	let user = typeof(data) === 'object' ? data : false;
	let username = typeof(user.username) === 'string' && user.username.length > 0 && user.username.length < 60 ? user.username : false;
	let email = typeof(user.email) === 'string' && user.email.trim().length > 0 && user.email.trim().length < 120 && user.email.trim().includes('@') ? user.email.trim() : false;

	try {

		//	Make html template to send to user:
		let template = `<!DOCTYPE html>
		<html>
		<head>
			<title>GHS Password Reset</title>
		</head>
		<body>
			<div>
				<h3>Dear ${username},</h3>
				<p>Your password has successfully been changed.<br>You can log in using this <a href="http://greathumanskills/login">link</a></p>
				<br>
				<p>If you did not request this password reset, please let us know <a href="mailto:info@greathumanskills.com">here</a></p>
				<p>Thanks for your time and we hope to see you soon at <a href="http://greathumanskills.com">Great Human Skills</a></p>
			</div>

		</body>
		</html>	`;


//	Now build object to send to /sendEmail:
	let note = {
		to: email,
		subject: `Your Great Human Skills Password Has Been Successfully Reset`,
		body: template,
	};

	//	Send object as stringified form data, i.e. application/x-www-form-urlencoded:
	const data4 = querystring.stringify(note);


	//	You should probably sanitize the data here!

	const options = {
		hostname: 'localhost',
		port: config.port,
		path: '/sendEmail',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data4.length
		}
	};


// Send http post request:	
	let req = http.request(options, (res) => {

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

req.on('error', (err) => {
	console.error(err);
});

req.end(data4);


	} catch(e) {
		console.error(e);
		return e;
	};

};


helpers2.resize = function(imageFile) {
	return new Promise((resolve, reject) => {
		sharp(imageFile).resize({width: 300, height: 300}).toBuffer().then(data => {

			if (!data) reject("No data returned!");

			// console.log("transform size: ", data.length / 1000000);
			 resolve(data);
		});
	});
};


//	Export module:
module.exports = helpers2;