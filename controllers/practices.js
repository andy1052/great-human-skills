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

//	Multer Function:
let storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '/home/andy/Desktop/great-human-skills/public/tempImages');
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
let filename = typeof(req.file.filename) === 'string' && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;

		//	Initiate ObjectId:
		const ObjectId = require('mongodb').ObjectId;

		try {

console.log("Req.user from /imgPractice: ", req.user);




		// 	console.log("Req.Body from /imgPractice: ", req.body);
		// 	console.log("Req.file from /imgPractice: ", req.file);

//	********** File system manipulation code below ********************************************************

		//	Locate the file that was updated:
		let location = '/home/andy/Desktop/great-human-skills/public/tempImages/' + filename;

		//	Analyze the file and perform various checks on the data:
		fs.readFile(location, function(err, data) {

				//	If there was an error, throw it.
				if (err) throw new Error({"Error": "Could not read uploaded file!"});

				// Check the file's size in megabytes, keep it under 2Mb maximum:
				const size = data.length / 1000000;

				//	If file size is above 2mb, throw error:
				if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

				//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
				const magic = data.readUIntBE(0,4).toString(16);

				//	Check the results against a list held in helper function:
				helpers.checkFiletype(magic, (err, result) => {

				//	If there's an error, throw new error:
				if (err) throw new Error({"Error": "Cannot find specified file type!"});

				//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
				let baseDir = path.join(__dirname, "/../public");

				//	Open the directory, passing in newImage variableL
				 fs.open(baseDir + '/artImages' + '/' + filename, 'wx', (err, fd) => {
					
						//	If err, throw it:
						if (err) throw new Error({"Error": "Could not get file descriptor!"});

						//	Otherwise, write the file to profiles directory:
						fs.writeFile(fd , data, (err) => {

									//	If err, return it:
									if (err) {
									console.log("Err:", err.message);
									return err;
								} else {
									//	Otherwise, confirm the write....
									console.log("File was written to artImages!");

									//	And then delete the uploaded file from the tempImages directory:
									fs.unlink(location, (err) => {

										//	If err, return it.
										if (err) {
											console.log("Err in unlink: ", err.message);
											return err;
										} else {

											//	Otherwise, confirm that all went well:
											console.log("File was deleted from tempImages!");
										};
									});
								};
							});
						 });
					});
				}); //	End of file system manipulation code *********************************************



		// //	Here you can place size restrictions:

		// 	let stats = fs.statSync(req.file.path);
		// 	let fileSizeInBytes = stats["size"];
		// 	let sizeInMegaBytes = fileSizeInBytes / 1000000.0;

		// if (sizeInMegaBytes <= 2.000000) {

		// 	console.log("Stats: ", stats);
		// 	console.log("fileSizeInMegabytes: ", fileSizeInBytes / 1000000.0);

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

		// } else {
		// 	res.render('artImage', {"imageSize": "Sorry, Images must be below 2mb in size."});
		// }

		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});



};	//	End of module exports.