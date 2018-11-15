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
const jwt = require('jsonwebtoken');



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
	let username = typeof(req.body.username) === "string" && req.body.username.trim().length > 0 && req.body.username.trim().length < 60 ? req.body.username.trim() : false;
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try{

	//	Make sure that a username, an email and a password were entered:
	if (username && email && password){

		//	First hash the password:
		let x = await helpers.salt(password).then((y) => {
			return y;
		});

		if (!x) throw new Error({"Error": "Password could not be hashed. Exiting."});

		//	If password "x", was hashed, then make the client model/object:

		const client = {
			username,
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

			//	Generate web token:
			// let token = jwt.sign({_id: result._id}, process.env.SECRET, {expiresIn: "60 days"});
			let token = jwt.sign(client, process.env.SECRET, {expiresIn: "60 days"});

			res.cookie('nToken', token, {maxAge: 900000, httpOnly: true});

			//	Redirect to homepage:
			res.redirect('/');
		} else {
			//	If the database does not save, redirect.
			// *********** TODO *********** redirect to sign-up with message to try again.
			res.redirect('/sign-up');
		}
		});

	} else {
		//	If !username, email, password.
		console.log('Oops! Looks like you forgot to enter a field. Give it another shot.');
		return res.render('unauthorized');
	}
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
				return res.status(401).res.redirect('/unauthorized');
			}
			return result;
		});
			//	If there is no check, throw error:
			if (!check) throw new Error({"Error": "Cannot login, non-existent email."});

			//	Compare entered password to hashed password:
			let c = await helpers.compare(password, check.password).then((result) => {
				if (!result) {
					//	Password not found:

					//*********** TODO ************* display a message on login page to try again.

					return res.status(401).res.redirect('/login');
				}

				//	Otherwise, create a new token:
				let token = jwt.sign({"email": email}, process.env.SECRET, {expiresIn: "60 days"});
				//	Then set a cookie and redirect to homepage:
				res.cookie('nToken', token, {maxAge: 900000, httpOnly: true});
				// console.log("Password result: ", result);
				// console.log("token:", token);
				return result;
			});

			//	Overkill check on c, if no result is returned, throw error:
			if (!c) throw new Error({"Error": "No result returned from checking password, internal error"});

			//	At this point, everything went well, and you should send the user to the homepage along with req.user
			res.redirect('/');

			} catch(e) {
				console.log(e.stack);
				return e;
			}

		});






//	Logout Route:
app.get('/logout', async (req, res) => {

	//	make sure req.user object is also cleared to prevevent any sort of sorcery:
	let currentUser = null;

	res.clearCookie('nToken');
	res.render('logout', {currentUser});
});




};	//	End of module.exports