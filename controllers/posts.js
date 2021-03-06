/*
*
*
*	Routes logic for main blog pages
*
*/

//	Dependencies:
const dbFuncs = require('../database/dbFuncs');
const generator = require('../lib/htmlGenerator');
const uuidv4 = require('uuid/v4');


//	"Global variables" in order to get pagination to work properly:
let page = 0;
let skip = 0;


// export module, passing in express app variable:
exports = module.exports = function(app) {



	//	Homepage route:
	app.get('/', async (req, res, next) => {

		let currentUser = typeof(req.user) === 'object' ? req.user : false;

		try{


//	****************** Session Cookie for analytics purposes **********************************

			//	When the user get to homepage, check their brower to see if the site's assigned them
			//	a session cookie on a previous session. If true, keep it. 
			if (req.cookies.GHScid) {
				console.log("Session cookie already exists: ", req.cookies.GHScid);
			} else {
				// Otherwise, this is either their first visit, or the first in at least 2 years
				// Or they've cleared their cookies.
				//	First check the status of the cookieconsent:
				//	Only issue a cookie if consent is set to 'dismiss' (i.e. accepted):
				if (req.cookies.cookieconsent_status === 'dismiss') {
					//	Setting httpOnly: false makes the cookie available on the browser not just the server.
					res.cookie('GHScid', uuidv4(), { maxAge: 63113904, httpOnly: false});
					console.log("New session cookie has been assigned: ");
				} else {
					//	If this point is reached, the client hasn't agreed to the cookies agreement
					//	So what do you do???
					console.log("Client has not agreed to cookie consent!");
				}
			};
//**************************************************************************************************			

			//	Fetch all articles based on "published" state:
			//	This initial function only returns 5 results first, from newest to oldest.
			let find = await dbFuncs.findAll({"state": "published"}, 'articlesMeta');

			//	Render homepage and pass in currentUser and all articles returned by find:
			res.render('home', {find, currentUser, "page": page + 1});

		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});


	//	Homepage post route, for pagination functionality:
	app.post('/', async (req, res, next) => {

		//	Sanitize Data:
		let plus = typeof(req.body.plus) === 'string' && req.body.plus.trim().length > 0 && req.body.plus.trim().length < 6 ? req.body.plus.trim() : false;
		let minus = typeof(req.body.minus) === 'string' && req.body.minus.trim().length > 0 && req.body.minus.trim().length < 6 ? req.body.minus.trim() : false;
		let currentUser = typeof(req.user) === 'object' ? req.user : false;

		try {

			//	Parse string variables into integers:
			let p = parseInt(plus, 10);
			let m = parseInt(minus, 10);

			if (p === 1) {
				//	If p equal's 1, then increase the variables accordingly, fetching the documents:
				page +=1;
				skip += 5;

			} else if (m === -1) {
				//	If m equal's -1, however, there is an important condition to take care of:

				if (page === 0 && skip === 0) {
					//	To avoid causing mongodb errors with negative numbers,
					//	If the variables are already valued at 0, assign them 0:
					page = 0;
					skip = 0;
				} else {
					//	Otherwise, decrease the variable's values accordingly:
					page -= 1;
					skip -= 5;
				};
			} else {
				//	If all else fails, assign the variables a value of 0:
				page = 0;
				skip = 0;
			};


			//	This needs to be called "find" because of handlebars {{find}} on html page:
			let find = await dbFuncs.paginate({"state": "published"}, skip, 'articlesMeta');


			//	If "paginate" returns an empty array:
			if (find.length === 0) {
				// console.log("******************* I Found Nothing!");
				//	Dial the variables back one page and five results:
				page -= 1;
				skip -= 5;

				//	Call paginate again with the dialed back variables, returning the last results:
				let find = await dbFuncs.paginate({"state": "published"}, skip, 'articlesMeta');

				//	Now, re-render the home page, passing the results to handlebars:
				res.render('home', {find, currentUser, "page": page + 1});

				//	This return statement is IMPERATIVE in order to interrupt the execution of the 
				//	program and keep it from continuing on to the "res.render('home')" below.
				 return;

			} else {
				//	If the original find function returns an array, all is good and the program 
				//	can render the home page using the command below.
				console.log("*******************Array has items!!**********");
			};



			//	Render the homepage with new results:
			res.render('home', {find, currentUser, "page": page + 1});

		} catch(e) {
			console.error(e);
			next(e);
		};
	});





	//	Display single post route:
	app.get('/posts/:id', async (req, res, next) => {

		//	This ObjectId is NECESSARY if you want to search mongoDb by _id. _id is an ObjectId format
		//	Therefore, in order to pass it, you need to use mongoDb's ObjectId Constructor, as demonstrated 
		//	below. Very interesting and important lesson to remember. Now everything works!
		const ObjectId = require('mongodb').ObjectId;

		let currentUser = typeof(req.user) === 'object' ? req.user : false;

			try {

			//	First find the post:
			let post = await dbFuncs.find({_id: ObjectId(req.params.id)}, 'articlesMeta');

			let articleContent = await dbFuncs.find({_id: post.articleId}, 'articleContent');

			const data = await generator.convert(articleContent);

			if (!post) throw new Error({"Error": "Could not fetch posts."});

			//	Define an array to collect "comments" search results and persist to articleShow.handlebars:
			let showComment = [];

			//	Loop through comments ids contained in "articles", find the comments, and push them to showComment
			//	array.
			for (let i = 0; i < post.comments.length; i++) {
				let x = await dbFuncs.find({_id: {$in: [ObjectId(post.comments[i])]}}, 'comments');
				showComment.push(x);
			};

			//	Now render the template, passing in the post and showComment data:
			res.render('articleShow', {data, post, "showComment": showComment, currentUser});
		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});




	//	"Unauthorized" Get Route:
	app.get('/unauthorized', (req, res, next) => {

		try {
			res.render('unauthorized');
		} catch(e) {
			console.error(e);
			next(e);
		};
	});



	//	Route to search for all articles matching specified category from homepage/articleshow Widget:
	app.post("/getCategory", async (req, res, next) => {

		//	Sanitize data:
		let catSearch = typeof(req.body.category) === "string" && req.body.category.trim().length > 0 && req.body.category.trim().length < 20 ? req.body.category.trim() : false;

		try {

			let currentUser = typeof(req.user) === 'object' ? req.user : false;

			//	Find the articles which match the search.
			let catFind = await dbFuncs.findAll({"category": catSearch}, 'articlesMeta');

			//	It doesn't really matter if there are articles or not, so just re-render the homepage either way:
			res.render('home', {catFind, currentUser});

		} catch(e) {
			console.log(e.message);
			next(e);
		};
	});



	//	Route to search for articles from homepage/articleShow Widget:
	app.post("/widgetSearch", async (req, res, next) => {

		//	Sanitize data:
		let inquiry = typeof(req.body.inquiry) === "string" && req.body.inquiry.trim().length > 0 && req.body.inquiry.trim().length < 50 ? req.body.inquiry.trim() : false;

		try {

			//	Set currentUser:
			let currentUser = typeof(req.user) === 'object' ? req.user : false;

			//	Now you determine what the client is looking for by making multiple calls to the db:
			if (inquiry) {

				//	First see if they searched by article title:
				let title = await dbFuncs.findAll({"title": inquiry}, 'articlesMeta');

				//	If title array returns a result:
				if (title.length > 0) {
					//	render home and pass the result and currentUser:
					res.render('home', {title, currentUser});

				//	Otherwise, continue:	
				} else {

				//	See if they searched by author:
				let author = await dbFuncs.findAll({"author": inquiry}, 'articlesMeta');

				//	If author array returns a result:
				if (author.length > 0) {

					//	Render home and pass the result and currentUser:
					res.render('home', {author, currentUser});

				//	Otherwise, continue:	
				} else {

				//	See if they searched by category:
				let cat = await dbFuncs.findAll({"category": inquiry}, 'articlesMeta');

				//	If the cat array returns a result:
				if (cat.length > 0) {

					//	Render home and pass the result and currentUser:
					res.render('home', {cat, currentUser});
				} else {

					//	Otherwise, render the sorry page:
					res.render('sorry');
				};
				};
			};
		} else {
			//	If inquiry resolves false, render sorry:
			console.log("There was an error getting inquiry.");
			res.render('sorry');
			};

		} catch(e) {
			console.log(e.message);
			next(e);
		};
	});


//	Route to get contact page:
app.get('/contact', async (req, res, next) => {

	try {

		res.render('contact');

	} catch(e) {
		console.error(e);
		next(e);
	};

});



};	//	End of module exports