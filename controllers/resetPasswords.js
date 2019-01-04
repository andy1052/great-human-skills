/*
*
*
*	Logic to implement "forgot password" functionality
*
*/


//	Dependencies:
const dbFuncs = require('../database/dbFuncs');
const crypto = require('crypto');
const helpers2 = require('../lib/helpers2');
const helpers = require('../lib/helpers');



//	Start by exporting the function and passing app function:
exports = module.exports = function(app) {



//	Route to get user to enter his/her email:
app.get('/forgotPassword', async (req, res, next) => {

	//	First make sure that no one is logged in:
	req.user = null;

	try {
		//	Render the form to gather email:
		res.render('forgotPassForm');

	} catch(e) {
		console.error(e);
		next(e);
	};

});



//	Post route from forgotPassForm:
app.post('/resetPass', async (req, res, next) => {

	//	Sanitize Data:
	let userEmail = typeof(req.body.emailConfirm) === 'string' && req.body.emailConfirm.trim().length > 0 && req.body.emailConfirm.trim().length < 120 ? req.body.emailConfirm.trim() : false;

	//	Initiate ObjectId:
	const ObjectId = require('mongodb').ObjectId;

	try {

		//	First find the user account in database:
		let user = await dbFuncs.find({"email": userEmail}, 'client');

		//	If there is no data, reject the request:
		if (!user) return res.render('sorry5');

		//	Otherwise, create a temporary token:
		let randomToken = crypto.randomBytes(20);

		//	If no randomToken, throw error:
		if (!randomToken) throw new Error({"Error": "No random token was generated!"});

		//	Else, return buf as hexadecimal string:
		let token = randomToken.toString('hex');

		//	Otherwise, update the user account with a reset_password_token field:
		let up = await dbFuncs.findOneAndUpdate({_id: ObjectId(user._id)}, {"reset_password_token": token, "reset_password_expires": Date.now() + 900000}, 'client');

		//	If there is no up, throw error:
		if (!up) throw new Error({"Error": "Could not update user account with reset_password_token!"});

		//	Make variable object to send only relevant info to helpers2:
		let data = {
			"username": up.value.username,
			"email": up.value.email,
			"token": token
		};

		//	Otherwise, send data object the helpers2.resetPassEmail(), in order to send email:
		let sendEmail = await helpers2.resetPassEmail(data);

		//	Redirect to confirmation page here:
		res.render('confirmEmailChange');

	} catch(e) {
		console.error(e);
		next(e);
	};
});



//	Route that renders when user clicks on email sent from /resetPass - helpers2.resetPassEmail():
app.get('/resetToken/:id', async (req, res, next) => {

	//	First of all, this route contains no body and no query. All that's passed is req.params
	//	Which is the token you've generated and then passed on through the link

	//	Sanitize Data:
	let tokenId = typeof(req.params.id) === 'string' && req.params.id.trim().length > 0 && req.params.id.trim().length < 50 ? req.params.id.trim() : false;

	try {
		//	First, check to see that the token matches the one in the database:
		let tokenFind = await dbFuncs.find({"reset_password_token": tokenId}, 'client');

		//	If no info is returned, throw error:
		if (!tokenFind) throw new Error({"Error": "Could not find that token"});

		//	Otherwise, make sure it isn't expired:
		if (tokenFind.reset_password_expires < Date.now()) {

			//	Render sorry page indicating that client must request a new token:
			res.render('sorry6');

		} else {

			let authorizationToken = tokenFind.reset_password_token;

			//	The token is good and isn't expired, so render page to change password:
			res.render('resetPasswordForm', {authorizationToken});
		};

	} catch(e) {
		console.error(e);
		next(e);
	};
});



//	Route to save new password:
app.post('/saveNewPass', async (req, res, next) => {

	//	Sanitize Data:
	let newPass = typeof(req.body.newPassword) === 'string' && req.body.newPassword.trim().length > 0 && req.body.newPassword.trim().length <= 20 ? req.body.newPassword.trim() : false;
	let confPass = typeof(req.body.confirmPassword) === 'string' && req.body.confirmPassword.trim().length > 0 && req.body.confirmPassword.trim().length <= 20 ? req.body.confirmPassword.trim() : false; 
	let authToken = typeof(req.body.authToken) === 'string' && req.body.authToken.trim().length > 0 && req.body.authToken.trim().length < 50 ? req.body.authToken.trim() : false;

	//	Initiate ObjectId:
	const ObjectId = require('mongodb').ObjectId;

	try {

		//	For added security, make sure the authorization token was passed from /resetToken:
		if (authToken) {

			//	First, check to see that the token matches the one in the database:
			let tokenFind = await dbFuncs.find({"reset_password_token": authToken}, 'client');

			//	If no match is found, throw an error:
			if (!tokenFind) throw new Error("There was no match found for this authorizationToken!");

			//	Otherwise, check to see if the new password matches the confirmed password:
			if (newPass === confPass) {

			//	If they do match, update the client's account with a hashed password:
			let x = await helpers.salt(newPass).then((y) => {
				return y;
			});

			//	If the password doesn't hash, throw an error:
			if (!x) throw new Error({"Error": "Password could not be hashed. Exiting."});

			//	Otherwise, save the password:
			let password = await dbFuncs.update({_id: ObjectId(tokenFind._id)}, {"password": x}, 'client');

			//	If no result, throw error:
			if (!password) throw new Error("Could not update client's password!");

			// Now send the client a confirmation email, and then render a confirmation page which redirects to login page:

			//	Make variable object to send only relevant info to helpers2:
			let data = {
				"username": tokenFind.username,
				"email": tokenFind.email
			};

			//	Otherwise, send data object the helpers2.resetPassEmail(), in order to send email:
			let sendEmail = await helpers2.confirmResetPassEmail(data);

			//	Now remove token and expiry date from document:
			let rem = await dbFuncs.unset({_id: ObjectId(tokenFind._id)}, {"reset_password_expires": "", "reset_password_token": ""}, 'client');

			//	If the operation isn't successful, throw error:
			if (!rem) throw new Error("Could not remove token fields from db!");

			//	Then increment the password_reset_times field. I.e. this is sloppy and expensive a new, more efficient way should be found, but it'll do for now:
			let inc = await dbFuncs.increment({_id: ObjectId(tokenFind._id)}, {"password_reset_times": 1}, 'client');

			//	If not successful, throw error:
			if (!inc) throw new Error("Could not increment password_reset_times!");

			//	Redirect to confirmation page here:
			res.render('confirmNewPassword');

		} else {

				//	Render sorry page and redirect to password input:
				res.render('sorry7');
			};



		} else {
			throw new Error("There was no authorizationToken passed!");
		};

	} catch(e) {
		console.error(e);
		next(e);
	};
});







};	//	End of module exports!