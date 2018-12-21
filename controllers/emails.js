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

	console.log("req.body: ", req.body);

	try {

		//	Sanitize data:
		let to = req.body.to;
		let subject = req.body.subject;
		let html = req.body.body;


		//	Create your new mail client:
		const oauth2Client = new OAuth2({
			type: "OAuth2",
			user: "andy.ducharme@gmail.com",
			clientId: '740579153969-63ogenc1aa7c4k90o70ruruafngr35fk.apps.googleusercontent.com',
			clientSecret: '9MNQgETgtGkxE0pRLFqftgSV',
			redirectUri: "https://developers.google.com/oauthplayground"
		});

		oauth2Client.setCredentials({
			refresh_token: '1/FKffVkJGhtmIHsaBOcYRP6p423rObjrg6UeD7FbX2uc'
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
				type: "OAuth2",
				user: "andy.ducharme@gmail.com",
				clientId: oauth2Client._clientId,
				clientSecret: oauth2Client._clientSecret,
				refreshToken: oauth2Client.credentials.refresh_token,
			//	accessToken: 'ya29.Glt5Bn6J2J-BYcfhNYSLpdvuXfKmkygENGi8GdJT1d7IKvSX5z2gpD0-81UI0mc0OF1vFRnlNg6KP0udHsXmF_e8zUH4cIDCrls_yTyyrFoERspV9rQ9wsY_8TEZ'
			//	accessToken: tokens
			}
		});


		//	Configure mail options:
		let mailOptions = {
			from: 'andy.ducharme@gmail.com',
			to: to,
			subject: subject,
			//html: html
			text: html
		};


		//	Send mail:
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				return console.log("There was an error sending the email: ",err);
			} else {
				console.log("Email was sent!: %s", info.messagId);
				console.log("Info: ", JSON.stringify(info));
			};
		});

	} catch(e) {
		console.error(e.message);
		next(e);
 	};


	});



};	//	End of module exports