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
const dbFuncs = require('../database/dbFuncs');



//	Export the endpoints, passing in app from express:
exports = module.exports = function(app,) {

//	Get route for "file-practice.handlebars":
// app.get('/artImage', (req, res, next) => {

// 	console.log("Data passed from app.js after quillForm submit: ", req.user, req.body);

// 	//console.log("Req.user: ", req.user);
// if (req.user) {
// 	res.render('artImage');
// } else {
// 	res.redirect('/unauthorized');
// }
// });

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
app.post('/imgPractice', upload.single('img'), async (req, res, next) => {

		//	Sanitize Data:
let filename = req.file.filename;

		try {

			//	Initiate ObjectId:
			const ObjectId = require('mongodb').ObjectId;


			console.log("Req.Body from /imgPractice: ", req.body);
			console.log("Req.file from /imgPractice: ", req.file);

		//	Here you can place size restrictions:

			let stats = fs.statSync(req.file.path);
			let fileSizeInBytes = stats["size"];
			let sizeInMegaBytes = fileSizeInBytes / 1000000.0;

		if (sizeInMegaBytes <= 2.000000) {

			console.log("Stats: ", stats);
			console.log("fileSizeInMegabytes: ", fileSizeInBytes / 1000000.0);

			//	Save the path of this image file to the article id in articleContent.

			//	First you have to pass the articleId through req.body from hidden field in form.

			let articleMetaId = req.body.articleMetaId;

			//	Update articlesMeta with the image path so it can be recalled on init:
			const up = await dbFuncs.update({_id: ObjectId(articleMetaId)}, {"imagePath": filename}, 'articlesMeta');

			//	Throw error if update throws error:
			if (!up) throw new Error({"Error": "Path did not save to database"});

			//	Now that you have the meta data and an image, move on to the article content/ quill editor:
			//	Pass in articleMetaId
			res.render('quill', {"articleMetaId":  req.body.articleMetaId} );

		} else {
			res.render('artImage', {"imageSize": "Sorry, Images must be below 2mb in size."});
		}

		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});



};	//	End of module exports.