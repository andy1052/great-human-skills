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
	app.get('/', async (req, res, next) => {

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
			next(e);
		};
	});



	//	Display single post route:
	app.get('/posts/:id', async (req, res, next) => {

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
			next(e);
		};
	});


	//	"Unauthorized" Get Route:
	app.get('/unauthorized', (req, res) => {
		res.render('unauthorized');
	});

/***************************************************************************/

	//	Route to practice quill editor page:
	app.get("/quill", (req, res) => {
		res.render('quill');
	});


	//	Route to practice post quill editor form:
	app.post("/quillForm", async (req, res, next) => {
		try {
			console.log("You posted to /quillForm");
			console.log("req.body:" , req.body.ops);
			console.log(typeof req.body);
			console.log(req.method);
		//	res.json({greeting: "hello"});

			const saveIt = await dbFuncs.insert(req.body, "quillTest");

			if (!saveIt) throw new Error({"Error": "no save it"});

			console.log("saved it!");

//	Just to see what comes back:*****************************************************
			const retrieveTest = await dbFuncs.find(req.body, "quillTest");

		// 	console.log("retrieveTest: ", retrieveTest.ops);
		// //	console.log("retrieveTest Length: ". retrieveTest.length);
		// 	console.log("retrieveTest ops length: ", retrieveTest.ops.length);
		// 	console.log("retrieveTest.ops.insert; ", retrieveTest.ops[0].insert);
		// 	console.log("retrieveTest.ops.attributes: ", retrieveTest.ops[0]);

let result = "";

			const each = retrieveTest.ops.forEach((e, i) => {
// 				console.log("e: ", e); //	Object
// 				console.log("I: ", i);	//	Index number
// 				console.log("E equals: ", typeof(e)); //	object
// 				console.log("e.attributes: ", e.attributes);
// 				console.log("e.insert: ", e.insert);
// 				console.log("\n \n \n");
// 			//	console.log("Has own Property: ", e.attributes.hasOwnProperty("bold"));
// console.log("\n \n \n");

				if (e.attributes) {



				if (e.attributes.hasOwnProperty('bold')) {
					console.log("Attribute equals bold \n");	

					result += "<strong>" + e.insert + "</strong>" + " ";

				} else if (e.attributes.hasOwnProperty('italic')) {
					console.log("Attribute equals italic \n");

					result += "<em>" + e.insert + "</em>" + " ";

				} else if (e.attributes.hasOwnProperty('italic' && 'bold')) {
					console.log("Attribute has both bold and italic \n");

					result += "<strong>" + "<em>" + e.insert + "</em>" + "</strong>" + " ";
				};


				// Main if ends here:
				} else {
						console.log("Just a regular string \n");

					result += e.insert + " ";

					 }	
				});

			//	Make the html template string and concat result string:
			const derek = '<div class="container">' + '<div class="row">' + '<p>' + result + '</p>' + '</div>' + '</div>';

			//	Send template string back to front end:
			res.json(derek);



		} catch(e) {
			console.log(e.stack);
			next(e);
		}
	});



//	Get Route for QuillHtml:
app.get("/quillHtml", (req, res, next) => {
	res.render("quillHtml");
});

/*****************************************************************************/
};	//	End of module exports