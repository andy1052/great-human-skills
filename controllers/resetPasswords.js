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
		let up = await dbFuncs.findOneAndUpdate({_id: ObjectId(user._id)}, {"reset_password_token": token, "reset_password_expires": Date.now() + 86400000}, 'client');

		//	If there is no up, throw error:
		if (!up) throw new Error({"Error": "Could not update user account with reset_password_token!"});

		//	Make variable object to send only relevant info to helpers2:
		let data = {
			"username": up.value.username,
			"email": up.value.email,
			"token": up.value.reset_password_token
		};

 // console.log("Up.tostring(): ", up.value);
 // console.log("DATA: ", data);

		//	Otherwise, send data object the helpers2.resetPassEmail(), in order to send email:
		let sendEmail = await helpers2.resetPassEmail(data);



	} catch(e) {
		console.error(e);
		next(e);
	};
});



//	Route that renders when user clicks on email sent from /resetPass - helpers2.resetPassEmail():
app.get('/resetToken/:id', async (req, res, next) => {

	console.log("/resetToken/:id", req.body);

});







};	//	End of module exports!