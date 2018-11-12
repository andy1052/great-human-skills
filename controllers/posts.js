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
		console.log(currentUser);

		try{
			res.render('home', {currentUser});
		} catch(e) {
			console.err(e);
			return e;
		};
	});


	//	Another test route:
	app.get('/blog', async(req, res) => {
		try {
			res.render('blog');
		} catch(e) {
			console.log(e.stack);
			return e;
		}
	});



};	//	End of module exports