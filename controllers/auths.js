/*
*
*
*	Authentication Routes
*
*
*/


//	Dependencies:
const dbFuncs = require('../database/dbFuncs');
const helpers = require('../lib/helpers');
const bcrypt = require('bcrypt');



//	Routes:
module.exports = function(app) {


//	Sign-up route:
app.get('/sign-up', async (req, res) => {
	try {
		res.render('sign-up');
	} catch(e) {
		console.log(e.stack);
		return e;
	}
});


//	Sign-up Route:
app.post('/sign-up', async (req, res) => {

	//	Sanitize the data
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try{

		//	First hash the password:
		let x = await helpers.salt(password).then((y) => {
			return y;
		});

		if (!x) throw new Error({"Error": "Password could not be hashed. Exiting."});

		//	If password "x", was hashed, then make the client model/object:

		const client = {
			email,
			password: x
		};

		//	Then, before saving the client, check to see if the email address already exists:
		let check = await dbFuncs.find({"email": client.email}, 'client').then((result) => {
			//	If there is no result, then the user does not exist and program can continue. Return.
			if (!result) {
				return;
			}

			//	Otherwise, the user already exists, reject the attempt and redirect the unauthorized page.
			console.log('User email already exists.');

		// 	//*********** TODO ************
			//render a page here:
			res.send('Oops! This email address is already registered in our system.');
			return result;
		});

		//	This is an overkill check, but still wise. If check variable is false, throw error.
		if (!check == false) throw new Error({"Error": "This email already exists."});


		//	Then, save the user to the database in 'client' collection:
		let save = await dbFuncs.insert(client, 'client').then((result) => {
			//	If database confirms save redirect to homepage.
			if({"n":1, "ok":1}) {
			console.log("Saved to database!");
			res.redirect('/');
		} else {
			//	If the database does not save, redirect.
			// *********** TODO *********** redirect to sign-up with message to try again.
			res.redirect('/sign-up');
		}
		});
	} catch(e) {
		console.log(e.stack);
		return e;
	}
});



//	Login Get Route:
app.get('/login', async (req, res) => {
	res.render('login');
});


//	Login Post Route:
app.post('/login', async (req, res) => {

		//	Sanitize the data
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try {
		//	Find this email in the database:
		let check = await dbFuncs.find({"email": email}, 'client').then((result) => {
			if (!result) {
				//	User not found:

	//	********** TODO *********** display a message on login page to try again!

				return res.status(401).res.redirect('/login');
			}
			return result;
		});
			//	Otherwise, check the password:

			//	Compare entered password to hashed password:
			let c = await helpers.compare(password, check.password).then((result) => {
				if (!result) {
					//	Password not found:

					//*********** TODO ************* display a message on login page to try again.

					return res.status(401).res.redirect('/login');
				}
				console.log("Password result: ", result);
				return result;
			});





	} catch(e) {
		console.log(e.stack);
		return e;
	}

});






//	Logout Route:





};	//	End of module.exports