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
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helpers = require('./lib/helpers');
const path = require('path');
const config = require('./config/config');
const helmet = require('helmet');
const logging = require('./lib/logging');

const helpers2 = require('./lib/helpers2');

//	Initialize app:
const app = express();

//	Initialize database:
(async function() {
	try {
		let con = await database.Get().then(() => app.listen(config.port, () => {
			console.log(`Server running on port ${config.port}`);
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

//	Proxy settings to get remote ip through ngnix:
app.set('trust proxy', true);



//	This is for helmet module to help secure the app against outside attacks:
app.use(helmet());
//	This is to serve static files:
app.use(express.static(path.join(__dirname, '/public')));
//	This middleware is for cookies, place AFTER you initialize express:
app.use(cookieParser());
//	This line MUST appear AFTER app = express(), but BEFORE your routes!:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//	This is your custom middleware written in helpers module:
app.use(helpers.checkAuth);
//	This is your custom logger to track all app activity:
app.use(logging.logRequestStart);


//	Log Rotation:
if (process.env.NODE_ENV === 'production') {
	//	Rotate logs immediately upon start up / crash recovery:
	helpers.rotateLogs();

	//	Then rotate logs every day after that:
	helpers.logRotationLoop();

} else {
	if (process.env.NODE_ENV === 'testing') {
		console.info('App is running in Testing Mode');
	} else {
	console.info('App is running in Development Mode');
	}
};



//	Connect Routes from posts.js, pass the app variable into the file as well:
const posts = require('./controllers/posts')(app);

//	Connect Routes from auths.js, pass the app variable into the file as well:
const auths = require('./controllers/auths')(app);

//	Connect Routes from blogs.js, pass the app variable into the file as well:
const blogs = require('./controllers/blogs')(app);

//	Connect Routes from comments.js, pass the app variable into the file as well:
const comments = require('./controllers/comments')(app);

//	Connect Routes from landings.js, pass the app variable into the file as well:
const landings = require('./controllers/landings')(app);

//	Connect Routes from practices.js, pass the app variable into the file as well:
const practices = require('./controllers/practices')(app);

//	Connect Route from emails.js, pass the app variable into the file as well:
const emails = require('./controllers/emails')(app);

