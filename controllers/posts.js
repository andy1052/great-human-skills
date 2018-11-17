/*
*
*
*	Routes logic for main blog pages
*
*/

//	Dependencies:
const dbFuncs = require('../database/dbFuncs');


// export module, passing in express app variable:
exports = module.exports = function(app) {


	//	Homepage route:
	app.get('/', async (req, res) => {

		let currentUser = req.user;

		try{

			//	Fetch all articles
			let find = await dbFuncs.findAll({}, 'articles').then((result) => {
				//console.log("result from app.get: ", result);
				return result;
			});



			//	Render homepage and pass in currentUser and all articles returned by find:
			res.render('home', {find, currentUser});
		} catch(e) {
			console.log(e.stack);
			return e;
		};
	});



	//	Display single post route:
	app.get('/posts/:id', async (req, res) => {

		//	This ObjectId is NECESSARY if you want to search mongoDb by _id. _id is an ObjectId format
		//	Therefore, in order to pass it, you need to use mongoDb's ObjectId Constructor, as demonstrated 
		//	below. Very interesting and important lesson to remember. Now everything works!
		const ObjectId = require('mongodb').ObjectId;

			try {
			//	First find the post:
			let post = await dbFuncs.find({_id: ObjectId(req.params.id)}, 'articles');

			//console.log("post: ", post.comments);

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
			res.render('articleShow', {post, "showComment": showComment});
		} catch(e) {
			console.log(e.stack);
			return e;
		};
	});



};	//	End of module exports