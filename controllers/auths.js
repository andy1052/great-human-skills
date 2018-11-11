/*
*
*
*	Authentication Routes
*
*
*/


//	Dependencies:
const dbFuncs = require('../database/dbFuncs');



//	Routes:
module.exports = function(app) {


//	Sign-up route:
app.get('/sign-up', async (req, res) => {
	try {
		res.render('sign-up');
	} catch(e) {
		console.log(e.stack);
		return e;
	}
});


//	Sign-up Route:
app.post('/sign-up', async (req, res) => {

	//	Sanitize the data
	let email = typeof(req.body.email) === "string" && req.body.email.trim().length > 0 && req.body.email.trim().length < 80 && req.body.email.trim().includes('@') ? req.body.email.trim() : false;
	let password = typeof(req.body.password) === "string" && req.body.password.trim().length > 0 && req.body.password.trim().length < 60 ? req.body.password.trim() : false;


	try{
		//	Make model/object:
		const client = {
			email,
			password
		}

		//	First check to see if the email address already exists:
		let check = await dbFuncs.find(client, 'client').then((result) => {
			if (!result) {
				return;
			}
			console.log('User email already exists.');
			//*********** TODO ************
			//render a page here:
			res.send('Oops! This email address is already registered in our system.');
			return result;
		});

		if (!check == false) throw new Error({"Error": "This email already exists."});


		//	Save user to database in 'client' collection:
		let save = await dbFuncs.insert(client, 'client').then((result) => {
			if({"n":1, "ok":1}) {
			console.log("Saved to database!");
			res.redirect('/');
		} else {
			res.redirect('/sign-up');
		}
		});
	} catch(e) {
		console.log(e.stack);
		return e;
	}
});



//	Login Get Route:


//	Login Post Route:


};	//	End of module.exports