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


	//	Another test route:
	// app.get('/blog', async(req, res) => {
	// 	try {
	// 		res.render('blog');
	// 	} catch(e) {
	// 		console.log(e.stack);
	// 		return e;
	// 	}
	// });



};	//	End of module exports