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


//	New Blog LOGIN Post Route:
app.post('/newBlog', async (req, res) => {
	//	Sanitize the data
	let username = typeof(req.body.username) === "string" && req.body.username.trim().length > 0 && req.body.username.trim().length < 80 ? req.body.username.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;

	try {
		//	Find this username and password in the database:
		let check = await dbFuncs.find({"username": username, "password": password}, 'blogger').then((result) => {

			if (!result) {
				//	User not found:
				return res.status(401).res.redirect('/unauthorized');
			}
			return result;
		});

			//	If there is no check, throw error:
			if (!check) throw new Error({"Error": "Cannot login, non-existent user."});

				//	Otherwise, create a new token:
				let token = jwt.sign({_id: check._id}, process.env.SECRET, {expiresIn: "60 days"});
				//	Then set a cookie and redirect to homepage:
				res.cookie('nToken', token, {maxAge: 900000, httpOnly: true});

			//	At this point, everything went well, and you should send the user to the Blog page along with the token
			if (token) {
				return res.render('blog', {token});
			} else {
				return res.status(401).res.redirect('/unauthorized');
			};

			} catch(e) {
				console.log(e.stack);
				return e;
			}

		});



//	Save New Blog To The Database Route:
app.post('/blogSave', async (req, res) => {

	//	First sanitize the data:
	let title = typeof(req.body.title) === "string" && req.body.title.trim().length >0 && req.body.title.trim().length < 60 ? req.body.title.trim() : false;
	let author = typeof(req.body.author) === "string" && req.body.author.trim().length >0 && req.body.author.trim().length < 60 ? req.body.author.trim() : false;
	let description = typeof(req.body.description) === "string" && req.body.description.length >0 && req.body.description.length < 500 ? req.body.description : false;
	let blog = typeof(req.body.blog) === "string" && req.body.description.length > 0 ? req.body.blog : false;

	try {
		
		if (req.user) {

		//	Once data is sanitized, make object and save it to database:
		if (title && author && description && blog) {

		//	Make object:
		const article = {
			title,
			author,
			description,
			blog
		};



		let x = await dbFuncs.insert(article, "articles").then((result) => {

			//	If database confirms save.
			if({"n":1, "ok":1}) {
			console.log("Saved to database!");
			return result;
		} else {
			//	Else, send error
			res.status(400).res.send("Something went wrong when trying to save to database");
		}
	});

		//	Overkill check:
		if (!x) throw new Error({"Error": "Something failed in blogSave"});

		// ************ TODO ************************
		// Should you be automatically logged out right here????


		res.redirect('/');

	} else {
		return res.status(401).res.send("Oops! Something went wrong. Cannot save to database");
	};
}else {
	return res.send("Sorry, there is no user present.");
};
} catch(e){
	console.log(e);
	return e;
}

});


};	//	End of module exports.



//	Sanitize the data:

