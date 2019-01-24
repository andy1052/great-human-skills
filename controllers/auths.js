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
const fsAsync = require('../lib/fsAsync');
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
		console.error(e);
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

// let res = '';

//	Sign-up Route:
app.post('/sign-up', upload.single('profilePic'), async (req, res, next) => {

	//	Sanitize the data
	let username = typeof(req.body.username) === "string" && req.body.username.trim().length > 0 && req.body.username.trim().length < 60 ? req.body.username.trim() : false;
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;
	let notification = typeof(req.body.notification) === 'string' && req.body.notification.trim().length > 0 && req.body.notification.trim().length < 40 ? req.body.notification.trim() : false;
	let image = typeof(req.file.filename) === "string" && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;


	try{

	//	Make sure that a username, an email and a password were entered:
	if (username && email && password && notification && image){

		//	First hash the password:
		let x = await helpers.salt(password).then((y) => {
			return y;
		});

		if (!x) throw new Error({"Error": "Password could not be hashed. Exiting."});


//	********** File system manipulation code below ********************************************************

		//	Locate the file that was updated:
		let location = '/home/andy/Desktop/great-human-skills/public/tempImages/' + image;

		//	Analyze the file and perform various checks on the data:
		 
		let read = await fsAsync.read(location);

console.log("Read-------------------: ", read);		

		//	If there was an error, throw a new error:
		if (!read) throw new Error({"Error":"Could not read uploaded file!"});

		// Check the file's size in megabytes, keep it under 2Mb maximum:
		const size = read.length / 1000000;

		//	If file size is above 2mb, throw error:
		if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

		//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
		const magic = read.readUIntBE(0,4).toString(16);

		//	Check the results against a list held in helper function:
		let fileType = await helpers.checkFiletype(magic);

console.log("FileType--------------------------: ", fileType);		

		//	If there fileType could not be determined, throw an error:
		if (!fileType) throw new Error ({"Error": "Cannot find the specified type of file!"});

		//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
		let baseDir = path.join(__dirname, "/../public");

		//	Open the directory, passing in newImage variableL
		let openFile = await fsAsync.open(baseDir + '/profiles' + '/' + image, 'wx');

console.log("openfile---------------------------: ", openFile);

		//	If there was an error opening the file, throw error:
		if (!openFile) throw new Error({"Error": "Could not open file and return descriptor!"});

		//	Otherwise, write the file to profiles directory:
		let writeToFile = await fsAsync.write(openFile , read);

console.log("writeToFile-------------------------: ", writeToFile);

		//	If there is no writeToFile confirmation, throw new error:
		if (!writeToFile) throw new Error({"Error": "Could not write to file!"});

		//	Now make sure you close the fileDescriptor!:
		let closeFile = await fsAsync.close(openFile);

console.log("closeFile----------------------------: ", closeFile);

		//	And then delete the uploaded file from the tempImages directory:
		let unlinkFile = await fsAsync.unlink(location);

console.log("unlinkFile----------------------------: ", unlinkFile);

		//	If Error occurs, throw error:
		if (!unlinkFile) throw new Error({"Error": "Could not unlink file!"});

//	********************** END OF FILE SYSTEM MANIPULATION CODE*******************************************************************



		//	If password "x", was hashed and image file passed the validation, then make the client model/object:

		const client = {
			username,
			email,
			password: x,
			notification,
			image,
			"createdAt": Date()
		};


		//	Then, before saving the client, check to see if the email address already exists:
		let check = await dbFuncs.find({"email": client.email}, 'client').then((result) => {

			//	If there is no result, then the user does not exist and program can continue. Return.
			if (!result) {
				return;
			}

			//	Otherwise, the user already exists, so return the results:
			return result;
		});

		//	If check has a value, redirect to alreadyExists page:
		if (check) return res.render('alreadyExists'); 


		//	Otherwise, check is undefined and the user should be saved to the database in 'client' collection:
		let save = await dbFuncs.insert(client, 'client').then((result) => {

			//	If database confirms save redirect to homepage.
			if({"n":1, "ok":1}) {
			console.log("Saved to database!");

			//	Generate web token:
			// let token = jwt.sign(client, process.env.SECRET, {expiresIn: 3600000});

			let token = jwt.sign(client, process.env.SECRET, {expiresIn: 3600000});

//	**** NOTE: In production, these cookie settings will have to change!!!! ***********************

			//	Set cookie maxAge to 60 minutes - 3,600,000 milliseconds:
			res.cookie('nToken', token, {maxAge: 3600000, httpOnly: true});

			//	Redirect to homepage:
			res.redirect('/');
		} else {
			//	If the database does not save, render sorry2.
			res.render('sorry2');
		}
		});

	} else {
		//	If !username, email, password, render sorry2:
		res.render('sorry2');
	};
	} catch(e) {
		console.log(e.stack);
		next(e);
	}
});



//	Login Get Route:
app.get('/login', async (req, res, next) => {

	try {
		res.render('login');
	} catch(e) {
		console.error(e);
		next(e);
	};
});


//	Login Post Route:
app.post('/login', async (req, res, next) => {

		//	Sanitize the data
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try {

		//	Find this email in the database:
		let check = await dbFuncs.find({"email": email}, 'client').then((result) => {
			//	If there is no result returned:
			if (!result) {
				//	User not found:
				return res.status(401).redirect('/unauthorized');
			}
			return result;
		});

			//	If there is no check, render to sorry3:
			if (!check) return res.render('sorry3');

			//	Otherwise, Compare entered password to hashed password:
			let c = await helpers.compare(password, check.password).then((result) => {

				if (!result) {
					//	If Password not found, render sorry3:
					return res.render('sorry3');
				}

				//	Otherwise, create a new token:
				let token = jwt.sign({"username": check.username, "email": check.email}, process.env.SECRET, {expiresIn: 3600000});
				//	Then set a cookie and redirect to homepage:

			//	Set cookie maxAge to 60 minutes - 3,600,000 milliseconds:
			res.cookie('nToken', token, {maxAge: 3600000, httpOnly: true});

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
		};

	} catch(e) {
		console.log(e.stack);
		next(e);
	};
});


//	Post accountChange from editAccount page:
app.post("/accountChange", async (req, res, next) => {

	//	Sanitize Data:
	let oldEmail = typeof(req.body.oldEmail) === 'string' && req.body.oldEmail.trim().length > 0 && req.body.oldEmail.trim().length < 120 ? req.body.oldEmail.trim() : false;

	try {
		if (req.user) {

		let currentUser = req.user;

		//	First confirm that the email posted does match a record in the database:
		let confirmed = await dbFuncs.find({"email": oldEmail}, 'client');

		//	If there is no data, render sorry4:
		if (!confirmed) return res.render('sorry4');

		//	Otherwise, re-render editAccount with the confirmed data, thereby showing a new part
		//	of the page where edits to the account can be made (i.e. posting to /changeSave):
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

	//	Sanitize Data:
	let newEmail = typeof(req.body.newEmail) === "string" && req.body.newEmail.trim().length > 0 && req.body.newEmail.trim().length < 60 && req.body.newEmail.trim().includes('@') ? req.body.newEmail.trim() : false;
	let newPass = typeof(req.body.newPass) === 'string' && req.body.newPass.trim().length > 0 && req.body.newPass.trim().length < 60 ? req.body.newPass.trim() : false;
	let confirmed = typeof(req.body.confirmed) === 'string' && req.body.confirmed.trim().length > 0 && req.body.confirmed.trim().length < 60 ? req.body.confirmed.trim() : false;

	//	Object Id:
	const ObjectId = require('mongodb').ObjectId;


	try{
		// Make sure the user is logged in:
		if (req.user) {

		//	Once more for security and functionality, Find this email in the database:
		let check = await dbFuncs.find({_id: ObjectId(confirmed)}, 'client');

		//	If there is no check, render sorry4:
		if (!check) return res.render('sorry4');

// ************** Case 1: newEmail && newPass ********************************:

		if (newEmail && newPass) {

		// If the email, password have been passed, save them, but first check them:

		//	Compare entered password to hashed password:
		let c = await helpers.compare(newPass, check.password);

			//	If the new email or the new password match an item in the database, render sorry4:
			if (newEmail === check.email || c) {
				console.log("Case 1: One of these fields match the database!");
				return res.render('sorry4');
			}

			//	Otherwise, hash and compare the password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
			});

			//	then save them
			let both = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail, "password": x}, 'client');
	
			//	If both doesn't update, throw an error:
			if (!both) throw new Error({"Error": "Could not update client account!"});

				//	Otherwise, confirm in console that changes were successful:
				console.log("Email and Password have been updated!");

				//	Then redirect home:
				res.redirect('/');


//	*************** Case 2: if pnly email is passed, but no password ****************************:

	} else if (newEmail && newPass === false) {

			//	First make sure the new email doesn't already exist. If it does, render sorry4:
			if (newEmail === check.email) {
				console.log("Case 2: New Email matches field in the database!");
				return res.render('sorry4');
			}

			//	Otherwise save them:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"email": newEmail}, 'client');

			//	If pass doesn't update, throw an error:
			if (!pass) throw new Error({"Error": "Could not update client account!"});

				//	Otherwise, confirm in console that the change was successful:
				console.log('Email has been updated!');


				//	Then redirect home:
				res.redirect('/');


//	***************** Case 3: if password only is passed, and no image or email ***********************:

	} else if (newPass && newEmail === false) {

		//	First check to make sure the values don't already exist:
		let c = await helpers.compare(newPass, check.password);

		//	Check the password first, update if necessary:
		if (c) {

			//If the password already exists, render sorry4:
			console.log("Case 3: New password matches field in the database!");
			return res.render('sorry4');

		} else {

			//	Otherwise hash the new password:
			let x = await helpers.salt(newPass).then((y) => {
			return y;
		});

			//	then update database:
			let pass = await dbFuncs.update({_id: ObjectId(confirmed)}, {"password": x}, 'client');

			//	If pass doesn't update, throw an error:
			if (!pass) throw new Error({"Error": "Could not update client account!"});

				console.log("New Password has been updated!");

				//	Then redirect home:
				res.redirect('/');
				}
			 };
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
		};
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

		//	locate existing file in /profiles:
		let existing = '/home/andy/Desktop/great-human-skills/public/profiles/' + check.image;

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

											//	Then remove the existing file from Profiles:
											fs.unlink(existing, (err) => {

												//	If err, return it:
												if (err) {
													console.log("Err in unlink/profiles: ", err.message);
													return err;
												} else {
												console.log("Existing Profile Image has been removed!");
											};
											});
										};
									});
								};
							});
						 });
					});
				}); //	End of file system manipulation code *********************************************

			//	At this point, update the database with the new image:
				const newImg = await dbFuncs.update({_id: ObjectId(check._id)}, {"image": newImage}, 'client');

			//	Then redirect user to homepage:
				res.redirect('/');

			} else {
				res.redirect('/unauthorized');
			}
		} catch(e) {
			console.log(e.message);
			next(e);
		};
	});





//	Route for account-delete:
app.get('/account-delete', async (req, res, next) => {

	//	Sanitize Data:
	let currentUser = typeof(req.user) === 'object' ? req.user : false;

	try {

		if (currentUser) {

			res.render('account-delete', {currentUser});

		} else {
			res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});


//	Route for Client to Delete account:
app.post('/accountDelete', async (req, res, next) => {

	let currentUser = typeof(req.user) === 'object' ? req.user : false;

	try {
		if (currentUser) {

			//	Get the logged in user's email:
			let userEmail = currentUser.email;

			//	delete the user:
			let del = await dbFuncs.delete({"email": userEmail}, 'client');

			//	If operation did not happen, throw an error.
			if (!del) throw new Error({"Error": "Could not delete user!"});

			//	make sure req.user object is also cleared to prevevent any sort of sorcery:
			let currentUser = null;

			res.clearCookie('nToken').redirect('/');

		} else {
			res.redirect('/unauthorized');
		};
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});




//	Terms and Conditions route:
app.get('/termsAndConditions', async (req, res, next) => {

	try {
		res.render('termsAndConditions');
	} catch(e) {
		console.error(e);
		next(e);
	};
});



//	Privacy Policy route:
app.get('/privacyPolicy', async (req, res, next) => {

	try {
		res.render('privacyPolicy');
	} catch(e) {
		console.error(e);
		next(e);
	};

});






//	Logout Route:
app.get('/logout', (req, res, next) => {

	try {
		//	make sure req.user object is also cleared to prevevent any sort of sorcery:
		let currentUser = null;

		res.clearCookie('nToken');
		res.render('logout', {currentUser});

	} catch(e) {

		console.error(e);
		next(e);
	};
});




};	//	End of module.exports