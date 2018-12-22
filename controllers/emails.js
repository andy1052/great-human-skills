/*
*
*
*	Logic for sending emails from app
*
*/

//	Dependencies:
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const econfig = require('../config/econfig');




exports = module.exports = function(app) {


//	Route to get email form:
app.get("/emailForm", async (req, res, next) => {

	try {

		res.render('emailForm');

	} catch(e) {
		console.error(e.message);
		next(e);
	};

});


//	Route to send email from /emailForm:
app.post("/sendEmail", async (req, res, next) => {

//	************* Be aware of necessary modifications when launching in production behind proxy server ************************


	try {

		//	Sanitize data:
		let to = typeof(req.body.to) === 'string' && req.body.to.trim().length > 0 ? req.body.to.trim() : false; //CAn't set length limit because you don't know how many emails will be involved.
		let subject = typeof(req.body.subject) === 'string' && req.body.subject.length > 0 && req.body.subject.length < 180 ? req.body.subject : false; // Don't trim subject
		let html = typeof(req.body.body) === 'string' && req.body.body.length > 0 ? req.body.body : false;
		let emailAdmin = typeof(req.body.emailAdmin) === 'string' && req.body.emailAdmin.trim().length > 0 && req.body.emailAdmin.trim().length < 350 ? req.body.emailAdmin.trim() : false;

		//	Create your new mail client:
		const oauth2Client = new OAuth2({
			type: econfig.type,
			user: econfig.user,
			clientId: econfig.clientId,
			clientSecret: econfig.clientSecret,
			redirectUri: econfig.redirectUri
		});

		oauth2Client.setCredentials({
			refresh_token: econfig.refreshToken
		});


	// 	const tokens = await oauth2Client.getRequestHeaders();

 // console.log("tokens: ", tokens);


// 		//	Set up transport with OAuth2:
		const transporter = nodemailer.createTransport({
			service: 'gmail',
// 			//	For Gmail, the host, port, and secure fields can be omitted in favor of service: "gmail":
// 			// host: 'smtp.gmail.com',
// 			// port: 587,
// 			// secure: false,
			auth: {
				type: econfig.type,
				user: econfig.user,
				clientId: oauth2Client._clientId,
				clientSecret: oauth2Client._clientSecret,
				refreshToken: oauth2Client.credentials.refresh_token,
			}
		});

		//	Verify transporter/server connection:
		transporter.verify(function(err, success) {
			if (err) {
				console.error(err);
			} else {
				console.log("Server is ready to take your messages.");
			}
		});


		//	Configure mail options:
		let mailOptions = {
			from: 'andy.ducharme@gmail.com',
			to: to,
			subject: subject,
			html: html
			//text: html
		};


		//	Send mail:
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				return console.log("There was an error sending the email: ",err);
			} else {
				console.log("Email was sent!: %s", info.messageId);
				console.log("Info: ", JSON.stringify(info));

				//	Clear emailAdmin:
				emailAdmin = null;

				//	render home, clear cookie:
				res.clearCookie('nToken').redirect('/');
			};
		});

	} catch(e) {
		console.error(e.message);
		next(e);
 	};


	});



};	//	End of module exports