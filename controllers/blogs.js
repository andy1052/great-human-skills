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

	console.log("req.body from /blogSave: ", req.body);

	//	First sanitize the data:
	let title = typeof(req.body.title) === "string" && req.body.title.trim().length >0 && req.body.title.trim().length < 60 ? req.body.title.trim() : false;
	let author = typeof(req.body.author) === "string" && req.body.author.trim().length >0 && req.body.author.trim().length < 60 ? req.body.author.trim() : false;
	let description = typeof(req.body.description) === "string" && req.body.description.length >0 && req.body.description.length < 500 ? req.body.description : false;
	let artImage = typeof(req.body.artImage) === "string" && req.body.artImage.trim().length > 0 && req.body.artImage.trim().length < 60 ? req.body.artImage : false;
	let state = typeof(req.body.state) === "string" && req.body.state.trim().length > 0 && req.body.state.trim().length <= 20 ? req.body.state.trim() : false;
	let category = typeof(req.body.category) === "string" && req.body.category.trim().length > 0 && req.body.category.trim().length <= 20 ? req.body.category.trim() : false;

	try {

console.log("/blogSave variables", title, author, description, artImage, state, category);
		
		if (req.user) {

		//	Once data is sanitized, make object and save it to database:
		if (title && author && description && state && category && artImage) {

		//	Make object:
		const article = {
			title,
			author,
			description,
			state,
			category,
			artImage,
			"createdOn": new Date().toDateString(),
			comments: []
		};



		let x = await dbFuncs.insert(article, "articlesMeta").then((result) => {

			//	If database confirms save.
			if({"n":1, "ok":1}) {
			console.log("Saved to database!");
			return result;
		} else {
			//	Else, send error
			res.status(400).res.json("Something went wrong when trying to save to database");
		}
	});

		//	Overkill check:
		if (!x) throw new Error({"Error": "Something failed in blogSave"});

		console.log("This is x passed to quill: ", x.ops[0]._id);


		//	Upload the image to file system here:
		




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

			// Now find the articleMeta and update it with this article's articleId:
			const updateArticleMeta = await dbFuncs.update({_id: ObjectId(req.body.articleId)}, {"articleId": saveIt.ops[0]._id}, "articlesMeta");

			if (!updateArticleMeta) throw new Error({"Error": "Could not update articlesMeta"});

			res.status(200).json({"msg": "All Is Well!"});

		} catch (e) {
			console.log(e.stack);
			next(e);
		}
	});




//	Route for article search by Admin only:
app.post("/artSearch", async (req, res, next) => {


	//	*********************** Sanitize the data:

	try {

	//	if (req.user) {
		//	let admin = req.user;


			let findMetaArt = await dbFuncs.find({"title": req.body.data}, 'articlesMeta');

			if (!findMetaArt) throw new Error({"Error": "Could not find requested article in db"});

			let article = findMetaArt.articleId;

			let findArt = await dbFuncs.find({_id: article}, 'articleContent');


			const data = {
				article: findArt.data,
				meta: findMetaArt
			};

					res.json(data);

				} catch(e) {
					console.log(e.stack);
					next(e);
				};

			});




	//	Route to get to quill "edit" editor:
app.post('/getEdit', (req, res, next) => {

	console.log("REq.user: ", req.user);

	let admin = req.user;

	res.render('editArticle', {admin});
});



	//	Route to update edits made in "/getEdit":

/* When the "save changes" button is clicked in "/getEdit" the data first has to go back to the 
front end, because quill needs to pull the data again and make a new Delta object, and then it can
be sent to this route to be saved to the database. */

app.post("/saveArtEdit", async (req, res, next) => {

	//	SANITIZE THE FUCKING DATA HERE!
	console.log("Req.user from /saveArtEdit: ", req.user);
	console.log("Req.body from /saveArtEdit: ", req.body);

	const ObjectId = require('mongodb').ObjectId;

	try {
		if(req.user) {

			//	ArticleId:
			let articleId = req.body.meta.articleId;
			let updates = req.body.edits;

			console.log("Updates from /saveArtEdit: ", updates);

			let f = await dbFuncs.update({_id: ObjectId(articleId)}, {"data": updates}, 'articleContent');

			if (!f) throw new Error({"Error": "Could not save updates!"});

		

			res.json({"msg": "Thank you!"});


		} else {
			throw new Error({"Error": "Admin is not logged in!"});
		}

		//	Now you need to find the original article, then update it. 



	} catch(e) {
		console.log(e);
		next(e);
	};
});


};	//	End of module exports.

