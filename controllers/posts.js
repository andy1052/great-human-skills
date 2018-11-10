/*
*
*
*	Routes logic for main blog pages
*
*/


// export module, passing in express app variable:
exports = module.exports = function(app) {


	//	Homepage route:
	app.get('/', (req, res) => {
		res.render('home');
	});

};	//	End of module exports