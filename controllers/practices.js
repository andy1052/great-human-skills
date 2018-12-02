/*
*
*
*	Practice using file system to manipulate image and file data
*
*
*/

//	Dependencies:
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');



//	Export the endpoints, passing in app from express:
exports = module.exports = function(app,) {

//	Get route for "file-practice.handlebars":
app.get('/file-practice', (req, res, next) => {
	res.render('file-practice');
});

//	************* IMG UPLOAD ***********************************************

// console.log("Dirname: ", process.cwd() + '/public/artImages');

//	Multer Function:
let storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '/home/andy/Desktop/great-human-skills/public/artImages');
	},
	filename: function(req, file, cb) {
		//	Create a random 31 character string: 
		crypto.randomBytes(31, (err, buf) => {
			cb(null, buf.toString("hex") + path.extname(file.originalname));
		});
		//cb(null, file.fieldname + '-' + Date.now() + '.jpg')
	}
});


//	Multer Function:
let upload = multer({storage: storage,
	onFileUploadStart: function(file) {
		console.log(file.originalname + ' is starting ...');
	}
});


//	Post Route for /imgPractice:
app.post('/imgPractice', upload.single('img'), (req, res, next) => {

		//	Sanitize Data:

		try {

			console.log("Req.Body from /imgPractice: ", req.body);
			console.log("Req.file from /imgPractice: ", req.file);

return false;

		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});



};	//	End of module exports.