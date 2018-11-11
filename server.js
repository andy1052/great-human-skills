/*
*
*
*	Server logic for great-human-skills app
*
*/


//	Dependencies:
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const database = require('./database/db');

//	Initialize app:
const app = express();

//	Initialize database:
(async function() {
	try {
		let con = await database.Get().then(() => app.listen(3000, () => {
			console.log('Server running on port 3000');
		}));
		if (!con) throw err;

	} catch(e) {
		console.log(e);
		return e;
	}
}());



//	Set template engine to handlebars:
app.engine('handlebars', exphbs({defaultLayout: 'default'}));
app.set('view engine', 'handlebars');


//	This middleware is for cookies, place AFTER you initialize express:
// app.use(cookieParser());
//	This line MUST appear AFTER app = express(), but BEFORE your routes!:
app.use(bodyParser.urlencoded({ extended: true }));


//	Connect Routes from posts.js, pass the app variable into the file as well:
const posts = require('./controllers/posts')(app);

//	Connect Routes from auths.js, pass the app variable into the file as well:
const auths = require('./controllers/auths')(app);



// app.listen(3000, () => {
// 	console.log('Server running on port 3000');
// });


