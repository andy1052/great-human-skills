/*
*
*
*	Routes logic for main blog pages
*
*/

//	Dependencies:
const dbFuncs = require('../database/dbFuncs');
const generator = require('../lib/htmlGenerator');


// export module, passing in express app variable:
exports = module.exports = function(app) {


	//	Homepage route:
	app.get('/', async (req, res, next) => {

		let currentUser = req.user;

		try{

			//	Fetch all articles based on "published" state:
			let find = await dbFuncs.findAll({"state": "published"}, 'articlesMeta').then((result) => {
				//console.log("result from app.get: ", result);
				return result;
			});


			//	Render homepage and pass in currentUser and all articles returned by find:
			res.render('home', {find, currentUser});
		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});



	//	Display single post route:
	app.get('/posts/:id', async (req, res, next) => {

		//	This ObjectId is NECESSARY if you want to search mongoDb by _id. _id is an ObjectId format
		//	Therefore, in order to pass it, you need to use mongoDb's ObjectId Constructor, as demonstrated 
		//	below. Very interesting and important lesson to remember. Now everything works!
		const ObjectId = require('mongodb').ObjectId;

		let currentUser = req.user;

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
	app.get('/unauthorized', (req, res) => {
		res.render('unauthorized');
	});



	//	Route to search for all articles matching specified category from homepage/articleshow Widget:
	app.post("/getCategory", async (req, res, next) => {

		//	Sanitize data:
		let catSearch = typeof(req.body.category) === "string" && req.body.category.trim().length > 0 && req.body.category.trim().length < 20 ? req.body.category.trim() : false;

		try {

			let currentUser = req.user;

console.log("catSearch from /getCategory: ", catSearch);

			//	Find the articles which match the search.
			let catFind = await dbFuncs.findAll({"category": catSearch}, 'articlesMeta');

console.log("catFind: ", catFind);

			if (!catFind) {

			} else {
				res.render('home', {catFind});
			}	

		} catch(e) {
			console.log(e.message);
			next(e);
		};
	});



/*****************************************************************************/
};	//	End of module exports