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


//	********** File system manipulation code below ********************************************************

		//	Locate the file that was updated:
		let location = '/home/andy/Desktop/great-human-skills/public/tempImages/' + image;

		//	Analyze the file and perform various checks on the data:
		fs.readFile(location, function(err, data) {

				//	If there was an error, throw it.
				if (err) throw new Error({"Error": "Could not read uploaded file!"});

				// Check the file's size in megabytes, keep it under 2Mb maximum:
				const size = data.length / 1000000;

				//	If file size is above 2mb, throw error:
				if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

				//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
				const magic = data.readUIntBE(0,4).toString(16);

				//	Check the results against a list held in helper function:
				helpers.checkFiletype(magic, (err, result) => {

				//	If there's an error, throw new error:
				if (err) throw new Error({"Error": "Cannot find specified file type!"});

				//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
				let baseDir = path.join(__dirname, "/../public");

				//	Open the directory, passing in newImage variableL
				 fs.open(baseDir + '/profiles' + '/' + image, 'wx', (err, fd) => {
					
						//	If err, throw it:
						if (err) throw new Error({"Error": "Could not get file descriptor!"});

						//	Otherwise, write the file to profiles directory:
						fs.writeFile(fd , data, (err) => {

									//	If err, return it:
									if (err) {
									console.log("Err:", err.message);
									return err;
								} else {
									//	Otherwise, confirm the write....
									console.log("File was written to profiles!");

									//	And then delete the uploaded file from the tempImages directory:
									fs.unlink(location, (err) => {

										//	If err, return it.
										if (err) {
											console.log("Err in unlink: ", err.message);
											return err;
										} else {

											//	Otherwise, confirm that all went well:
											console.log("File was deleted from tempImages!");
										};
									});
								};
							});
						 });
					});
				}); //	End of file system manipulation code *********************************************


		//	If password "x", was hashed and image file passed the validation, then make the client model/object:

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

// ************** Case 1: newEmail && newPass ********************************:

		if (newEmail && newPass) {

		// If the email, password have been passed, save them, but first check them:

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

			if (newEmail === check.email || c) {
				return console.log("one of these fields match the database");
			}

			//	Now hash and compare the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

			//	then save them
			let both = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "password": x}, 'client');
	

			if (!both) throw new Error({"Error": "could not update client account"});

			console.log("Email, Password, and Image have been updated!");

			//	Then redirect home:
			res.redirect('/');


//	*************** Case 2: if pnly email is passed, but no password ****************************:

	} else if (newEmail && newPass === false) {

			//	First make sure these values don't already exist:
			if (newEmail === check.email) {
				return console.log("Case 3: One of these fields matches the database");
			}

			//	Otherwise save them:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail}, 'client');
			console.log('Email has been updated!');

			//	Check to make sure operation was successful:
			if (!pass) throw new Error({"Error": "Email and/or image were not saved to database"});

			//	Then redirect home:
			res.redirect('/');


//	***************** Case 3: if password only is passed, and no image or email ***********************:

	} else if (newPass && newEmail === false) {

			//	First check to make sure the values don't already exist:
			let c = await helpers.compare(newPass, check.password);

			//	Check the password first, update if necessary:
			if (c) {

			//If the password or image already exist, return
			return console.log("Case 3: One of these fields matches the database");
		} else {

			//	Otherwise hash the new password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
		});

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x}, 'client');

			//	Check that the operation went through:
			if (!pass) throw new Error({"Error": "Case 3 database was not updated"});

			console.log("Password only has been updated!");

			//	Then redirect home:
			res.redirect('/');
				}
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

//	********** File system manipulation code below ********************************************************

		//	Locate the file that was updated:
		let location = '/home/andy/Desktop/great-human-skills/public/tempImages/' + newImage;

		//	Analyze the file and perform various checks on the data:
		fs.readFile(location, function(err, data) {

				//	If there was an error, throw it.
				if (err) throw new Error({"Error": "Could not read uploaded file!"});

				// Check the file's size in megabytes, keep it under 2Mb maximum:
				const size = data.length / 1000000;

				//	If file size is above 2mb, throw error:
				if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

				//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
				const magic = data.readUIntBE(0,4).toString(16);

				//	Check the results against a list held in helper function:
				helpers.checkFiletype(magic, (err, result) => {

				//	If there's an error, throw new error:
				if (err) throw new Error({"Error": "Cannot find specified file type!"});

				//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
				let baseDir = path.join(__dirname, "/../public");

				//	Open the directory, passing in newImage variableL
				 fs.open(baseDir + '/profiles' + '/' + newImage, 'wx', (err, fd) => {
					
						//	If err, throw it:
						if (err) throw new Error({"Error": "Could not get file descriptor!"});

						//	Otherwise, write the file to profiles directory:
						fs.writeFile(fd , data, (err) => {

									//	If err, return it:
									if (err) {
									console.log("Err:", err.message);
									return err;
								} else {
									//	Otherwise, confirm the write....
									console.log("File was written to profiles!");

									//	And then delete the uploaded file from the tempImages directory:
									fs.unlink(location, (err) => {

										//	If err, return it.
										if (err) {
											console.log("Err in unlink: ", err.message);
											return err;
										} else {

											//	Otherwise, confirm that all went well:
											console.log("File was deleted from tempImages!");
										};
									});
								};
							});
						 });
					});
				}); //	End of file system manipulation code *********************************************

			//	At this point, update the database with the new image:
				const newImg = await dbFuncs.update({_id: ObjectId(check._id)}, {"image": newImage}, 'client');

				res.redirect('/');
			} else {
				res.redirect('/unauthorized');
			}
		} catch(e) {
			console.log(e.message);
			next(e);
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