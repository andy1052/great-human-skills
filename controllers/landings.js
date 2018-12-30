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


//	Get Words are all you've got landing page:
app.get('/allYouveGot', (req, res, next) => {

	try {
		res.render('allYouveGot');
	} catch(e) {
		console.error(e);
		next(e);
	};
});



//	Route for books:
app.get('/books', (req, res, next) => {

	try {

		let currentUser = req.user;

		res.render('books', {currentUser});

	} catch(e) {
		console.error(e);
		next(e);
	};
});



};	//	End of module exports