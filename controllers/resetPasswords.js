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

console.log("TokenId: ", tokenId);


	try {
		//	First, check to see that the token matches the one in the database:
		let tokenFind = await dbFuncs.find({"reset_password_token": tokenId}, 'client');

		//	If no info is returned, throw error:
		if (!tokenFind) throw new Error({"Error": "Could not find that token"});

		//	Otherwise, make sure it isn't expired:
		if (tokenFind.reset_password_expires < Date.now()) {

			//	Render sorry page indicating that client must request a new token:
			console.log("password expired: true");
			res.render('sorry6');

		} else {

			let authorizationToken = tokenFind.reset_password_token;

			//	The token is good and isn't expired, so render page to change password:
			console.log("Password expired: good to go!");
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
	console.log("req.body /saveNewPass: ", req.body);


	try {

	} catch(e) {
		console.error(e);
		next(e);
	};
});







};	//	End of module exports!