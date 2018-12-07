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
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');



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



//	************* IMG UPLOAD ****************************************************************************

//	Multer Function:
let storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '/home/andy/Desktop/great-human-skills/public/tempImages');
	},
	filename: function(req, file, cb) {
		//	Create a random 31 character string: 
		crypto.randomBytes(31, (err, buf) => {
			cb(null, buf.toString("hex") + path.extname(file.originalname));
		});
		//cb(null, file.fieldname + '-' + Date.now() + '.jpg')
	}
});


//	Multer Function:
let upload = multer({storage: storage,
	onFileUploadStart: function(file) {
		console.log(file.originalname + ' is starting ...');
	}
});



//	*************************************************************************************************


//	Sign-up Route:
app.post('/sign-up', upload.single('profilePic'), async (req, res, next) => {

console.log('Req.Body: ', req.body);
console.log('Req.File: ', req.file);

	//	Sanitize the data
	let username = typeof(req.body.username) === "string" && req.body.username.trim().length > 0 && req.body.username.trim().length < 60 ? req.body.username.trim() : false;
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;
	let image = typeof(req.file.filename) === "string" && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;

	try{

	//	Make sure that a username, an email and a password were entered:
	if (username && email && password && image){

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
			image,
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
				let token = jwt.sign({"username": check.username, "email": check.email}, process.env.SECRET, {expiresIn: "60 days"});
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

	//	SANITIZE THE DATA!!!!
	let newEmail = typeof(req.body.newEmail) === "string" && req.body.newEmail.trim().length > 0 && req.body.newEmail.trim().length < 60 && req.body.newEmail.trim().includes('@') ? req.body.newEmail.trim() : false;
	let newPass = typeof(req.body.newPass) === 'string' && req.body.newPass.trim().length > 0 && req.body.newPass.trim().length < 60 ? req.body.newPass.trim() : false;
	let confirmed = typeof(req.body.confirmed) === 'string' && req.body.confirmed.trim().length > 0 && req.body.confirmed.trim().length < 60 ? req.body.confirmed.trim() : false;

	//	Object Id:
	const ObjectId = require('mongodb').ObjectId;


	try{
		// Make sure the user is logged in:
		if (req.user) {

		//	Find this email in the database:
		let check = await dbFuncs.find({_id: ObjectId(confirmed)}, 'client');

		//	If there is no check, throw error:
		if (!check) throw new Error({"Error": "Cannot login, non-existent email."});

// ************** Case 1: newEmail && newPass && newImage ********************************:

		if (newEmail && newPass && newImage) {

		// If the email, password, and image have been passed, save them, but first check them:

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

			if (newEmail === check.email || c || newImage === check.image) {
				return console.log("one of these fields match the database");
			}

			//	Now hash and compare the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

			//	then save them
			let both = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "password": x, "image": newImage}, 'client');
	

			if (!both) throw new Error({"Error": "could not update client account"});

			console.log("Email, Password, and Image have been updated!");

			//	Then redirect home:
			res.redirect('/');


//	***************** Case 2: if email and password were passed, but no Image *******************:

			} else if (newEmail && newPass && newImage === false) {

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

		//	Check the password first, update if necessary:
		if (c || newEmail === check.email) {

			//If the password and or email already exist:
			return console.log("Case 2: One of these fields matches the database");

		} else {

			//	First hash the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "password": x}, 'client');
			console.log('Password and Email have been updated!');

			//	Then redirect home:
			res.redirect('/');			
		}

//	*************** Case 3: if email and image are passed, but no password ****************************:

	} else if (newEmail && newImage && newPass === false) {

			//	First make sure these values don't already exist:
			if (newEmail === check.email || newImage === check.image) {
				return console.log("Case 3: One of these fields matches the database");
			}

			//	Otherwise save them:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "image": newImage}, 'client');
			console.log('Email and Image have been updated!');

			//	Check to make sure operation was successful:
			if (!pass) throw new Error({"Error": "Email and/or image were not saved to database"});

			//	Then redirect home:
			res.redirect('/');

//	*****************Case 4: if only the email was passed, not the password or image *********************:
	} else if (newEmail && newPass === false && newImage === false) {

			//	First make sure these values don't already exist:
			if (newEmail === check.email) {
				return console.log("Case 4: One of these fields matches the database");
			}

			//	Otherwise save if:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail}, 'client');
			console.log('Email only has been updated!');

			//	Check to make sure operation was successful:
			if (!pass) throw new Error({"Error": "Email and/or image were not saved to database"});

			//	Then redirect home:
			res.redirect('/');			


//	******************* Case 5: if password and image were passed, but not the email ****************:

	} else if (newPass && newImage && newEmail === false) {

			//	First Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

		//	Check the password and image first, update if necessary:
		if (c || newImage === check.image) {
			//If the password or image already exist, return
			return console.log("Case 5: One of these fields matches the database");
		} else {

			//	Otherwise hash the new password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
		});

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x, "image": newImage}, 'client');
			console.log('Password and image only have been updated!');

			//	Then redirect home:
			res.redirect('/');
		}

//	***************** Case 6: if password only is passed, and no image or email ***********************:

	} else if (newPass && newImage === false && newEmail === false) {

			//	First check to make sure the values don't already exist:
			let c = await helpers.compare(newPass, check.password);

			//	Check the password first, update if necessary:
			if (c) {
			//If the password or image already exist, return
			return console.log("Case 6: One of these fields matches the database");
		} else {

			//	Otherwise hash the new password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
		});

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x}, 'client');

			//	Check that the operation went through:
			if (!pass) throw new Error({"Error": "Case 6 database was not updated"});

			console.log("Password only has been updated!");

			//	Then redirect home:
			res.redirect('/');
		}


//	********************** Case 7: If image only is passed, and no password or email *********************:
		} else if (newImage && newEmail === false && newPass === false) {

			//	First check if the values exist:
			if (newImage === check.image) {
				return console.log("Case 7: One of these values matches the database");
			}

			//	Otherwise, update the database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"image": newImage}, 'client');

			//	Check that the operation went through:
			if (!pass) throw new Error({"Error": "Case 7 database was not updated"});

			console.log("Image only has been updated!");

			//	Then redirect home:
			res.redirect('/');
		}

		} else {
			res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		next(e);
	};
});


//	Route for editProfilePic:
app.get('/editProfilePic', async (req, res, next) => {


	try {

		if (req.user) {

		let currentUser = req.user;

		res.render('editProfilePic', {currentUser});
		} else {
		res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});


//	Route for Post changeProfPic:
app.post('/changeProfPic', upload.single("changedProf"), async (req, res, next) => {

console.log("req.file: ", req.file);
console.log("req.user: ", req.user);

	//	Sanitize Data:
	let newImage = typeof(req.file.filename) === "string" && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;

	//	Object Id:
	const ObjectId = require('mongodb').ObjectId;

	//	req.user:
	let userEmail = req.user.email;

	try {
		if (req.user) {

			//	If user is logged in, check to make sure the data is in:
			if (!newImage) throw new Error("No profile pic was uploaded");

			//	Otherwise, make sure the file is new and not the one that already exists in the database:
			let check = await dbFuncs.find({"email": userEmail}, 'client');

			//	If there is no check, throw error:
			if (!check) throw new Error({"Error": "Cannot login, non-existent email."});

			//	If the image is the same, throw error:
			if (newImage === check.image) throw new Error("Image is already assigned to this account");


//************** After all of this, you're going to want to delete this image from the filesystem *******8

			let location = '/home/andy/Desktop/great-human-skills/public/tempImages/' + newImage;

			fs.readFile(location, function(err, data) {
				if (err) throw err;

				//	First determine the files type by checking its binary magic number (first 4 bytes):
				const magic = data.readUIntBE(0,4).toString(16);

console.log("Magic Number????: ", magic);

				//	Check the results against a list, perfect for a helper function here:

				helpers.checkFiletype(magic);

				//	Then, if it passes, check the file's size in megabytes:
				const size = data.length / 1000000;

console.log("File's size in megabytes is: ", size);


			});

		} else {
			res.redirect('/unauthorized');
		}
	} catch(e) {

	};

});




//	Logout Route:
app.get('/logout', (req, res) => {

	//	make sure req.user object is also cleared to prevevent any sort of sorcery:
	let currentUser = null;

	res.clearCookie('nToken');
	res.render('logout', {currentUser});
});




};	//	End of module.exports