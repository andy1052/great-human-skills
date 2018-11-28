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
app.post('/adlog', async (req, res, next) => {

	console.log(req.body);

	try {
		if (req.body.word === process.env.ADMIN) {
			let admin = req.body.word;

			res.render('adlog', {admin});
		} else {
			return res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		next(e);
	}
});


//	New Blog LOGIN Post Route:
app.post('/newBlog', async (req, res, next) => {
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
				next(e);
			}

		});



//	Save New Blog To The Database Route:
app.post('/blogSave', async (req, res, next) => {

	//	First sanitize the data:
	let title = typeof(req.body.title) === "string" && req.body.title.trim().length >0 && req.body.title.trim().length < 60 ? req.body.title.trim() : false;
	let author = typeof(req.body.author) === "string" && req.body.author.trim().length >0 && req.body.author.trim().length < 60 ? req.body.author.trim() : false;
	let description = typeof(req.body.description) === "string" && req.body.description.length >0 && req.body.description.length < 500 ? req.body.description : false;
//	let blog = typeof(req.body.blog) === "string" && req.body.description.length > 0 ? req.body.blog : false;
	let state = typeof(req.body.state) === "string" && req.body.state.trim().length > 0 && req.body.state.trim().length <= 20 ? req.body.state.trim() : false;

	try {
		
		if (req.user) {

		//	Once data is sanitized, make object and save it to database:
		if (title && author && description) {

		//	Make object:
		const article = {
			title,
			author,
			description,
			state,
	//		blog,
			"createdOn": Date(),
			comments: []
		};



		let x = await dbFuncs.insert(article, "articlesMeta").then((result) => {

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

		console.log("This is x passed to quill: ", x.ops[0]._id);

	try {
		if (req.user) {
			let admin = req.user;

			console.log("Admin object: ", admin);

			res.render('quill', {"articleMetaId": x.ops[0]._id, admin});
		} else {
			return res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		next(e);
	}

		//res.render('quill', {x, currentUser});
		//res.redirect('/');

	} else {
		return res.status(401).res.send("Oops! Something went wrong. Cannot save to database");
	};
}else {
	return res.send("Sorry, there is no user present.");
};
} catch(e){
	console.log(e);
	next(e);
}

});


//	Route to practice post quill editor form:
app.post("/quillForm", async (req, res, next) => {

		console.log("QuillForm req.body: ", req.body);

		//	This ObjectId is NECESSARY if you want to search mongoDb by _id. _id is an ObjectId format
		//	Therefore, in order to pass it, you need to use mongoDb's ObjectId Constructor, as demonstrated 
		//	below. Very interesting and important lesson to remember. Now everything works!
		const ObjectId = require('mongodb').ObjectId;

		try {

//**********************			//	Sanitize data 	********************************************

			//	Save Data:
			const saveIt = await dbFuncs.insert(req.body, "articleContent");

			//	Throw error if it doesn't save
			if (!saveIt) throw new Error({"Error": "no save it"});
			
			// Otherwise:
			// console.log("saved it!");
			// console.log("saveIt id: ", saveIt.ops[0]._id);

			// Now find the articleMeta and update it with this article's articleId:
			const updateArticleMeta = await dbFuncs.update({_id: ObjectId(req.body.articleId)}, {"articleId": saveIt.ops[0]._id}, "articlesMeta");

			if (!updateArticleMeta) throw new Error({"Error": "Could not update articlesMeta"});

		// const saveArticleId = await dbFuncs.insert({"articleId": saveIt.ops[0]._id}, ); 


			res.status(200).redirect('/');

		} catch (e) {
			console.log(e.stack);
			next(e);
		}
	});



//	Route for article search by Admin only:
app.post("/artSearch", async (req, res, next) => {

	console.log("From new artSearch: ", req.body.artSearch);
	console.log("From new artSearch user: ", req.user);

	//	Sanitize the data:

	try {

		if (req.user) {
			let admin = req.user;


			let findMetaArt = await dbFuncs.find({"title": req.body.artSearch}, 'articlesMeta');

console.log("FindMetaArt results: ", findMetaArt);

			if (!findMetaArt) throw new Error({"Error": "Could not find requested article in db"});

		let article = findMetaArt.articleId;

console.log("Article: ", article);

			let findArt = await dbFuncs.find({_id: article}, 'articleContent');

console.log("findArt results: ", findArt.data.ops);

			if (!findArt) throw new Error({"Error": "Could not find requested article content from db"});

		//	res.json(findArt.data.ops);

// let showArt = [];

// 		let x = findArt.data.ops.forEach((e, i) => {

//  				let r = e.insert.toString();

// 			//	console.log("Results of r: ", r);
// 				return showArt.push(r);

				// if (e.includes('insert')) {
				// 	return e.insert;
				// }

				// if (e.attributes.includes('bold' || 'italic')) {
				// 	return showArt.push(e.attributes);
				// }

				// // if (e.attributes.includes('italic' && 'bold')) {
				// // 	return e.attributes.insert
				// // }

				// else {
				// 	console.log("Something went wrong!");
				// 	return;
				// }
		//	});

// console.log("showArt: ", showArt.splice(","));

// let g = showArt.splice(",");

	//	const art = JSON.stringify(showArt);

//console.log("Result of forEach: ", x);

// let b = showArt;

// console.log("Show art to send to editor: ", b);
let art = findArt.data.ops;


			res.render('quill', [art]);

		} else {

			return res.redirect('/unauthorized');
		}



	} catch(e) {
		console.log(e.stack);
		next(e);
	};

});





};	//	End of module exports.



//	Sanitize the data:

