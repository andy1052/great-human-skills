/*
*
*
*	Server logic for great-human-skills app
*
*/


//	Dependencies:
const express = require('express');
const exphbs = require('express-handlebars');

//	Initialize app:
const app = express();


//	Set template engine to handlebars:
app.engine('handlebars', exphbs({defaultLayout: 'default'}));
app.set('view engine', 'handlebars');



//	Connect Routes from posts.js, pass the app variable into the file as well:
const posts = require('./controllers/posts')(app);



app.listen(3000, () => {
	console.log('Server running on port 3000');
});


