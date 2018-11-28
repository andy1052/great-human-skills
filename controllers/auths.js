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
exports = module.exports = function(app) {


//	Sign-up route:
app.get('/sign-up', async (req, res, next) => {
	try {
		res.render('sign-up');
	} catch(e) {
		console.log(e.stack);
		next(e);
	}
});


//	Sign-up Route:
app.post('/sign-up', async (req, res, next) => {

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
			password: x,
			"createdAt": Date()
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
		return res.redirect('/unauthorized');
	}
	} catch(e) {
		console.log(e.stack);
		next(e);
	}
});



//	Login Get Route:
app.get('/login', async (req, res) => {
	res.render('login');
});


//	Login Post Route:
app.post('/login', async (req, res, next) => {

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
				let token = jwt.sign({"username": check.username}, process.env.SECRET, {expiresIn: "60 days"});
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
				next(e);
			}

		});


//	get Edit Account Route:
app.get("/editAccount", (req, res, next) => {

	try {
	if (req.user) {

		let currentUser = req.user;
		//	If user is already logged in, render the editAccount page:
		res.render("editAccount", {currentUser});
	} else {
		res.redirect('/unauthorized');
	}
} catch(e) {
	console.log(e.stack);
	next(e);
	};
});


//	Post accountChange from editAccount page:
app.post("/accountChange", async (req, res, next) => {

	console.log("Req.body from accountChange: ", req.body);

	//	Sanitize data!

	try {
		if (req.user) {

		let currentUser = req.user;

		let confirmed = await dbFuncs.find({"email": req.body.oldEmail}, 'client');

		if (!confirmed) throw new Error({"Error": "Oops! Can't find that email address!"});

		res.render('editAccount', {confirmed, currentUser});

		} else {
			res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		next(e);
	};
});



//	changeSave Post Route from editAccount after confirmation is established:
app.post("/changeSave", async (req, res, next) => {

	console.log("Req.user from changeSave: ", req.user);
	console.log("Req.body from changeSave: ", req.body);

	//	SANITIZE THE DATA!!!!
	let newEmail = typeof(req.body.newEmail) === "string" && req.body.newEmail.trim().length > 0 && req.body.newEmail.trim().length < 60 && req.body.newEmail.trim().includes('@') ? req.body.newEmail.trim() : false;
	let newPass = typeof(req.body.newPass) === 'string' && req.body.newPass.trim().length > 0 && req.body.newPass.trim().length < 60 ? req.body.newPass.trim() : false;
	let confirmed = typeof(req.body.confirmed) === 'string' && req.body.confirmed.trim().length > 0 && req.body.confirmed.trim().length < 60 ? req.body.confirmed.trim() : false;

console.log("Variables: ", newEmail, newPass, confirmed);

	//	Object Id:
	const ObjectId = require('mongodb').ObjectId;


	try{
		// Make sure the user is logged in:
		if (req.user) {

		//	Find this email in the database:
		let check = await dbFuncs.find({_id: ObjectId(confirmed)}, 'client');

console.log("Check: ", check);		

		//	If there is no check, throw error:
		if (!check) throw new Error({"Error": "Cannot login, non-existent email."});


		if (newEmail && newPass) {
			// If Both the email and password have been passed, save them both, but first check them:

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

			if (newEmail === check.email || c) {
				return console.log("one or both fields match the database");
			}

			//	But first hash and compare the password:

			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

			//	then save them

			let both = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "password": x}, 'client');
		}





		if (newPass === false) {

			//	If no password was passed, skip checking the hash, and update the email:
			let email = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail}, 'client');

console.log("Email: ", email);

console.log("no newPass");

			return;

		} else {

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

		//	Check the password first, update if necessary:
		if (c) {
			//If the password already exists, just leave it and return
console.log("No C");			
			return;
		} else {

			//	First hash the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

console.log("X: ", x);

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x}, 'client');
			console.log('Password has been updated!');
		}
	};


		if (newEmail === false) {
			// If no email was passed, save the password and return:

			//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

		//	Check the password first, update if necessary:
		if (c) {
			//If the password already exists, just leave it and return
console.log("No C");			
			return;
		} else {

			//	First hash the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

console.log("X: ", x);

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x}, 'client');
			console.log('Password has been updated!');
		}
			return;

		} else {
		//	Now check the email:
		if (newEmail === check.email) {
			//	If the email is the same, just leave it and return:
			return;
		} else {
			//	Otherwise, update the database:
			let email = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail}, 'client');
			console.log("Email has been updated!");	

console.log("Email: ", email);	
		}
	};



		//	Then redirect home:
		res.redirect('/');

		} else {
			res.redirect('/unauthorized');
		}

	} catch(e) {
		console.log(e.stack);
		next(e);
	};
});





//	Logout Route:
app.get('/logout', async (req, res) => {

	//	make sure req.user object is also cleared to prevevent any sort of sorcery:
	let currentUser = null;

	res.clearCookie('nToken');
	res.render('logout', {currentUser});
});




};	//	End of module.exports