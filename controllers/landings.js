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
app.get('/allYouveGot', async (req, res) => {
	res.render('allYouveGot');
});


};	//	End of module exports