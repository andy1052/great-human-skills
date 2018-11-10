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

//	Test route to insert into database and render homepage:
		const user =  {
			name: "Andre"
		};

		try{
			const add = await dbFuncs.insert(user, "test").then((result) => {
				if ({"n": 1, "ok": 1}) {
					console.log('Added to database');
					res.render('home');
				}
			});
		} catch(e) {
			console.err(e);
			return e;
		};
	});
//	End of test route.



};	//	End of module exports