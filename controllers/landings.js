/*
*
*
*	Logic for landing pages
*
*
*/


//	Dependencies:



//	Export module, passing in app variable:
exports = module.exports = function(app) {



//	Route for wordsAd:
app.get('/wordsAd', (req, res, next) => {
	try {
		res.render('wordsAd');
	} catch(e) {
		console.error(e);
		next(e);
	};
});



};	//	End of module exports