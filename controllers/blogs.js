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
		} else if (req.body.word === process.env.EMAIL) {
			let emailAdmin = req.body.word;
			res.render('emailForm', {emailAdmin});

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
				return res.redirect('/unauthorized');
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
				return res.redirect('/unauthorized');
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
	let state = typeof(req.body.state) === "string" && req.body.state.trim().length > 0 && req.body.state.trim().length <= 20 ? req.body.state.trim() : false;
	let category = typeof(req.body.category) === "string" && req.body.category.trim().length > 0 && req.body.category.trim().length <= 20 ? req.body.category.trim() : false;
	let token = typeof(req.body.token) === "string" && req.body.token.trim().length > 0 && req.body.token.trim().length < 350 ? req.body.token.trim() : false;

	try {
		
		if (token) {

		//	Once data is sanitized, make object and save it to database:
		if (title && author && description && state && category) {

		//	Make object:
		const article = {
			title,
			author,
			description,
			state,
			category,
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
			console.log("Something went wrong when trying to save to database");
		}
	});

		//	Overkill check:
		if (!x) throw new Error({"Error": "Something failed in blogSave"});

		//console.log("This is x passed to artImage: ", x.ops[0]._id);

	try {
		if (token) {
			let admin = token;

			res.render('artImage', {"articleMetaId": x.ops[0]._id, admin});
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
		console.log("Oops! Something went wrong. Cannot save to database");
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

	//	Sanitize Data:
	let articleId = typeof(req.body.articleId) === "string" && req.body.articleId.trim().length > 0 && req.body.articleId.trim().length < 80 ? req.body.articleId.trim() : false;

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
			const updateArticleMeta = await dbFuncs.update({_id: ObjectId(articleId)}, {"articleId": saveIt.ops[0]._id}, "articlesMeta");

			if (!updateArticleMeta) throw new Error({"Error": "Could not update articlesMeta"});

			//	make sure req.user object is also cleared to prevevent any sort of sorcery:
				req.user = null;

			res.clearCookie('nToken').status(200).json({"articleId" : articleId});

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

			if (!findArt) throw new Error({"Error": "Could not find article"});

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



//	Route to edit an article's meta data:
app.post("/editMeta", (req, res, next) => {

	let admin = req.user;

	res.render('editArticleMeta', {admin});

});	


//	Route to find article from submission from "editMeta":
app.post("/metaEdit", async (req, res, next) => {

	//	Sanitize data:
	let search = typeof(req.body.artMetaSearch) === 'string' && req.body.artMetaSearch.trim().length > 0 && req.body.artMetaSearch.trim().length < 60 ? req.body.artMetaSearch.trim() : false;

	try {
		if (req.user) {

			//	Find the article by title:
			let info = await dbFuncs.find({"title": search}, 'articlesMeta');

			//	If no results are returned, throw error:
			if (!info) throw new Error({"Error": "Could not find article."});

			res.render("editArticleMeta", {info});


		} else {
			res.redirect('/unauthorized');
		};
	} catch(e) {
		console.log(e.message);
		next(e);
	};

});


//	Route to save newMeta Data from editArticleMeta.handlebars:
app.post("/newMetaSave", async (req, res, next) => {

	// Sanitize data:
	let title = typeof(req.body.title) === "string" && req.body.title.trim().length > 0 && req.body.title.trim().length < 50 ? req.body.title.trim() : false;
	let author = typeof(req.body.title) === "string" && req.body.author.trim().length > 0 && req.body.author.trim().length < 60 ? req.body.author.trim() : false;
	let description = typeof(req.body.description) === "string" && req.body.description.trim().length > 0 && req.body.description.trim().length < 500 ? req.body.description.trim() : false;
	let category = typeof(req.body.category) === "string" && req.body.category.trim().length > 0 && req.body.category.trim().length < 30 ? req.body.category.trim() : false;
	let state = typeof(req.body.state) === "string" && req.body.state.trim().length > 0 && req.body.state.trim().length < 20 ? req.body.state.trim() : false;
	let searched = typeof(req.body.searched) === "string" && req.body.searched.trim().length > 0 && req.body.searched.trim().length < 80 ? req.body.searched.trim() : false;

	//	Req.User:
	let admin = req.user;

	const ObjectId = require('mongodb').ObjectId;

	try {

		//	If admin is logged in:
		if (req.user) {

			//	Create new Meta Object:
			let newMeta = {};

			if (title !== false) {
				newMeta.title = title;
			}

			if (author !== false) {
				newMeta.author = author;
			}

			if (description !== false) {
				newMeta.description = description;
			}

			if (category !== false && category !== "none") {
				newMeta.category = category;
			}

			if (state !== false) {
				newMeta.state = state;
			}

			//	Fetch current Meta Data from database using searched variable passed in from editArticleMeta:
			let dbMeta = await dbFuncs.find({_id: ObjectId(searched)}, 'articlesMeta');

			//	If no results, throw error:
			if (!dbMeta) throw new Error({"Error": "Could not find requested article meta data."});

			//	Now create a temporary object to hold results of for loop below:
			let a = {};

			//	Loop through object using Objec.keys & forEach, adding key and value to "a" object
			//	if property from newMeta doesn't match property from dbMeta.
			let x = Object.keys(newMeta).forEach((k) => {

				if (newMeta[k] !== dbMeta[k]) {

				//	Add key and value to "a" object:
				a[k] = newMeta[k];
				};
			});

			//  Now iterate through this object and make an update call to database for each key/value pair:
			//	Yes, it seems expensive, but it's the only way to get it done, and only admin has access to this
			//	Not users, so the frequency is rare. Still though, a better solution must exist.
			for (x in a) {

			//	Update each kye/value pair as they are iterated:	
			let updateObj = await dbFuncs.update({_id: ObjectId(dbMeta._id)}, {[x]: a[x]}, 'articlesMeta');

			//	If no update, throw error:
			if (!updateObj) throw new Error({"Error": "Something went wrong with the update!"});
		};

			//	Now log admin out of the system:
			//	make sure req.user object is also cleared to prevevent any sort of sorcery:
			admin = null;

			// At this point, re-render editArticleMeta page with confirmation of operation:
			res.clearCookie('nToken').render('confirmMetaEdit');


		} else {
			res.redirect('/unauthorized');
		};
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});





//	Route to edit an article's existing image:
app.post("/editImage", (req, res, next) => {

	let admin = req.user;

	res.render('editArticleImage', {admin});
});





//	Route to find article searched from "editArticleImage":
app.post('/artImageEdit', async (req, res, next) => {

	//	Sanitize Data:
	let articleSearch = typeof(req.body.articleSearch) === "string" && req.body.articleSearch.trim().length > 0 && req.body.articleSearch.trim().length < 80 ? req.body.articleSearch.trim() : false;

console.log("articleSearch: ", articleSearch);

	try {
		if (req.user) {

			//	Fetch the article by title from articlesMeta:
			let found = await dbFuncs.find({"title": articleSearch}, 'articlesMeta');

			//	If no result, throw error:
			if (!found) throw new Error("Could not find specified article!");

			//	Otherwise, re-render page with info:
			res.render('editArticleImage', {found});

		} else {
			res.redirect('/unauthorized');
		};
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});






};	//	End of module exports.

