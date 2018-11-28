/*
*
*
*	Logic for handling comments on site
*
*/



//	Dependencies:
const dbFuncs = require('../database/dbFuncs');



//	Export module functions, passing in server.js app variable:
exports = module.exports = function (app) {


//	Add A New Comment Route:
app.post('/newComment', async (req, res, next) => {


	console.log("/newComment req.body: ", req.body);
	console.log("/newComment req.user: ", req.user);

//	Require the mongodb ObjectId Type in order to find article in "v" variable below:
const ObjectId = require('mongodb').ObjectId;

	try {
//	Only allow comments by logged in users, otherwise send them to unauthorized page.
		if (req.user) {

			//	First sanitize the data:
			let userId = typeof(req.user.username) === "string" && req.user.username.trim().length > 0 && req.user.username.trim().length < 60 ? req.user.username.trim() : false;
			let comment = typeof(req.body.comment) === "string" && req.body.comment.length > 0 && req.body.comment.length < 1000 ? req.body.comment : false;
			let articleId = typeof(req.body.articleId) === "string" && req.body.articleId.length > 0 && req.body.articleId.length < 100 ? req.body.articleId : false;


console.log("SANITIZED DATA: ", userId, comment, articleId);

			// If all fields are present:
			if (userId && comment && articleId) {

				//	First make an object:
				const words = {
					userId,
					comment,
					articleId,
					"postedOn": Date()
				};
console.log("CONST WORDS: ", words);

				//	The save the words object in the "comments" collection:
				let w = await dbFuncs.insert(words, 'comments');
console.log("W AWAIT: ", w);				

				// Check that the operation went through:
				if (!w) throw new Error({"Error": "Something went wrong while trying to save comments"});

				//	The inserted object returns a cursor, so you get individual values, like the _id, as follows:
				let commentId = w.ops[0]._id;

				//	Otherwise, update the article.comment array in the "articles" collection with the comment.
				 let v = await dbFuncs.arrayUpdate({"articleId": articleId}, {"comments": commentId}, 'articleContent');
console.log("V AWAIT: ", v);
				 //	Check that the operation went through:
				 if (!v) throw new Error({"Error": "Something went wrong while updating articleId array"});

				 //	Now, add the commentId to an array attached to the client profile as well as the articleId that were commented on:
				 let u = await dbFuncs.arrayUpdate({"email": req.user.email}, {"comments": commentId, "articlesCommentedOn": articleId}, 'client');
console.log("U AWAIT: ", u);
				 //	Check that the operation went through:
				 if (!u) throw new Error({"Error": "Something went wrong while updating client 'comments' array"});

				 //	Now add the comment id to articleMeta:
				 let o = await dbFuncs.arrayUpdate({"_id" : ObjectId(articleId)}, {"comments": commentId}, 'articlesMeta').then((res) => {
				 	console.log("res: ", res);
				 	return res;
				 });
console.log("O AWAIT: ", o);

				 //	Check that the operation went through:
				 if (!o) throw new Error({"Error": "Something went wrong saving comments to articleMeta"});

				 //	Finally, re-render the page in order to show the comment:
				 res.redirect(`/posts/${articleId}`);

			} else {
				return res.redirect('/unauthorized');
			}


		} else {
			return res.redirect('/unauthorized');
		}
	} catch(e) {
		console.log(e.stack);
		next(e);
	};

});





}; //	End of module.exports
