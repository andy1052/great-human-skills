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
	res.render('allYouveGot');
});



//	Route for books:
app.get('/books', (req, res, next) => {

	let currentUser = req.user;

	res.render('books', {currentUser});
});



};	//	End of module exports