/*
*
*
*	Admin logic for posting blogs
*
*
*/


//	Dependencies:
const dbFuncs = require('../database/dbFuncs');
const helpers = require('../lib/helpers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//	Get Route:
// app.get('/blog', async (req, res) => {
// 	let admin = req.user;
// 	if (admin.password !== process.env.ADMIN) {
// 		return res.send("Stop! What you're doing is unauthorized and comes with severe consequences for your computer.");
// 	}
// 	res.render('blog', {admin});
// }); 

//	Export module, passing in the app variable:
exports = module.exports = function(app) {


//	Get Word Route:
app.get('/word', (req, res) => {
	res.render('word');
});


//	Admin Login:
app.post('/adlog', async (req, res) => {

	console.log(req.body);

	try {
		if (req.body.word === process.env.ADMIN) {
			let admin = req.body.word;

			res.render('adlog', {admin});
		} else {
			res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		return e;
	}
});


//	New Blog Post Route:
app.post('/newBlog', async (req, res) => {
	//	Sanitize the data
	let username = typeof(req.body.username) === "string" && req.body.username.trim().length > 0 && req.body.username.trim().length < 80 ? req.body.username.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try {
		//	Find this email in the database:
		let check = await dbFuncs.find({"username": username, "password": password}, 'blogger').then((result) => {

console.log("result from blogs: ", result);

			if (!result) {
				//	User not found:
				return res.status(401).res.redirect('/unauthorized');
			}
			return result;
		});
			//	If there is no check, throw error:
			if (!check) throw new Error({"Error": "Cannot login, non-existent user."});

			//	Compare entered password to hashed password:
		//	let c = await helpers.compare(password, password).then((result) => {
		//		if (!result) {
					//	Password not found:

					//*********** TODO ************* display a message on login page to try again.

		//			return res.status(401).res.redirect('/login');
		//		}

				//	Otherwise, create a new token:
				let token = jwt.sign({_id: check._id}, process.env.SECRET, {expiresIn: "60 days"});
				//	Then set a cookie and redirect to homepage:
				res.cookie('nToken', token, {maxAge: 900000, httpOnly: true});
				// console.log("Password result: ", result);
				// console.log("token:", token);
		//		return result;
		//	});

			//	Overkill check on c, if no result is returned, throw error:
		//	if (!c) throw new Error({"Error": "No result returned from checking password, internal error"});

//let admin = c; 
console.log("From blogs.js: ", token);
			//	At this point, everything went well, and you should send the user to the newBlog page along with req.user
			res.render('blog', {token});

			} catch(e) {
				console.log(e.stack);
				return e;
			}

		});



};	//	End of module exports.



//	Sanitize the data:

